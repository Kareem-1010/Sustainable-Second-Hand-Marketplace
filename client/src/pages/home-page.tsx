import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setCartItems } from "../store/cartSlice";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import CartSidebar from "../components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ProductWithSeller, CartItemWithProduct } from "@shared/schema";
import { Leaf } from "lucide-react";

const categories = [
  { value: "", label: "All Items" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home & Garden" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports" },
  { value: "music", label: "Music" },
  { value: "toys", label: "Toys" },
  { value: "other", label: "Other" },
];

export default function HomePage() {
  const [location, setLocation] = useLocation();
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const category = params.get('category') || '';
    const search = params.get('search') || '';
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [location]);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/products", { category: selectedCategory, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
  });

  // Fetch cart items
  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }
        throw new Error('Failed to fetch cart');
      }
      
      return response.json();
    },
  });

  // Update Redux store with cart items
  useEffect(() => {
    dispatch(setCartItems(cartItems));
  }, [cartItems, dispatch]);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (searchQuery) params.append('search', searchQuery);
    
    const newLocation = params.toString() ? `/?${params.toString()}` : '/';
    setLocation(newLocation);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      default:
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      
      <main>
        {/* Hero Section */}
        <section
          className="relative py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10"
          style={{
            backgroundImage: "url('/assets/back.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find Sustainable Treasures
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover unique second-hand items, reduce waste, and give pre-loved products a new life in our sustainable marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/add-product')}
                className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90"
                data-testid="button-start-selling"
              >
                Start Selling
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-3"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-card border-b border-border py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2" data-testid="category-filters">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.value)}
                    className="rounded-full"
                    data-testid={`filter-${category.value || 'all'}`}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Sort by: Latest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {searchQuery && (
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Search results for: <span className="font-medium text-foreground">"{searchQuery}"</span>
                </p>
              </div>
            )}
            
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                    <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory 
                    ? "Try adjusting your search or filters"
                    : "Be the first to list a product!"}
                </p>
                <Button 
                  onClick={() => setLocation('/add-product')}
                  data-testid="button-add-first-product"
                >
                  Add Product
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Load More Button */}
                {products.length >= 20 && (
                  <div className="text-center mt-12">
                    <Button 
                      variant="outline"
                      className="px-8 py-3"
                      data-testid="button-load-more"
                    >
                      Load More Products
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
