import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Eye, Edit, Trash2, Package, BarChart3, Heart, Check } from "lucide-react";
import type { ProductWithSeller } from "@shared/schema";

export default function MyListingsPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch user's products
  const { data: userProducts = [], isLoading } = useQuery<ProductWithSeller[]>({
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

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Your listing has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = userProducts.filter(product => {
    if (statusFilter === "active") return product.isActive;
    if (statusFilter === "sold") return !product.isActive;
    return true;
  });

  const activeListings = userProducts.filter(p => p.isActive).length;
  const soldItems = userProducts.filter(p => !p.isActive).length;
  const totalViews = userProducts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalFavorites = 24; // Placeholder since we don't have this data

  const handleDelete = (productId: string) => {
    deleteProductMutation.mutate(productId);
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Listings</h1>
            <p className="text-muted-foreground">Manage your product listings and track their performance</p>
          </div>
          <Button 
            onClick={() => setLocation('/add-product')}
            className="flex items-center gap-2"
            data-testid="button-add-new-item"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </div>
        
        {/* Listings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-active-count">
                    {activeListings}
                  </p>
                  <p className="text-muted-foreground text-sm">Active Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-views">
                    {totalViews.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalFavorites}</p>
                  <p className="text-muted-foreground text-sm">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-sold-count">
                    {soldItems}
                  </p>
                  <p className="text-muted-foreground text-sm">Sold Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Listings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Products</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                    <div className="w-16 h-16 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {statusFilter === "all" ? "No listings yet" : `No ${statusFilter} listings`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter === "all" 
                    ? "Create your first listing to start selling" 
                    : `You don't have any ${statusFilter} listings`}
                </p>
                {statusFilter === "all" && (
                  <Button 
                    onClick={() => setLocation('/add-product')}
                    data-testid="button-create-first-listing"
                  >
                    Create Your First Listing
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                    data-testid={`listing-${product.id}`}
                  >
                    {/* Product Image */}
                    <img 
                      src={getMainImage(product.images)} 
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                      }}
                    />
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate" data-testid={`text-listing-title-${product.id}`}>
                          {product.title}
                        </h3>
                        <Badge className="bg-accent/10 text-accent text-xs">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Listed {getTimeAgo(product.createdAt!)}
                      </p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <p className={`font-semibold ${product.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`} data-testid={`text-listing-price-${product.id}`}>
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    
                    {/* Status */}
                    <div>
                      <Badge 
                        className={product.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                        }
                      >
                        {product.isActive ? "Active" : "Sold"}
                      </Badge>
                    </div>
                    
                    {/* Views */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-muted-foreground text-sm" data-testid={`text-listing-views-${product.id}`}>
                        {product.views || 0} views
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/product/${product.id}`)}
                        data-testid={`button-view-${product.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {product.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
