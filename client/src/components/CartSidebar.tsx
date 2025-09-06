import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setCartOpen, removeCartItem, updateCartItem } from "../store/cartSlice";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RootState } from "../store/store";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CartSidebar() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: (_, itemId) => {
      dispatch(removeCartItem(itemId));
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantity = (itemId: string, current: number, delta: number) => {
    const newQuantity = current + delta;
    if (newQuantity < 1) return;
    updateItemMutation.mutate({ itemId, quantity: newQuantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.product?.price || "0");
      return total + price * item.quantity;
    }, 0);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice);
  };

  const handleCheckout = () => {
    toast({
      title: "Coming Soon",
      description: "Checkout functionality will be implemented soon",
    });
  };

  const getMainImage = (images: string[] | null | undefined) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50" 
          onClick={() => dispatch(setCartOpen(false))}
          data-testid="cart-overlay"
        />
      )}
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 bg-card shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
        data-testid="cart-sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Shopping Cart</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => dispatch(setCartOpen(false))}
            className="p-2"
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Your cart is empty</p>
              <Button 
                variant="outline" 
                onClick={() => dispatch(setCartOpen(false))}
                className="mt-4"
                data-testid="button-browse-products"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                if (!item.product) return null;
                return (
                  <Card key={item.id} className="p-4" data-testid={`cart-item-${item.id}`}>
                    <div className="flex items-center space-x-4">
                      <img 
                        src={getMainImage(item.product.images)} 
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" data-testid={`text-cart-item-title-${item.id}`}>
                          {item.product.title}
                        </h3>
                        <p className="text-muted-foreground text-sm capitalize">
                          {item.product.condition} • {item.product.category}
                        </p>
                        <p className="font-semibold text-primary" data-testid={`text-cart-item-price-${item.id}`}>
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity, -1)}
                            className="w-8 h-8 p-0"
                            disabled={updateItemMutation.isPending}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity, 1)}
                            className="w-8 h-8 p-0"
                            disabled={updateItemMutation.isPending}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary" data-testid="text-cart-total">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <Button 
              className="w-full" 
              onClick={handleCheckout}
              disabled={items.length === 0}
              data-testid="button-checkout"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
