import { users, products, cartItems, orders, orderItems, reviews } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

declare module "express-session" {
  interface SessionStore {
    // Add any custom session store methods if needed
  }
}
import { pool } from "./db";
import type {
  User,
  InsertUser,
  Product,
  InsertProduct,
  ProductWithSeller,
  CartItem,
  CartItemWithProduct,
  InsertCartItem,
  Order,
  OrderWithItems,
  InsertOrder,
  OrderItem,
  Review,
  InsertReview
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Products
  getProduct(id: string): Promise<ProductWithSeller | undefined>;
  getProducts(filters?: {
    category?: string;
    search?: string;
    sellerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithSeller[]>;
  createProduct(product: InsertProduct & { sellerId: string }): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  incrementProductViews(id: string): Promise<void>;

  // Cart
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(userId: string, item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Orders
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrders(userId: string): Promise<OrderWithItems[]>;
  createOrder(order: InsertOrder & { userId: string }, items: { productId: string; quantity: number; price: string }[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Reviews
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview & { userId: string }): Promise<Review>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Products
  async getProduct(id: string): Promise<ProductWithSeller | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        category: products.category,
        condition: products.condition,
        brand: products.brand,
        size: products.size,
        color: products.color,
        material: products.material,
        images: products.images,
        isEcoFriendly: products.isEcoFriendly,
        hasOriginalPackaging: products.hasOriginalPackaging,
        sellerId: products.sellerId,
        isActive: products.isActive,
        views: products.views,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.id, id));
    
    return product || undefined;
  }

  async getProducts(filters?: {
    category?: string;
    search?: string;
    sellerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithSeller[]> {
    let query = db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        category: products.category,
        condition: products.condition,
        brand: products.brand,
        size: products.size,
        color: products.color,
        material: products.material,
        images: products.images,
        isEcoFriendly: products.isEcoFriendly,
        hasOriginalPackaging: products.hasOriginalPackaging,
        sellerId: products.sellerId,
        isActive: products.isActive,
        views: products.views,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        seller: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.isActive, true));

    if (filters) {
      const conditions = [eq(products.isActive, true)];
      
      if (filters.category) {
        conditions.push(eq(products.category, filters.category as any));
      }
      
      if (filters.search) {
        conditions.push(
          or(
            ilike(products.title, `%${filters.search}%`),
            ilike(products.description, `%${filters.search}%`)
          )
        );
      }
      
      if (filters.sellerId) {
        conditions.push(eq(products.sellerId, filters.sellerId));
      }

      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(products.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async createProduct(product: InsertProduct & { sellerId: string }): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        price: product.price.toString(),
      })
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async incrementProductViews(id: string): Promise<void> {
    await db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(userId: string, item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, item.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values({ ...item, userId })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Orders
  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        createdAt: orderItems.createdAt,
        product: products,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return { ...order, orderItems: items };
  }

  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            createdAt: orderItems.createdAt,
            product: products,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return { ...order, orderItems: items };
      })
    );

    return ordersWithItems;
  }

  async createOrder(
    order: InsertOrder & { userId: string },
    items: { productId: string; quantity: number; price: string }[]
  ): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();

    // Insert order items
    await db.insert(orderItems).values(
      items.map(item => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview & { userId: string }): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }
}

export const storage = new DatabaseStorage();
