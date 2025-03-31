import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: number;
  name: string;
  category: string;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  supplierId: z.string().min(1, { message: "Please select a supplier" }),
  objectives: z.string().min(10, { message: "Objectives must be at least 10 characters" }),
});

export function NewNegotiation() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      supplierId: "",
      objectives: "",
    },
  });

  // Fetch suppliers
  const { data: suppliers, isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  // Get unique categories from suppliers
  const categories = suppliers 
    ? [...new Set(suppliers.map(supplier => supplier.category))]
    : [];

  // Filter suppliers by selected category
  const filteredSuppliers = suppliers?.filter(
    supplier => !form.watch("category") || supplier.category === form.watch("category")
  );

  // Create negotiation mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("supplierId", data.supplierId);
      formData.append("objectives", data.objectives);
      
      if (selectedFile) {
        formData.append("pastData", selectedFile);
      }
      
      const res = await fetch("/api/negotiations", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create negotiation");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      toast({
        title: "Negotiation created",
        description: "Your negotiation has been created successfully.",
      });
      navigate(`/negotiations/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>New Negotiation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Negotiation Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IT Hardware Procurement Q3 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliersLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!form.watch("category")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          form.watch("category") 
                            ? "Select a supplier" 
                            : "Select a category first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliersLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                          <span>Loading suppliers...</span>
                        </div>
                      ) : filteredSuppliers?.length === 0 ? (
                        <div className="p-2 text-center text-neutral-500">
                          No suppliers in this category
                        </div>
                      ) : (
                        filteredSuppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block mb-2">Past Negotiation Data (Optional)</FormLabel>
              <FileUpload 
                onFileSelect={(file) => setSelectedFile(file)}
                label="past negotiation data"
              />
            </div>
            
            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Negotiation Objectives</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Reduce pricing by 10%, improve delivery terms, extend payment terms to 60 days..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Creating Negotiation...
                </>
              ) : (
                "Create Negotiation"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
