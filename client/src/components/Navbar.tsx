import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { toggleCart } from "../store/cartSlice";
import { useAuth } from "../hooks/use-auth";
import type { RootState } from "../store/store";
import { Search, ShoppingCart, Menu, Leaf, ChevronDown, User, Package, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { user, logoutMutation } = useAuth();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer" data-testid="logo">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">EcoFinds</span>
            </div>
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-full"
                data-testid="input-search"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                data-testid="button-search"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <span className={`text-foreground hover:text-primary transition-colors cursor-pointer ${location === '/' ? 'text-primary font-medium' : ''}`} data-testid="link-browse">
                Browse
              </span>
            </Link>
            <Link href="/add-product">
              <span className={`text-foreground hover:text-primary transition-colors cursor-pointer ${location === '/add-product' ? 'text-primary font-medium' : ''}`} data-testid="link-sell">
                Sell
              </span>
            </Link>
            <Link href="/dashboard">
              <span className={`text-foreground hover:text-primary transition-colors cursor-pointer ${location === '/dashboard' ? 'text-primary font-medium' : ''}`} data-testid="link-dashboard">
                Dashboard
              </span>
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleCart())}
              className="relative p-2"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="text-cart-count">
                  {totalItems}
                </span>
              )}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer" data-testid="link-profile">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/my-listings">
                  <DropdownMenuItem className="cursor-pointer" data-testid="link-listings">
                    <Package className="mr-2 h-4 w-4" />
                    My Listings
                  </DropdownMenuItem>
                </Link>
                <Link href="/purchases">
                  <DropdownMenuItem className="cursor-pointer" data-testid="link-purchases">
                    <History className="mr-2 h-4 w-4" />
                    Purchase History
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden p-2" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
