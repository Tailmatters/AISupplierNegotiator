import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PortersFiveForces } from "./porters-five-forces";
import { Info, AlertCircle } from "lucide-react";
import { CategorySelector } from '@/components/category/category-selector';

interface MarketAnalysisTabProps {
  onAnalysisComplete?: (analysisData: any) => void;
  initialCategory?: string;
  initialSubcategory?: string;
  initialSubcategoryLevel3?: string;
  initialDescription?: string;
}

export function MarketAnalysisTab({
  onAnalysisComplete,
  initialCategory = '',
  initialSubcategory = '',
  initialSubcategoryLevel3 = '',
  initialDescription = ''
}: MarketAnalysisTabProps) {
  const [category, setCategory] = useState(initialCategory);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [subcategoryLevel3, setSubcategoryLevel3] = useState(initialSubcategoryLevel3);
  const [description, setDescription] = useState(initialDescription);
  const [activeTab, setActiveTab] = useState("portersFiveForces");
  const { toast } = useToast();

  // Handle category changes from the CategorySelector
  const handleCategoryChange = useCallback((data: {
    level1?: string;
    level2?: string;
    level3?: string;
    description?: string;
  }) => {
    setCategory(data.level1 || '');
    setSubcategory(data.level2 || '');
    setSubcategoryLevel3(data.level3 || '');
    if (data.description) {
      setDescription(data.description);
    }
  }, []);

  // Handle completion of Porter's Five Forces analysis
  const handlePortersAnalysisComplete = useCallback((analysis: any) => {
    if (onAnalysisComplete) {
      onAnalysisComplete({
        type: 'portersFiveForces',
        data: analysis,
        category,
        subcategory,
        subcategoryLevel3,
        description
      });
    }

    toast({
      title: "Market Analysis Saved",
      description: "The Porter's Five Forces analysis has been saved and will be used for negotiation.",
    });
  }, [category, subcategory, subcategoryLevel3, description, onAnalysisComplete, toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
          <CardDescription>
            Analyze market dynamics to inform your negotiation strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Market analysis helps optimize negotiation strategies</AlertTitle>
            <AlertDescription>
              Understanding market forces gives you leverage in negotiations. The analysis results will be used by the AI negotiator to fine-tune automated negotiations with suppliers.
            </AlertDescription>
          </Alert>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Select Category</h3>
            <CategorySelector 
              initialCategory={category}
              initialSubcategory={subcategory}
              initialSubcategoryLevel3={subcategoryLevel3}
              description={description}
              onCategoryChange={(data) => {
                handleCategoryChange({
                  level1: data.category,
                  level2: data.subcategory,
                  level3: data.subcategoryLevel3,
                  description: description
                });
              }}
            />
          </div>

          {!category && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Category Required</AlertTitle>
              <AlertDescription>
                Please select a category before proceeding with market analysis.
              </AlertDescription>
            </Alert>
          )}

          {category && (
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="portersFiveForces">Porter's Five Forces Analysis</TabsTrigger>
                {/* Additional tabs can be added here in the future */}
              </TabsList>
              
              <TabsContent value="portersFiveForces" className="mt-4">
                <PortersFiveForces
                  category={category}
                  subcategory={subcategory}
                  subcategoryLevel3={subcategoryLevel3}
                  description={description}
                  onAnalysisComplete={handlePortersAnalysisComplete}
                />
              </TabsContent>
              
              {/* Additional tab content can be added here in the future */}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}