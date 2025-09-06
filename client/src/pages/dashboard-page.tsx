import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, BarChart3, DollarSign, TrendingUp, ShoppingCart, Star } from "lucide-react";
import { useLocation } from "wouter";
import type { ProductWithSeller, OrderWithItems } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Fetch user's products
  const { data: userProducts = [] } = useQuery<ProductWithSeller[]>({
    queryKey: ["/api/my-products"],
    queryFn: async () => {
      const response = await fetch("/api/my-products", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
  });

  // Fetch user's orders
  const { data: userOrders = [] } = useQuery<OrderWithItems[]>({
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

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || "User";
  };

  const activeListings = userProducts.filter(p => p.isActive).length;
  const soldItems = userProducts.filter(p => !p.isActive).length;
  const totalSales = userOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const thisMonthSales = userOrders.filter(order => {
    const orderDate = new Date(order.createdAt!);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;

  const recentActivity = [
    ...userProducts.slice(0, 2).map(product => ({
      type: 'listing',
      title: `New listing: ${product.title}`,
      subtitle: `$${product.price}`,
      time: new Date(product.createdAt!),
      icon: Plus,
    })),
    ...userOrders.slice(0, 2).map(order => ({
      type: 'sale',
      title: `Order completed`,
      subtitle: `$${order.totalAmount}`,
      time: new Date(order.createdAt!),
      icon: ShoppingCart,
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 3);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile and track your EcoFinds activity</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-foreground" data-testid="text-user-name">
                    {getDisplayName()}
                  </h2>
                  <p className="text-muted-foreground" data-testid="text-user-email">
                    {user?.email}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm">(4.9 rating)</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="text-foreground font-medium">
                      {new Date(user?.id || '').getFullYear() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Items sold</span>
                    <span className="text-foreground font-medium" data-testid="text-items-sold">
                      {soldItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">CO2 saved</span>
                    <span className="text-primary font-medium">
                      {(soldItems * 2.5).toFixed(1)} kg
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  data-testid="button-edit-profile"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Active Listings</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-active-listings">
                        {activeListings}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Sales</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-total-sales">
                        ${totalSales.toFixed(0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">This Month</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-month-sales">
                        {thisMonthSales}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                    <Button 
                      onClick={() => setLocation('/add-product')}
                      className="mt-4"
                      data-testid="button-create-first-listing"
                    >
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-3 hover:bg-muted/30 rounded-lg"
                        data-testid={`activity-${index}`}
                      >
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <activity.icon className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{activity.title}</p>
                          <p className="text-muted-foreground text-sm">
                            {getTimeAgo(activity.time)} • {activity.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/add-product')}
                    className="flex items-center gap-3 p-4 h-auto justify-start"
                    data-testid="button-list-new-item"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">List New Item</div>
                      <div className="text-muted-foreground text-sm">Add a product to sell</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/my-listings')}
                    className="flex items-center gap-3 p-4 h-auto justify-start"
                    data-testid="button-manage-listings"
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Manage Listings</div>
                      <div className="text-muted-foreground text-sm">Edit your products</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
