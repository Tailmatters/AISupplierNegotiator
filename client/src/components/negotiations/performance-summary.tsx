import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Star, StarHalf, Sparkles, TrendingUp, BadgePercent, Smile, CheckCheck, Clock, ThumbsUp, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceSummaryProps {
  negotiationId: number;
  initialOffer: number;
  finalOffer: number;
  objectives: string;
  supplierName: string;
  category: string;
  currency?: string;
  unit?: string;
  onNegotiationConcluded?: () => void;
}

export function PerformanceSummary({
  negotiationId,
  initialOffer,
  finalOffer,
  objectives,
  supplierName,
  category,
  currency = "USD",
  unit,
  onNegotiationConcluded,
}: PerformanceSummaryProps) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const { toast } = useToast();

  // Calculate savings metrics
  const savingsAbsolute = initialOffer - finalOffer;
  const savingsPercentage = ((savingsAbsolute / initialOffer) * 100).toFixed(2);
  const isPositiveSavings = savingsAbsolute > 0;

  // Submit performance rating mutation
  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/negotiations/${negotiationId}/performance`, {
        rating,
        feedback,
        savingsAmount: savingsAbsolute,
        savingsPercentage: parseFloat(savingsPercentage),
      });
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback on the AI negotiator's performance.",
      });
      if (onNegotiationConcluded) {
        onNegotiationConcluded();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate stars for rating with improved descriptive labels
  const renderStars = () => {
    const ratingLabels = {
      1: { 
        label: "Poor", 
        description: "Did not meet objectives", 
        icon: <ThumbsUp className="h-4 w-4 text-red-500" />,
        color: "text-red-500 border-red-200 bg-red-50"
      },
      2: { 
        label: "Fair", 
        description: "Met few objectives", 
        icon: <Clock className="h-4 w-4 text-orange-500" />,
        color: "text-orange-500 border-orange-200 bg-orange-50"
      },
      3: { 
        label: "Good", 
        description: "Met most objectives", 
        icon: <Smile className="h-4 w-4 text-yellow-500" />,
        color: "text-yellow-600 border-yellow-200 bg-yellow-50"
      },
      4: { 
        label: "Very Good", 
        description: "Met all objectives", 
        icon: <CheckCheck className="h-4 w-4 text-green-500" />,
        color: "text-green-600 border-green-200 bg-green-50"
      },
      5: { 
        label: "Excellent", 
        description: "Exceeded objectives", 
        icon: <Trophy className="h-4 w-4 text-primary" />,
        color: "text-primary border-primary/20 bg-primary/5"
      }
    };
    
    // Handle the current rating display with proper type checking
    const displayRating = hover || rating;
    const isValidRating = displayRating >= 1 && displayRating <= 5;
    
    // Helper function for safe access to rating labels
    const getRatingInfo = (r: number) => {
      if (r >= 1 && r <= 5) {
        return ratingLabels[r as 1|2|3|4|5];
      }
      return null;
    };
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col">
          <Label className="mb-2 text-neutral-700">Select Rating</Label>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={cn(
                  "text-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md p-1",
                  "transition-all duration-200 hover:scale-110",
                  star <= rating && "animate-pulse-once"
                )}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${star} stars: ${ratingLabels[star as 1|2|3|4|5].label}`}
              >
                {star <= displayRating ? (
                  <Star
                    size={32}
                    className="text-amber-400 fill-amber-400"
                    strokeWidth={1.5}
                  />
                ) : (
                  <Star
                    size={32}
                    className="text-neutral-300"
                    strokeWidth={1.5}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Star labels at the bottom */}
          <div className="flex justify-between text-xs text-neutral-500 px-3">
            <span>Poor</span>
            <span className="flex-1"></span>
            <span>Excellent</span>
          </div>
          
          {isValidRating && (
            <div className="mt-4 flex gap-2 items-start">
              {(() => {
                const info = getRatingInfo(displayRating);
                if (!info) return null;
                
                return (
                  <div className={cn(
                    "p-2 rounded-md border flex-1",
                    info.color
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      {info.icon}
                      <span className="font-semibold">
                        {info.label} ({displayRating}/5)
                      </span>
                    </div>
                    <p className="text-sm">
                      {info.description}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        {/* Progress bar showing rating visually */}
        {isValidRating && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-neutral-600 mb-1">
              <span>Rating strength</span>
              <span>{(displayRating/5 * 100).toFixed(0)}%</span>
            </div>
            <Progress value={displayRating/5 * 100} className="h-2" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2 bg-neutral-50/70 border-b border-neutral-100">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span>Performance Summary</span>
        </CardTitle>
        <CardDescription>
          Rate the AI negotiator's performance and provide feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* Summary cards with savings and negotiation info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Savings card */}
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-600 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Savings Achieved
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Initial Offer:</span>
                <span className="font-medium">
                  {currency} {initialOffer.toLocaleString()}
                  {unit ? `/${unit}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Final Offer:</span>
                <span className="font-medium">
                  {currency} {finalOffer.toLocaleString()}
                  {unit ? `/${unit}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="text-sm font-medium">Total Savings:</span>
                <span className={`font-bold ${isPositiveSavings ? "text-green-600" : "text-red-600"}`}>
                  {isPositiveSavings ? "+" : "-"}{currency} {Math.abs(savingsAbsolute).toLocaleString()}
                  {unit ? `/${unit}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Percentage:</span>
                <span className={`font-bold flex items-center ${isPositiveSavings ? "text-green-600" : "text-red-600"}`}>
                  <BadgePercent className="h-4 w-4 mr-1" />
                  {isPositiveSavings ? "+" : "-"}{Math.abs(parseFloat(savingsPercentage))}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Negotiation summary card */}
          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-100 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-600 mb-3">
              Negotiation Summary
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap items-start gap-x-2">
                <span className="text-sm text-neutral-500 min-w-[80px]">Category:</span>
                <span className="font-medium text-sm ml-auto">{category}</span>
              </div>
              <div className="flex flex-wrap items-start gap-x-2">
                <span className="text-sm text-neutral-500 min-w-[80px]">Supplier:</span>
                <span className="font-medium text-sm ml-auto">{supplierName}</span>
              </div>
              <div className="pt-3 border-t border-neutral-200">
                <span className="text-sm font-medium text-neutral-600 block mb-1">Objectives:</span>
                <p className="text-sm text-neutral-700 bg-white p-2 rounded border border-neutral-100">
                  {objectives.length > 150
                    ? `${objectives.substring(0, 150)}...`
                    : objectives}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rating section */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-md font-medium mb-4 text-neutral-700">Rate the AI Negotiator's Performance</h3>
          <div className="bg-white p-4 rounded-md border border-neutral-100 shadow-sm">
            {renderStars()}
            
            <div className="mt-6 space-y-3">
              <div>
                <Label className="text-sm font-medium text-neutral-700 mb-2">
                  Provide feedback (optional)
                </Label>
                <Textarea
                  placeholder="What did you like or dislike about the AI negotiator's performance?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none bg-neutral-50 focus:bg-white"
                  rows={4}
                />
              </div>
              
              {feedback.length > 0 && (
                <div className="text-xs text-right text-neutral-500">
                  {feedback.length} characters
                </div>
              )}
              
              {/* Feedback prompts to help users */}
              <div className="pt-2 space-y-2">
                <p className="text-sm text-neutral-600">Suggested feedback topics:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Communication style",
                    "Negotiation tactics",
                    "Understanding objectives",
                    "Response quality",
                    "Price negotiation"
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setFeedback(prev => 
                        prev + (prev ? "\n\n" : "") + `${topic}: `
                      )}
                      className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1 px-2 rounded-full transition-colors"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 items-center justify-between px-4 sm:px-6 py-4 bg-neutral-50/70 border-t border-neutral-100">
        <div className="text-xs text-neutral-500 w-full sm:w-auto">
          {rating > 0 ? (
            <div className="flex items-center gap-1">
              <CheckCheck className="h-3 w-3 text-green-500" />
              <span>Ready to submit your {rating}-star rating</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Please select a star rating to continue</span>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full sm:w-auto" 
          onClick={() => submitRating()}
          disabled={rating === 0 || isPending}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Submit Performance Rating
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}