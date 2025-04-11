import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { MarketAnalysisTab } from "@/components/market-analysis/market-analysis-tab";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Info, Download, Share2 } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function MarketAnalysisPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("analyze");
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);

  // Handle saving the analysis to backend (can be implemented later)
  const handleAnalysisComplete = (analysisData: any) => {
    // In a real implementation, you might save this to the backend
    // For now, we'll just add it to the local state
    setSavedAnalyses(prev => [
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...analysisData
      },
      ...prev
    ]);

    toast({
      title: "Analysis Saved",
      description: "Your market analysis has been saved and can be used in negotiations.",
    });
  };

  // Function to export analysis as JSON
  const exportAnalysis = (analysis: any) => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `porters-five-forces-${analysis.category.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Market Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze market dynamics to optimize your negotiation strategy and gain deeper insights into supplier power dynamics.
        </p>
      </div>

      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="analyze">Analyze Market</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <MarketAnalysisTab onAnalysisComplete={handleAnalysisComplete} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Previous Analyses</CardTitle>
              <CardDescription>
                Review and reuse market analyses you've created previously
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedAnalyses.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No saved analyses</AlertTitle>
                  <AlertDescription>
                    You haven't created any market analyses yet. Switch to the "Analyze Market" tab to create your first analysis.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {savedAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              {analysis.category} {analysis.subcategory ? `> ${analysis.subcategory}` : ''}
                              {analysis.subcategoryLevel3 ? ` > ${analysis.subcategoryLevel3}` : ''}
                            </CardTitle>
                            <CardDescription>
                              {new Date(analysis.createdAt).toLocaleString()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => exportAnalysis(analysis)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                // This would be a mutation to link the analysis to a negotiation
                                toast({
                                  title: "Ready to Use",
                                  description: "You can now select this analysis when creating a new negotiation.",
                                });
                              }}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Use in Negotiation
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Overall Assessment</h4>
                            <p className="text-sm">{analysis.data.overallAssessment.slice(0, 150)}...</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Market Position</h4>
                            <div className="flex flex-wrap gap-2">
                              <div className="text-sm">
                                <span className="font-medium">Supplier Power:</span>{' '}
                                <span className={
                                  analysis.data.bargainingPowerOfSuppliers.level === 'High' 
                                    ? 'text-red-600' 
                                    : analysis.data.bargainingPowerOfSuppliers.level === 'Medium'
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                }>
                                  {analysis.data.bargainingPowerOfSuppliers.level}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Buyer Power:</span>{' '}
                                <span className={
                                  analysis.data.bargainingPowerOfBuyers.level === 'High' 
                                    ? 'text-green-600' 
                                    : analysis.data.bargainingPowerOfBuyers.level === 'Medium'
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                }>
                                  {analysis.data.bargainingPowerOfBuyers.level}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Top Strategy</h4>
                            <p className="text-sm">
                              {analysis.data.negotiationStrategies[0] || 'No strategies available'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}