import { Link } from "wouter";
import { Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { addCartItem } from "../store/cartSlice";
import type { ProductWithSeller } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithSeller;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Failed to add to cart');
      return res.json();
    },
    onSuccess: (data) => {
      dispatch(addCartItem(data));
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });
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

  const getCategoryColor = (category: string) => {
    const colors = {
      clothing: "bg-blue-100 text-blue-800",
      electronics: "bg-purple-100 text-purple-800", 
      home: "bg-green-100 text-green-800",
      books: "bg-amber-100 text-amber-800",
      sports: "bg-orange-100 text-orange-800",
      music: "bg-pink-100 text-pink-800",
      toys: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";

  return (
    <Card className="product-card bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg" data-testid={`card-product-${product.id}`}>  
      <Link href={`/product/${product.id}`}>  
        <div className="relative cursor-pointer">
          <img 
            src={mainImage} 
            alt={product.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
            }}
          />
          {product.isEcoFriendly && (
            <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Eco-Friendly
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(product.category)}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
          <span className="text-muted-foreground text-xs" data-testid={`text-time-${product.id}`}>
            {getTimeAgo(product.createdAt!)}
          </span>
        </div>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1" data-testid={`text-title-${product.id}`}>{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary" data-testid={`text-price-${product.id}`}>{formatPrice(product.price)}</span>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground" data-testid={`text-views-${product.id}`}>{product.views || 0}</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          by {product.seller.firstName && product.seller.lastName 
            ? `${product.seller.firstName} ${product.seller.lastName}`
            : product.seller.username}
        </div>
        <Button
          className="mt-4 w-full"
          variant="default"
          onClick={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          disabled={mutation.isLoading}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {mutation.isLoading ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
