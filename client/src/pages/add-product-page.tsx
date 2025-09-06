import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Leaf } from "lucide-react";
import type { InsertProduct } from "@shared/schema";
import { z } from "zod";

const categories = [
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "home", label: "Home & Garden" },
  { value: "books", label: "Books" },
  { value: "sports", label: "Sports & Recreation" },
  { value: "music", label: "Music Instruments" },
  { value: "toys", label: "Toys & Games" },
  { value: "other", label: "Other" },
];

const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "very-good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

type ProductForm = z.infer<typeof insertProductSchema>;

export default function AddProductPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<ProductForm>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "clothing",
      condition: "excellent",
      brand: "",
      size: "",
      color: "",
      material: "",
      images: [],
      isEcoFriendly: false,
      hasOriginalPackaging: false,
      isActive: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const response = await apiRequest("POST", "/api/products", {
        ...data,
        images: uploadedImages,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      toast({
        title: "Product listed successfully",
        description: "Your item is now available for purchase",
      });
      setLocation("/my-listings");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create listing",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your product",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For demo purposes, we'll use placeholder URLs
    // In a real app, you'd upload to Cloudinary or similar service
    const newImages = Array.from(files).map((file, index) => {
      return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&v=${Date.now()}-${index}`;
    });

    setUploadedImages(prev => [...prev, ...newImages].slice(0, 4));
    toast({
      title: "Images uploaded",
      description: `${newImages.length} image(s) added successfully`,
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">List Your Item</h1>
          <p className="text-muted-foreground">Create a listing for your sustainable second-hand item</p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img 
                      src={image} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                      data-testid={`button-remove-image-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {uploadedImages.length < 4 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Add Photo</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      data-testid="input-image-upload"
                    />
                  </label>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Upload up to 4 photos. First photo will be the main image.
              </p>
            </CardContent>
          </Card>
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Vintage Denim Jacket - Size M"
                  {...form.register("title")}
                  data-testid="input-title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your item's condition, features, and any relevant details..."
                  {...form.register("description")}
                  data-testid="textarea-description"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={form.watch("category")} 
                    onValueChange={(value) => form.setValue("category", value as any)}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <Select 
                    value={form.watch("condition")} 
                    onValueChange={(value) => form.setValue("condition", value as any)}
                  >
                    <SelectTrigger data-testid="select-condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.condition && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.condition.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    {...form.register("price")}
                    data-testid="input-price"
                  />
                </div>
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Nike, Apple, IKEA"
                    {...form.register("brand")}
                    data-testid="input-brand"
                  />
                </div>
                
                <div>
                  <Label htmlFor="size">Size/Dimensions</Label>
                  <Input
                    id="size"
                    placeholder="e.g., Medium, 15 inches, 20cm x 30cm"
                    {...form.register("size")}
                    data-testid="input-size"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Blue, Black, Multi-color"
                    {...form.register("color")}
                    data-testid="input-color"
                  />
                </div>
                
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    placeholder="e.g., Cotton, Plastic, Wood"
                    {...form.register("material")}
                    data-testid="input-material"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sustainability Info */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Leaf className="h-5 w-5" />
                Sustainability Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="isEcoFriendly"
                  checked={form.watch("isEcoFriendly")}
                  onCheckedChange={(checked) => form.setValue("isEcoFriendly", !!checked)}
                  data-testid="checkbox-eco-friendly"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="isEcoFriendly" className="font-medium">
                    This item is eco-friendly
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Made from sustainable materials or processes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="hasOriginalPackaging"
                  checked={form.watch("hasOriginalPackaging")}
                  onCheckedChange={(checked) => form.setValue("hasOriginalPackaging", !!checked)}
                  data-testid="checkbox-original-packaging"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="hasOriginalPackaging" className="font-medium">
                    Original packaging available
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Includes original box, manuals, or accessories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createProductMutation.isPending}
              data-testid="button-list-item"
            >
              {createProductMutation.isPending ? "Creating listing..." : "List Item"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
