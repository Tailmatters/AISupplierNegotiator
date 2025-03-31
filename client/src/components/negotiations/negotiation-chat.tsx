import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Paperclip, SmilePlus, Download, Settings, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  negotiationId: number;
  senderId: string;
  senderType: "user" | "supplier" | "ai" | "system";
  content: string;
  timestamp: string;
}

interface NegotiationChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiation: any;
  messages: Message[];
  isLoading: boolean;
  onComplete: () => void;
}

export function NegotiationChat({
  open,
  onOpenChange,
  negotiation,
  messages,
  isLoading,
  onComplete
}: NegotiationChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/negotiations/${negotiation.id}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/negotiations/${negotiation.id}/messages`] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: completeNegotiation, isPending: isCompleting } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/negotiations/${negotiation.id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/negotiations`] });
      toast({
        title: "Negotiation completed",
        description: "The negotiation has been successfully completed.",
      });
      onComplete();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error completing negotiation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.senderType === "system") {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-neutral-100 text-neutral-500 text-xs rounded-full px-3 py-1">
            {message.content} - {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </div>
        </div>
      );
    }

    const isUserMessage = message.senderType === "user";
    const isSupplierMessage = message.senderType === "supplier";
    const isAiMessage = message.senderType === "ai";

    if (isUserMessage || isSupplierMessage) {
      return (
        <div className={`flex items-start mb-4 ${isUserMessage ? "justify-end" : ""}`}>
          {!isUserMessage && (
            <Avatar className="w-8 h-8 mr-3">
              <AvatarFallback className="bg-neutral-100 text-neutral-500">
                S
              </AvatarFallback>
            </Avatar>
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
            <Avatar className="w-8 h-8 ml-3">
              <AvatarFallback className="bg-primary text-white">
                U
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      );
    }

    if (isAiMessage) {
      return (
        <div className="flex items-start mb-4">
          <Avatar className="w-8 h-8 mr-3">
            <AvatarFallback className="bg-primary text-white">
              AI
            </AvatarFallback>
          </Avatar>
          <div className="bg-neutral-100 rounded-lg p-3 max-w-md">
            <p className="text-sm text-neutral-800">{message.content}</p>
            <div className="mt-1 text-right">
              <span className="text-xs text-neutral-400">
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col">
              <span>{negotiation?.title}</span>
              <span className="text-sm font-normal text-neutral-500">
                {negotiation?.supplier?.name}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-[400px] overflow-hidden border border-neutral-200 rounded-md mb-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages?.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col">
              <p className="text-neutral-500 mb-2">No messages yet</p>
              <p className="text-neutral-400 text-sm">Start the conversation by sending a message</p>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              {messages?.map((message) => (
                <div key={message.id}>{renderMessageContent(message)}</div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          )}
        </div>
        
        <div className="flex items-center">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isPending}
              className="pr-16"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1 text-neutral-400">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SmilePlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            className="ml-2 rounded-md" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
        <DialogFooter className="bg-neutral-50 -mx-6 -mb-6 mt-4 px-6 py-3 flex justify-between items-center">
          <div>
            <Button variant="outline" size="sm" className="mr-2">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </Button>
          </div>
          <Button 
            onClick={() => completeNegotiation()}
            disabled={isCompleting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Accept Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
