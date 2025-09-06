import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { addCartItem } from "../store/cartSlice";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Heart, Share, ShoppingCart, Star, Leaf, Eye } from "lucide-react";
import type { ProductWithSeller, Review } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product details
  const { data: product, isLoading } = useQuery<ProductWithSeller>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch product reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/products", id, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}/reviews`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        return [];
      }
      
      return response.json();
    },
    enabled: !!id,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    addToCartMutation.mutate();
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  };

  const getUserInitials = (seller: any) => {
    if (seller?.firstName && seller?.lastName) {
      return `${seller.firstName[0]}${seller.lastName[0]}`.toUpperCase();
    }
    if (seller?.username) {
      return seller.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (seller: any) => {
    if (seller?.firstName && seller?.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller?.username || "Unknown User";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="w-full h-96 bg-muted rounded-xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-full h-20 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-12 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">Product not found</h2>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop"];

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-6 flex items-center gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={images[selectedImageIndex]} 
                alt={product.title}
                className="w-full h-96 object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop";
                }}
                data-testid="img-product-main"
              />
              {product.isEcoFriendly && (
                <div className="absolute top-4 left-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Leaf className="h-4 w-4 inline mr-1" />
                  Eco-Friendly
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-full h-20 object-cover rounded-lg border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-border opacity-60 hover:opacity-100'
                    }`}
                    data-testid={`button-image-${index}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-accent/10 text-accent">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Badge>
                <span className="text-muted-foreground text-sm" data-testid="text-posted-time">
                  Posted {getTimeAgo(product.createdAt!)}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-product-title">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-primary" data-testid="text-product-price">
                  {formatPrice(product.price)}
                </span>
                
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground ml-2" data-testid="text-review-count">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span data-testid="text-view-count">{product.views || 0} views</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-product-description">
                  {product.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {product.condition && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Condition</h4>
                    <p className="text-muted-foreground capitalize" data-testid="text-condition">
                      {product.condition.replace('-', ' ')}
                    </p>
                  </div>
                )}
                
                {product.brand && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Brand</h4>
                    <p className="text-muted-foreground" data-testid="text-brand">{product.brand}</p>
                  </div>
                )}
                
                {product.size && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Size</h4>
                    <p className="text-muted-foreground" data-testid="text-size">{product.size}</p>
                  </div>
                )}
                
                {product.material && (
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Material</h4>
                    <p className="text-muted-foreground" data-testid="text-material">{product.material}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Seller Info */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getUserInitials(product.seller)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-foreground" data-testid="text-seller-name">
                    {getDisplayName(product.seller)}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Member since {new Date(product.seller.id).getFullYear()} {/* Placeholder */}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending || product.sellerId === user?.id}
                  className="flex-1 flex items-center justify-center gap-2"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.sellerId === user?.id ? "Your Product" : "Add to Cart"}
                </Button>
                
                <Button variant="outline" size="icon" data-testid="button-favorite">
                  <Heart className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="icon" data-testid="button-share">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Sustainability Impact */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  Sustainability Impact
                </h4>
                <p className="text-muted-foreground text-sm">
                  By purchasing this item, you're helping reduce waste and extending the life cycle of quality products. 
                  This saves approximately 2.5kg of CO2 emissions compared to buying new.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6" data-testid={`review-${review.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {review.userId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">Anonymous User</h4>
                        <div className="flex text-yellow-400 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {getTimeAgo(review.createdAt!)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>
                      {review.comment}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
