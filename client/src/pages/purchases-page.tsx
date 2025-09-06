import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, DollarSign, Leaf, Star, Package, MessageCircle, RotateCcw } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function PurchasesPage() {
  // Fetch user's orders
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return response.json();
    },
  });

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const co2Saved = totalOrders * 2.5; // Estimated CO2 savings
  const avgRating = 4.8; // Placeholder since we don't have this data

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMainImage = (images: string[] | null) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Purchase History</h1>
          <p className="text-muted-foreground">Track your sustainable shopping journey and previous orders</p>
        </div>
        
        {/* Purchase Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-orders">
                    {totalOrders}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-spent">
                    ${totalSpent.toFixed(0)}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-co2-saved">
                    {co2Saved.toFixed(1)}kg
                  </p>
                  <p className="text-muted-foreground text-sm">CO2 Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                  <p className="text-muted-foreground text-sm">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order History */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start shopping to see your purchase history here
                </p>
                <Button data-testid="button-start-shopping">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="p-6" data-testid={`order-${order.id}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground" data-testid={`text-order-id-${order.id}`}>
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Placed on {new Date(order.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground" data-testid={`text-order-total-${order.id}`}>
                      {formatPrice(order.totalAmount)}
                    </p>
                    <Badge className={getStatusColor(order.status || 'pending')}>
                      {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg"
                      data-testid={`order-item-${item.id}`}
                    >
                      <img 
                        src={getMainImage(item.product.images)} 
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground" data-testid={`text-item-title-${item.id}`}>
                          {item.product.title}
                        </h4>
                        <p className="text-muted-foreground text-sm capitalize">
                          {item.product.condition?.replace('-', ' ')} • {item.product.category}
                        </p>
                        <p className="text-primary font-semibold" data-testid={`text-item-price-${item.id}`}>
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button 
                          size="sm" 
                          className="mb-2"
                          data-testid={`button-rate-${item.id}`}
                        >
                          Rate Item
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-green-600">
                    <Leaf className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Saved {(order.orderItems.length * 2.5).toFixed(1)}kg CO2
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === 'shipped' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-track-${order.id}`}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Track Package
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-contact-seller-${order.id}`}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Seller
                    </Button>
                    {order.status === 'delivered' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-primary"
                        data-testid={`button-reorder-${order.id}`}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {/* Load More */}
        {orders.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              className="px-8 py-3"
              data-testid="button-load-more-orders"
            >
              Load More Orders
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
