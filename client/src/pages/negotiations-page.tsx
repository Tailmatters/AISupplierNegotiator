import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NegotiationChat } from "@/components/negotiations/negotiation-chat";
import { Calendar, MoreVertical, MessageCircle, FileText, Plus, Search, Filter, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NegotiationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNegotiation, setSelectedNegotiation] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch all negotiations
  const {
    data: negotiations,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/negotiations"],
  });

  // Fetch messages for selected negotiation
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: [`/api/negotiations/${selectedNegotiation?.id}/messages`],
    enabled: !!selectedNegotiation?.id,
  });

  // Filter negotiations based on search query and status
  const filteredNegotiations = negotiations?.filter((negotiation: any) => {
    const matchesSearch = searchQuery === "" || 
      negotiation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      negotiation.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      negotiation.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      negotiation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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

  const handleChatOpen = (negotiation: any) => {
    setSelectedNegotiation(negotiation);
    setChatOpen(true);
  };

  const handleNegotiationComplete = () => {
    refetch();
  };

  if (isError) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Negotiations</h1>
              <p className="text-neutral-500">Manage your procurement negotiations</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-neutral-500 mb-4">Failed to load negotiations</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Negotiations</h1>
            <p className="text-neutral-500">Manage your procurement negotiations</p>
          </div>
          <Link href="/negotiations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Negotiation
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search negotiations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredNegotiations?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No negotiations found</h3>
                <p className="text-neutral-500 mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try changing your search or filter criteria"
                    : "Start by creating your first negotiation"}
                </p>
                <Link href="/negotiations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> New Negotiation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNegotiations?.map((negotiation: any) => (
                      <TableRow key={negotiation.id}>
                        <TableCell className="font-medium">{negotiation.title}</TableCell>
                        <TableCell>{negotiation.supplier.name}</TableCell>
                        <TableCell>{negotiation.category}</TableCell>
                        <TableCell>{getStatusBadge(negotiation.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-neutral-400" />
                            {negotiation.startedAt
                              ? formatDistanceToNow(new Date(negotiation.startedAt), { addSuffix: true })
                              : "Not started"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1 text-neutral-400" />
                            {negotiation.messageCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleChatOpen(negotiation)}
                              disabled={negotiation.status === 'cancelled'}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" /> Chat
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/negotiations/${negotiation.id}`}>
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem className="text-red-500" onClick={() => {}}>
                                  <Trash className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Negotiation chat dialog */}
      {selectedNegotiation && (
        <NegotiationChat
          open={chatOpen}
          onOpenChange={setChatOpen}
          negotiation={selectedNegotiation}
          messages={messages || []}
          isLoading={messagesLoading}
          onComplete={handleNegotiationComplete}
        />
      )}
    </Layout>
  );
}
