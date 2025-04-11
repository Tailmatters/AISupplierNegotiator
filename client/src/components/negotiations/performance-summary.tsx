import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Check, X, Star, AlertCircle, Send, DollarSign } from 'lucide-react';

// Star Rating Component
const StarRating = ({ 
  rating, 
  setRating, 
  readOnly = false 
}: { 
  rating: number; 
  setRating: (rating: number) => void;
  readOnly?: boolean;
}) => {
  const handleStarClick = (selectedRating: number) => {
    if (!readOnly) {
      setRating(selectedRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readOnly}
          className={`focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`h-8 w-8 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

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
  currency = 'USD',
  unit = '',
  onNegotiationConcluded
}: PerformanceSummaryProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showConcludeDialog, setShowConcludeDialog] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  const savings = initialOffer - finalOffer;
  const savingsPercentage = ((savings / initialOffer) * 100).toFixed(2);
  
  const objectivesList = objectives.split('\n').filter(obj => obj.trim() !== '');
  
  // Calculate a simple performance score based on savings percentage
  const getPerformanceScore = (): { text: string; color: string } => {
    const savingsPct = parseFloat(savingsPercentage);
    if (savingsPct >= 20) return { text: 'Exceptional', color: 'text-green-600' };
    if (savingsPct >= 10) return { text: 'Very Good', color: 'text-green-500' };
    if (savingsPct >= 5) return { text: 'Good', color: 'text-blue-500' };
    if (savingsPct > 0) return { text: 'Fair', color: 'text-yellow-500' };
    return { text: 'No Savings', color: 'text-red-500' };
  };

  const performanceScore = getPerformanceScore();
  
  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/negotiations/${negotiationId}/feedback`, {
        rating,
        feedback,
        savingsAmount: savings,
        savingsPercentage: parseFloat(savingsPercentage)
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback on the AI negotiator's performance.",
      });
      setShowFeedbackDialog(false);
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [`/api/negotiations/${negotiationId}`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit feedback: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Conclude negotiation mutation
  const concludeNegotiationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/negotiations/${negotiationId}/conclude`, {
        approved: true,
        additionalInstructions
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Negotiation Concluded",
        description: "The supplier will be notified of the final terms.",
      });
      setShowConcludeDialog(false);
      // Call the callback if provided
      if (onNegotiationConcluded) {
        onNegotiationConcluded();
      }
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [`/api/negotiations/${negotiationId}`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to conclude negotiation: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Request further negotiation mutation
  const requestFurtherNegotiationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/negotiations/${negotiationId}/request-further`, {
        instructions: additionalInstructions
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "A request for further negotiation has been sent to the supplier.",
      });
      setShowConcludeDialog(false);
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [`/api/negotiations/${negotiationId}`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to request further negotiation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>AI Negotiator Performance Summary</CardTitle>
          <CardDescription>
            Results of AI-led negotiation with {supplierName} for {category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Negotiation Metrics</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Initial Offer</div>
                    <div className="text-2xl font-bold mt-1">
                      {currency} {initialOffer.toLocaleString()}{unit ? ` per ${unit}` : ''}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Final Offer</div>
                    <div className="text-2xl font-bold mt-1">
                      {currency} {finalOffer.toLocaleString()}{unit ? ` per ${unit}` : ''}
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Savings</div>
                    <div className="text-sm text-muted-foreground">
                      ({savingsPercentage}%)
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {currency} {savings.toLocaleString()}{unit ? ` per ${unit}` : ''}
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="text-sm font-medium mb-2">Performance Rating</div>
                  <div className={`text-2xl font-bold ${performanceScore.color}`}>
                    {performanceScore.text}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Negotiation Objectives</h3>
              <div className="space-y-2">
                {objectivesList.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {objectivesList.map((objective, idx) => (
                      <li key={idx} className="text-sm">
                        {objective}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific objectives were set for this negotiation.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => setShowFeedbackDialog(true)}
          >
            <Star className="mr-2 h-4 w-4" />
            Rate Performance
          </Button>
          <Button 
            variant="default" 
            className="w-full sm:w-auto"
            onClick={() => setShowConcludeDialog(true)}
          >
            <Check className="mr-2 h-4 w-4" />
            Review & Conclude
          </Button>
        </CardFooter>
      </Card>
      
      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate AI Negotiator Performance</DialogTitle>
            <DialogDescription>
              How would you rate the performance of the AI negotiator in this negotiation?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center space-y-4">
            <StarRating rating={rating} setRating={setRating} />
            <Textarea
              placeholder="Please provide any additional feedback or suggestions for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => submitFeedbackMutation.mutate()}
              disabled={rating === 0 || submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Conclude Negotiation Dialog */}
      <Dialog open={showConcludeDialog} onOpenChange={setShowConcludeDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Negotiation Decision</DialogTitle>
            <DialogDescription>
              Would you like to conclude this negotiation or request further negotiation with the supplier?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Final Offer: {currency} {finalOffer.toLocaleString()}</AlertTitle>
              <AlertDescription>
                {savings > 0 ? (
                  <span>You've achieved a savings of {currency} {savings.toLocaleString()} ({savingsPercentage}%) from the initial offer.</span>
                ) : (
                  <span>No savings have been achieved from the initial offer.</span>
                )}
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="text-sm font-medium">
                Additional Instructions or Requests for the Supplier
              </label>
              <Textarea
                placeholder="Provide any specific details, instructions, or focal points for further negotiation..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={4}
                className="w-full mt-2"
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => setShowConcludeDialog(false)}
              className="sm:mr-auto"
            >
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                onClick={() => requestFurtherNegotiationMutation.mutate()}
                disabled={requestFurtherNegotiationMutation.isPending || concludeNegotiationMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Request Further Negotiation
              </Button>
              <Button 
                variant="default" 
                onClick={() => concludeNegotiationMutation.mutate()}
                disabled={requestFurtherNegotiationMutation.isPending || concludeNegotiationMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Conclude Negotiation
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}