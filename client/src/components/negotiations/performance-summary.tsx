import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, StarHalf, Sparkles, TrendingUp, BadgePercent } from "lucide-react";

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

  // Generate stars for rating
  const renderStars = () => {
    return (
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="text-2xl focus:outline-none"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            {star <= (hover || rating) ? (
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
        {rating > 0 && (
          <span className="ml-2 text-neutral-500">
            {rating === 5
              ? "Excellent"
              : rating === 4
              ? "Very Good"
              : rating === 3
              ? "Good"
              : rating === 2
              ? "Fair"
              : "Poor"}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span>Performance Summary</span>
        </CardTitle>
        <CardDescription>
          Rate the AI negotiator's performance and provide feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-neutral-500 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Savings Achieved
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Initial Offer:</span>
                  <span className="font-medium">
                    {currency} {initialOffer.toLocaleString()}
                    {unit ? `/${unit}` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Final Offer:</span>
                  <span className="font-medium">
                    {currency} {finalOffer.toLocaleString()}
                    {unit ? `/${unit}` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                  <span className="text-sm font-medium">Total Savings:</span>
                  <span className={`font-bold ${isPositiveSavings ? "text-green-600" : "text-red-600"}`}>
                    {isPositiveSavings ? "+" : "-"}{currency} {Math.abs(savingsAbsolute).toLocaleString()}
                    {unit ? `/${unit}` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Percentage:</span>
                  <span className={`font-bold flex items-center ${isPositiveSavings ? "text-green-600" : "text-red-600"}`}>
                    <BadgePercent className="h-4 w-4 mr-1" />
                    {isPositiveSavings ? "+" : "-"}{Math.abs(parseFloat(savingsPercentage))}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-neutral-500 mb-2">
                Negotiation Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Category:</span>
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Supplier:</span>
                  <span className="font-medium">{supplierName}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-sm font-medium">Objectives:</span>
                  <p className="text-sm mt-1 text-neutral-700">
                    {objectives.length > 150
                      ? `${objectives.substring(0, 150)}...`
                      : objectives}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-md font-medium mb-3">Rate the AI Negotiator's Performance</h3>
            {renderStars()}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Provide feedback (optional)
              </label>
              <Textarea
                placeholder="What did you like or dislike about the AI negotiator's performance?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          className="w-full sm:w-auto" 
          onClick={() => submitRating()}
          disabled={rating === 0 || isPending}
        >
          {isPending ? "Submitting..." : "Submit Performance Rating"}
        </Button>
      </CardFooter>
    </Card>
  );
}