import { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { categoryHierarchy, findCategoryById, Category } from "@/data/category-hierarchy";
import { apiRequest } from "@/lib/queryClient";

interface CategorySelectorProps {
  initialCategory?: string;
  initialSubcategory?: string;
  initialSubcategoryLevel3?: string;
  description?: string;
  onCategoryChange?: (categories: {
    category: string;
    subcategory?: string;
    subcategoryLevel3?: string;
    categoryId?: string;
  }) => void;
  readOnly?: boolean;
}

export const CategorySelector = ({
  initialCategory,
  initialSubcategory,
  initialSubcategoryLevel3,
  description = "",
  onCategoryChange,
  readOnly = false,
}: CategorySelectorProps) => {
  const { toast } = useToast();
  
  // For the description field
  const [itemDescription, setItemDescription] = useState(description);
  
  // For category selection
  const [level1, setLevel1] = useState<string | undefined>(initialCategory);
  const [level2, setLevel2] = useState<string | undefined>(initialSubcategory);
  const [level3, setLevel3] = useState<string | undefined>(initialSubcategoryLevel3);
  
  // Get available options based on the parent selection
  const [level1Options] = useState(categoryHierarchy);
  const [level2Options, setLevel2Options] = useState<Category[]>([]);
  const [level3Options, setLevel3Options] = useState<Category[]>([]);
  
  // For auto-categorization
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [autoCategorized, setAutoCategorized] = useState(false);
  const [confidence, setConfidence] = useState(0);
  
  // Update level2 options when level1 changes
  useEffect(() => {
    if (level1) {
      const selectedCategory = level1Options.find(c => c.name === level1);
      setLevel2Options(selectedCategory?.children || []);
      
      // If current level2 is not in new options, reset it
      if (level2 && selectedCategory?.children && !selectedCategory.children.find(c => c.name === level2)) {
        setLevel2(undefined);
        setLevel3(undefined);
      }
    } else {
      setLevel2Options([]);
      setLevel2(undefined);
      setLevel3(undefined);
    }
  }, [level1, level1Options]);
  
  // Update level3 options when level2 changes
  useEffect(() => {
    if (level2) {
      const selectedCategory = level2Options.find(c => c.name === level2);
      setLevel3Options(selectedCategory?.children || []);
      
      // If current level3 is not in new options, reset it
      if (level3 && selectedCategory?.children && !selectedCategory.children.find(c => c.name === level3)) {
        setLevel3(undefined);
      }
    } else {
      setLevel3Options([]);
      setLevel3(undefined);
    }
  }, [level2, level2Options]);
  
  // Notify parent component when categories change
  useEffect(() => {
    if (onCategoryChange) {
      // Find the most specific category ID based on selections
      let categoryId = undefined;
      
      if (level1 && level2 && level3) {
        // Find level3 category ID
        const l1 = level1Options.find(c => c.name === level1);
        if (l1 && l1.children) {
          const l2 = l1.children.find(c => c.name === level2);
          if (l2 && l2.children) {
            const l3 = l2.children.find(c => c.name === level3);
            if (l3) categoryId = l3.id;
          }
        }
      } else if (level1 && level2) {
        // Find level2 category ID
        const l1 = level1Options.find(c => c.name === level1);
        if (l1 && l1.children) {
          const l2 = l1.children.find(c => c.name === level2);
          if (l2) categoryId = l2.id;
        }
      } else if (level1) {
        // Find level1 category ID
        const l1 = level1Options.find(c => c.name === level1);
        if (l1) categoryId = l1.id;
      }
      
      onCategoryChange({
        category: level1 || "",
        subcategory: level2,
        subcategoryLevel3: level3,
        categoryId,
      });
    }
  }, [level1, level2, level3, level1Options, onCategoryChange]);
  
  // Auto-categorize function
  const handleAutoCategorize = async () => {
    if (!itemDescription || itemDescription.trim() === "") {
      toast({
        title: "Description required",
        description: "Please enter a description to auto-categorize",
        variant: "destructive",
      });
      return;
    }
    
    setIsCategorizing(true);
    
    try {
      const response = await apiRequest("POST", "/api/categorize", {
        description: itemDescription
      });
      
      const data = await response.json();
      
      if (data.categoryId) {
        const categoryParts = data.categoryId.split("-");
        
        // Get the category info based on the returned ID
        if (categoryParts.length >= 1) {
          const l1 = categoryHierarchy.find(c => c.id === categoryParts[0]);
          if (l1) {
            setLevel1(l1.name);
            
            if (categoryParts.length >= 2) {
              const l2Id = `${categoryParts[0]}-${categoryParts[1]}`;
              const l2 = l1.children?.find(c => c.id === l2Id);
              if (l2) {
                setLevel2(l2.name);
                
                if (categoryParts.length >= 3) {
                  const l3Id = `${categoryParts[0]}-${categoryParts[1]}-${categoryParts[2]}`;
                  const l3 = l2.children?.find(c => c.id === l3Id);
                  if (l3) {
                    setLevel3(l3.name);
                  }
                }
              }
            }
          }
        }
        
        setAutoCategorized(true);
        setConfidence(data.confidence || 0);
        
        toast({
          title: "Auto-categorization complete",
          description: `Categorized with ${Math.round(data.confidence * 100)}% confidence`,
        });
      }
    } catch (error) {
      console.error("Auto-categorization failed", error);
      toast({
        title: "Auto-categorization failed",
        description: "Unable to categorize based on the description",
        variant: "destructive",
      });
    } finally {
      setIsCategorizing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Categorization</CardTitle>
        <CardDescription>
          Select the appropriate category or use auto-categorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Purchase Description</Label>
            <div className="flex gap-2">
              <Textarea
                id="description"
                placeholder="Enter a detailed description of the purchase..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="flex-1"
                disabled={readOnly}
              />
              {!readOnly && (
                <Button
                  onClick={handleAutoCategorize}
                  disabled={isCategorizing || !itemDescription}
                  variant="outline"
                  className="shrink-0"
                >
                  {isCategorizing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Auto Categorize
                </Button>
              )}
            </div>
            {autoCategorized && (
              <div className="flex items-center gap-2">
                <Badge variant={confidence > 0.7 ? "default" : "outline"}>
                  {confidence > 0.7 ? "High" : confidence > 0.4 ? "Medium" : "Low"} Confidence ({Math.round(confidence * 100)}%)
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Auto-categorized based on description
                </span>
              </div>
            )}
          </div>
          
          {/* Category Level 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level1">Level 1 Category</Label>
              <Select
                disabled={readOnly}
                value={level1}
                onValueChange={(value) => {
                  setLevel1(value);
                  setAutoCategorized(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {level1Options.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Category Level 2 */}
            <div className="space-y-2">
              <Label htmlFor="level2">Level 2 Category</Label>
              <Select
                disabled={readOnly || !level1 || level2Options.length === 0}
                value={level2}
                onValueChange={(value) => {
                  setLevel2(value);
                  setAutoCategorized(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={level1 ? "Select subcategory" : "Select level 1 first"} />
                </SelectTrigger>
                <SelectContent>
                  {level2Options.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Category Level 3 */}
            <div className="space-y-2">
              <Label htmlFor="level3">Level 3 Category</Label>
              <Select
                disabled={readOnly || !level2 || level3Options.length === 0}
                value={level3}
                onValueChange={(value) => {
                  setLevel3(value);
                  setAutoCategorized(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={level2 ? "Select subcategory" : "Select level 2 first"} />
                </SelectTrigger>
                <SelectContent>
                  {level3Options.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};