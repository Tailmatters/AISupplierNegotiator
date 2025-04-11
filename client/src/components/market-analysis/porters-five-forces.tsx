import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, RefreshCw, Settings, Check, FileEdit, Save } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Type for Porter's Five Forces analysis
interface PortersForcesAnalysis {
  threatOfNewEntrants: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  bargainingPowerOfBuyers: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  threatOfSubstitutes: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  bargainingPowerOfSuppliers: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  competitiveRivalry: {
    level: 'Low' | 'Medium' | 'High';
    analysis: string;
    implications: string[];
  };
  overallAssessment: string;
  negotiationStrategies: string[];
}

// Props definition for the component
interface PortersFiveForcesProps {
  category: string;
  subcategory?: string;
  subcategoryLevel3?: string;
  description?: string;
  onAnalysisComplete?: (analysis: PortersForcesAnalysis) => void;
  readOnly?: boolean;
}

export function PortersFiveForces({
  category,
  subcategory,
  subcategoryLevel3,
  description = '',
  onAnalysisComplete,
  readOnly = false
}: PortersFiveForcesProps) {
  const [descriptionText, setDescriptionText] = useState(description);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<PortersForcesAnalysis | null>(null);

  // Convert level to numeric value for chart
  const levelToValue = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'Low': return 1;
      case 'Medium': return 2;
      case 'High': return 3;
      default: return 0;
    }
  };

  // Format force data for chart
  const formatForceDataForChart = (analysis: PortersForcesAnalysis) => {
    return [
      { name: 'New Entrants', value: levelToValue(analysis.threatOfNewEntrants.level), label: analysis.threatOfNewEntrants.level },
      { name: 'Buyer Power', value: levelToValue(analysis.bargainingPowerOfBuyers.level), label: analysis.bargainingPowerOfBuyers.level },
      { name: 'Substitutes', value: levelToValue(analysis.threatOfSubstitutes.level), label: analysis.threatOfSubstitutes.level },
      { name: 'Supplier Power', value: levelToValue(analysis.bargainingPowerOfSuppliers.level), label: analysis.bargainingPowerOfSuppliers.level },
      { name: 'Rivalry', value: levelToValue(analysis.competitiveRivalry.level), label: analysis.competitiveRivalry.level },
    ];
  };

  // Get Porter's Five Forces analysis
  const analysisMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/porters-five-forces', {
        category,
        subcategory,
        subcategoryLevel3,
        description: descriptionText
      });
      return await res.json();
    },
    onSuccess: (data: PortersForcesAnalysis) => {
      toast({
        title: "Analysis Complete",
        description: "Porter's Five Forces analysis has been generated.",
      });
      setEditedAnalysis(data);
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to regenerate the analysis
  const regenerateAnalysis = () => {
    analysisMutation.mutate();
  };

  // Function to toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  // Function to save edited analysis
  const saveEditedAnalysis = () => {
    if (editedAnalysis && onAnalysisComplete) {
      onAnalysisComplete(editedAnalysis);
      setIsEditing(false);
      toast({
        title: "Changes Saved",
        description: "Your changes to the Porter's Five Forces analysis have been saved.",
      });
    }
  };

  // Generate analysis on component mount if readOnly is false
  useEffect(() => {
    if (!readOnly && category && !editedAnalysis && !analysisMutation.isPending) {
      regenerateAnalysis();
    }
  }, [category, readOnly]);

  // Force level badge colors
  const getLevelBadgeColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'High': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return '';
    }
  };

  // Handle description text change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionText(e.target.value);
  };

  // Helper type guard function to check if object has force structure
  const isForceObject = (obj: any): obj is { level: 'Low' | 'Medium' | 'High', analysis: string, implications: string[] } => {
    return obj && typeof obj === 'object' && 'level' in obj && 'analysis' in obj && 'implications' in obj;
  };

  // Handle force level edit
  const handleForceLevelEdit = (
    force: keyof PortersForcesAnalysis,
    level: 'Low' | 'Medium' | 'High'
  ) => {
    if (editedAnalysis && isEditing) {
      const forceData = editedAnalysis[force];
      
      if (isForceObject(forceData)) {
        setEditedAnalysis({
          ...editedAnalysis,
          [force]: {
            ...forceData,
            level,
          },
        });
      }
    }
  };

  // Handle force analysis edit
  const handleForceAnalysisEdit = (
    force: keyof PortersForcesAnalysis,
    analysis: string
  ) => {
    if (editedAnalysis && isEditing) {
      const forceData = editedAnalysis[force];
      
      if (isForceObject(forceData)) {
        setEditedAnalysis({
          ...editedAnalysis,
          [force]: {
            ...forceData,
            analysis,
          },
        });
      }
    }
  };

  // Handle force implications edit
  const handleForceImplicationEdit = (
    force: keyof PortersForcesAnalysis,
    index: number,
    value: string
  ) => {
    if (editedAnalysis && isEditing) {
      const forceData = editedAnalysis[force];
      
      if (isForceObject(forceData) && Array.isArray(forceData.implications)) {
        const implications = [...forceData.implications];
        implications[index] = value;
        
        setEditedAnalysis({
          ...editedAnalysis,
          [force]: {
            ...forceData,
            implications,
          },
        });
      }
    }
  };

  // Handle overall assessment edit
  const handleOverallAssessmentEdit = (value: string) => {
    if (editedAnalysis && isEditing) {
      setEditedAnalysis({
        ...editedAnalysis,
        overallAssessment: value,
      });
    }
  };

  // Handle strategy edit
  const handleStrategyEdit = (index: number, value: string) => {
    if (editedAnalysis && isEditing) {
      const strategies = [...editedAnalysis.negotiationStrategies];
      strategies[index] = value;
      
      setEditedAnalysis({
        ...editedAnalysis,
        negotiationStrategies: strategies,
      });
    }
  };

  // Render force section
  const renderForce = (
    title: string,
    force: keyof PortersForcesAnalysis,
    data: {
      level: 'Low' | 'Medium' | 'High';
      analysis: string;
      implications: string[];
    }
  ) => {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title}</CardTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant={data.level === 'Low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleForceLevelEdit(force, 'Low')}
                >
                  Low
                </Button>
                <Button
                  variant={data.level === 'Medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleForceLevelEdit(force, 'Medium')}
                >
                  Medium
                </Button>
                <Button
                  variant={data.level === 'High' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleForceLevelEdit(force, 'High')}
                >
                  High
                </Button>
              </div>
            ) : (
              <Badge className={getLevelBadgeColor(data.level)}>{data.level}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={data.analysis}
              onChange={(e) => handleForceAnalysisEdit(force, e.target.value)}
              className="mb-4"
              rows={3}
            />
          ) : (
            <p className="mb-4">{data.analysis}</p>
          )}
          
          <h4 className="font-semibold text-sm mb-2">Implications for Negotiation:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {data.implications.map((implication, idx) => (
              <li key={idx} className="text-sm">
                {isEditing ? (
                  <Textarea
                    value={implication}
                    onChange={(e) => handleForceImplicationEdit(force, idx, e.target.value)}
                    className="my-1"
                    rows={2}
                  />
                ) : (
                  implication
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Category Context</CardTitle>
            <CardDescription>
              Provide additional context about the purchase to improve the accuracy of the Porter's Five Forces analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Purchase Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the specific purchase, products, or services you're seeking..."
                  value={descriptionText}
                  onChange={handleDescriptionChange}
                  rows={3}
                  disabled={analysisMutation.isPending}
                />
              </div>
              
              <Button 
                onClick={regenerateAnalysis} 
                disabled={analysisMutation.isPending || !category}
                className="w-full"
              >
                {analysisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {editedAnalysis ? 'Regenerate Analysis' : 'Generate Analysis'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(analysisMutation.isPending && !editedAnalysis) && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
          <p className="mt-4 text-muted-foreground">Generating Porter's Five Forces analysis...</p>
        </div>
      )}

      {editedAnalysis && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Porter's Five Forces Analysis</h2>
            {!readOnly && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={saveEditedAnalysis} variant="default">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button onClick={toggleEditing} variant="outline">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={toggleEditing} variant="outline">
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit Analysis
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Forces Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatForceDataForChart(editedAnalysis)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 3]} tickCount={4} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip
                        formatter={(value: number) => {
                          switch (value) {
                            case 1: return 'Low';
                            case 2: return 'Medium';
                            case 3: return 'High';
                            default: return '';
                          }
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#8884d8"
                        barSize={30}
                        radius={[0, 4, 4, 0]}
                      >
                        <LabelList dataKey="label" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedAnalysis.overallAssessment}
                      onChange={(e) => handleOverallAssessmentEdit(e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p>{editedAnalysis.overallAssessment}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Recommended Negotiation Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {editedAnalysis.negotiationStrategies.map((strategy, idx) => (
                      <li key={idx}>
                        {isEditing ? (
                          <Textarea
                            value={strategy}
                            onChange={(e) => handleStrategyEdit(idx, e.target.value)}
                            className="my-1"
                            rows={2}
                          />
                        ) : (
                          strategy
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              {renderForce('Threat of New Entrants', 'threatOfNewEntrants', editedAnalysis.threatOfNewEntrants)}
              {renderForce('Bargaining Power of Buyers', 'bargainingPowerOfBuyers', editedAnalysis.bargainingPowerOfBuyers)}
              {renderForce('Threat of Substitutes', 'threatOfSubstitutes', editedAnalysis.threatOfSubstitutes)}
              {renderForce('Bargaining Power of Suppliers', 'bargainingPowerOfSuppliers', editedAnalysis.bargainingPowerOfSuppliers)}
              {renderForce('Competitive Rivalry', 'competitiveRivalry', editedAnalysis.competitiveRivalry)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}