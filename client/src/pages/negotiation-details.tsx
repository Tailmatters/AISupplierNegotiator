import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/layout/sidebar";
import { NegotiationChat } from "@/components/negotiations/negotiation-chat";
import { PerformanceSummary } from "@/components/negotiations/performance-summary";
import { InviteSupplier } from "@/components/suppliers/invite-supplier";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  MessageCircle,
  Paperclip,
  User,
  FileText,
  AlertTriangle,
  Loader2,
  BarChart4,
  UserPlus,
  XCircle,
  BookText,
  Star,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function NegotiationDetails() {
  const [match, params] = useRoute("/negotiations/:id");
  const [_, navigate] = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  // Redirect if no match (invalid URL)
  useEffect(() => {
    if (!match) {
      navigate("/negotiations");
    }
  }, [match, navigate]);

  // Fetch negotiation details
  const {
    data: negotiation,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [`/api/negotiations/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch messages for the negotiation
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: [`/api/negotiations/${params?.id}/messages`],
    enabled: !!params?.id,
  });

  const { mutate: completeNegotiation, isPending: isCompleting } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/negotiations/${params?.id}/complete`, {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/negotiations/${params?.id}`] });
      toast({
        title: "Negotiation completed",
        description: "The negotiation has been successfully completed.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error completing negotiation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Pending</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );

  if (isError) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" className="mr-4" onClick={() => navigate("/negotiations")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Negotiation Details</h1>
              <p className="text-neutral-500">View and manage the negotiation</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load negotiation</h3>
              <p className="text-neutral-500 mb-6">
                There was an error loading the negotiation details.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate("/negotiations")}>
                  Back to Negotiations
                </Button>
                <Button onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" className="mr-4" onClick={() => navigate("/negotiations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isLoading ? (
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-800">{negotiation?.title}</h1>
                {getStatusBadge(negotiation?.status)}
              </div>
              <p className="text-neutral-500">
                {negotiation?.category} • 
                {negotiation?.startedAt && (
                  <span> Started {formatDistanceToNow(new Date(negotiation.startedAt), { addSuffix: true })}</span>
                )}
              </p>
            </div>
          )}
          
          <div className="ml-auto space-x-2">
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                {negotiation?.status === "active" && (
                  <Button
                    variant="outline"
                    onClick={() => setInviteOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Supplier
                  </Button>
                )}
                {negotiation?.status === "active" && (
                  <Button onClick={() => setChatOpen(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                )}
                {negotiation?.status === "active" && (
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => completeNegotiation()}
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Complete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-neutral-500 font-medium">
                    <Building2 className="h-4 w-4 inline mr-2" />
                    Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{negotiation?.supplier?.name || "No supplier assigned"}</div>
                      <div className="text-sm text-neutral-500">{negotiation?.supplier?.email || ""}</div>
                    </div>
                  </div>
                  
                  {negotiation?.supplier?.contactPerson && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="text-sm text-neutral-500 mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Contact Person
                      </div>
                      <div>{negotiation.supplier.contactPerson}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-neutral-500 font-medium">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Started</div>
                      <div className="font-medium">
                        {negotiation?.startedAt
                          ? format(new Date(negotiation.startedAt), "MMM d, yyyy")
                          : "Not started yet"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Status</div>
                      <div>
                        {getStatusBadge(negotiation?.status)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Completed</div>
                      <div className="font-medium">
                        {negotiation?.completedAt
                          ? format(new Date(negotiation.completedAt), "MMM d, yyyy")
                          : "Not completed yet"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Duration</div>
                      <div className="font-medium">
                        {negotiation?.completedAt && negotiation?.startedAt
                          ? formatDistanceToNow(new Date(negotiation.startedAt), { 
                              addSuffix: false, 
                              includeSeconds: false 
                            })
                          : negotiation?.startedAt
                            ? formatDistanceToNow(new Date(negotiation.startedAt), { 
                                addSuffix: false, 
                                includeSeconds: false 
                              })
                            : "N/A"
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-neutral-500 font-medium">
                    <BarChart4 className="h-4 w-4 inline mr-2" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Messages</div>
                      <div className="font-medium">{negotiation?.messageCount || 0}</div>
                    </div>
                    {negotiation?.status === "completed" && (
                      <>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">Outcome</div>
                          <div className="font-medium">
                            {negotiation?.outcome === "success" ? (
                              <span className="text-green-600">Success</span>
                            ) : negotiation?.outcome === "partial" ? (
                              <span className="text-amber-600">Partial Success</span>
                            ) : (
                              <span className="text-red-600">Did not meet objectives</span>
                            )}
                          </div>
                        </div>
                        {negotiation?.savingsPercentage !== null && (
                          <div className="flex justify-between items-center">
                            <div className="text-sm">Savings Achieved</div>
                            <div className="font-medium text-green-600">{negotiation.savingsPercentage}%</div>
                          </div>
                        )}
                      </>
                    )}
                    {negotiation?.pastDataFilePath && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Past Data</div>
                        <div className="font-medium">
                          <Button variant="outline" size="sm" className="h-7">
                            <Paperclip className="h-3 w-3 mr-1" /> View File
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">
                  <BookText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="messages">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Negotiation Details</CardTitle>
                    <CardDescription>
                      Details and objectives for this negotiation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-medium mb-2">Objectives</h3>
                        <p className="text-neutral-700 whitespace-pre-line">
                          {negotiation?.objectives || "No objectives defined"}
                        </p>
                      </div>
                      
                      {negotiation?.status === "completed" && negotiation?.outcome && (
                        <div>
                          <h3 className="text-md font-medium mb-2">Outcome Analysis</h3>
                          <div className="p-4 rounded-md bg-neutral-50">
                            <div className="flex items-center gap-2 mb-3">
                              {negotiation.outcome === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : negotiation.outcome === "partial" ? (
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <div className="font-medium">
                                {negotiation.outcome === "success"
                                  ? "Successful Negotiation"
                                  : negotiation.outcome === "partial"
                                    ? "Partially Successful Negotiation"
                                    : "Objectives Not Met"}
                              </div>
                            </div>
                            
                            <p className="text-neutral-700">
                              {negotiation.outcome === "success"
                                ? `This negotiation achieved a savings of ${negotiation.savingsPercentage}% and successfully met all the defined objectives.`
                                : negotiation.outcome === "partial"
                                  ? `This negotiation achieved a savings of ${negotiation.savingsPercentage}% but only partially met the defined objectives.`
                                  : "This negotiation did not meet the defined objectives. Review the messages to understand where improvements could be made."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Add Performance Summary when negotiation has initialOffer and finalOffer */}
                {negotiation?.status === "completed" && negotiation?.initialOffer && negotiation?.finalOffer && (
                  <div className="mt-6">
                    <PerformanceSummary
                      negotiationId={negotiation.id}
                      initialOffer={Number(negotiation.initialOffer)}
                      finalOffer={Number(negotiation.finalOffer)}
                      objectives={negotiation.objectives}
                      supplierName={negotiation.supplier?.name || "Supplier"}
                      category={negotiation.category}
                      currency={negotiation.currency || "USD"}
                      unit={negotiation.unit}
                      onNegotiationConcluded={() => {
                        refetch();
                        toast({
                          title: "Negotiation Concluded",
                          description: "The negotiation has been successfully concluded.",
                        });
                      }}
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Negotiation Messages</CardTitle>
                    <CardDescription>
                      Conversation history between AI negotiator and supplier
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {messagesLoading ? (
                      <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages?.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                        <p className="text-neutral-500 mb-6">
                          {negotiation?.status === "pending"
                            ? "This negotiation hasn't started yet"
                            : "Start the conversation to begin negotiating"}
                        </p>
                        {negotiation?.status === "active" && (
                          <Button onClick={() => setChatOpen(true)}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Open Chat
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-md">
                        <ScrollArea className="h-[500px] p-4">
                          {messages?.map((message: any) => {
                            if (message.senderType === "system") {
                              return (
                                <div key={message.id} className="flex justify-center my-4">
                                  <div className="bg-neutral-100 text-neutral-500 text-xs rounded-full px-3 py-1">
                                    {message.content} - {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                  </div>
                                </div>
                              );
                            }

                            const isUserMessage = message.senderType === "user";
                            const isSupplierMessage = message.senderType === "supplier";
                            const isAiMessage = message.senderType === "ai";

                            return (
                              <div 
                                key={message.id} 
                                className={`flex items-start mb-4 ${isUserMessage ? "justify-end" : ""}`}
                              >
                                {!isUserMessage && (
                                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3 flex-shrink-0">
                                    {isAiMessage ? (
                                      <FileText className="h-4 w-4" />
                                    ) : (
                                      <Building2 className="h-4 w-4" />
                                    )}
                                  </div>
                                )}
                                <div 
                                  className={`rounded-lg p-3 max-w-md ${
                                    isUserMessage 
                                      ? "bg-primary-light bg-opacity-10" 
                                      : "bg-neutral-100"
                                  }`}
                                >
                                  <p className="text-sm text-neutral-800">{message.content}</p>
                                  <div className="mt-1 text-right">
                                    <span className="text-xs text-neutral-400">
                                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                                {isUserMessage && (
                                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white ml-3 flex-shrink-0">
                                    <User className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {negotiation?.status === "active" && (
                      <Button
                        className="ml-auto"
                        onClick={() => setChatOpen(true)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      {/* Negotiation chat dialog */}
      {negotiation && (
        <NegotiationChat
          open={chatOpen}
          onOpenChange={setChatOpen}
          negotiation={negotiation}
          messages={messages || []}
          isLoading={messagesLoading}
          onComplete={() => {
            refetch();
            refetchMessages();
          }}
        />
      )}
      
      {/* Invite supplier dialog */}
      {negotiation && (
        <InviteSupplier
          negotiationId={negotiation.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      )}
    </Layout>
  );
}
