import { useState } from "react";
import { Layout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileCheck, FileDown, FileUp, PencilLine, FilePlus, File, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type ContractTemplate = {
  id: number;
  name: string;
  category: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  description: string | null;
  isDefault: boolean;
  status: string;
  createdAt: string;
  createdBy: number;
  metadata: any;
};

type Contract = {
  id: number;
  negotiationId: number;
  supplierId: number;
  filePath: string;
  fileName: string;
  proposalId: number | null;
  templateId: number | null;
  status: string;
  terms: any;
  metadata: any;
  generatedAt: string;
  approvedAt: string | null;
  signedAt: string | null;
};

// Component to upload a new contract template
function UploadTemplateForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const uploadTemplateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/contract-templates", formData, {
        headers: {
          // Don't set content-type here, it will be set automatically for FormData
        },
        rawBody: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload template");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contract template uploaded successfully",
      });
      
      // Reset form and close dialog
      setName("");
      setCategory("");
      setDescription("");
      setIsDefault(false);
      setFile(null);
      setOpen(false);
      
      // Refresh templates list
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      
      // Call success callback
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !file) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("isDefault", String(isDefault));
    formData.append("file", file);
    
    uploadTemplateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileUp className="h-4 w-4" />
          Upload Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Contract Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT Hardware">IT Hardware</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                <SelectItem value="Office Furniture">Office Furniture</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
                <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Switch id="isDefault" checked={isDefault} onCheckedChange={setIsDefault} />
            <Label htmlFor="isDefault">Set as default template for selected category</Label>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file">Template File *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              required
            />
            <p className="text-xs text-gray-500">
              Support files: .pdf, .doc, .docx, .txt (Max 10MB)
            </p>
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              type="submit" 
              disabled={uploadTemplateMutation.isPending || !name || !category || !file}
            >
              {uploadTemplateMutation.isPending ? "Uploading..." : "Upload Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Contract Templates Tab
function ContractTemplates() {
  const { toast } = useToast();
  
  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/contract-templates"],
    queryFn: async () => {
      const response = await fetch("/api/contract-templates");
      if (!response.ok) {
        throw new Error("Failed to fetch contract templates");
      }
      return response.json() as Promise<ContractTemplate[]>;
    },
  });
  
  const handleSetDefault = async (templateId: number) => {
    try {
      const res = await apiRequest("PUT", `/api/contract-templates/${templateId}`, {
        isDefault: true
      });
      
      if (!res.ok) {
        throw new Error("Failed to set as default template");
      }
      
      // Refresh templates
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      
      toast({
        title: "Success",
        description: "Template set as default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = (filePath: string, fileName: string) => {
    // Create a link and download the file
    const link = document.createElement("a");
    link.href = `/uploads/${filePath.split('/').pop()}`;  // Assuming the file path includes the full path
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const refreshTemplates = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Contract Templates</h2>
          <p className="text-sm text-gray-500">
            Upload and manage standard contract templates by category.
          </p>
        </div>
        <UploadTemplateForm onSuccess={refreshTemplates} />
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p>Loading templates...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-500">Error loading templates: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.category} {template.isDefault && (
                        <Badge variant="default" className="ml-2 text-xs">Default</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(template.filePath, template.fileName)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    {!template.isDefault && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSetDefault(template.id)}
                      >
                        Make Default
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex items-center text-sm gap-2 mb-1">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{template.fileName}</span>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white shadow-sm">
          <CardContent>
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Templates Available</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Upload contract templates to streamline the contract generation process.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Contracts Tab
function Contracts() {
  const { toast } = useToast();
  
  const {
    data: contracts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/contracts"],
    queryFn: async () => {
      try {
        // Get first negotiation to use as filter
        const negotiationsResponse = await fetch("/api/negotiations");
        if (!negotiationsResponse.ok) {
          throw new Error("Failed to fetch negotiations");
        }
        
        const negotiations = await negotiationsResponse.json();
        if (negotiations.length === 0) {
          return []; // No negotiations, so no contracts
        }
        
        // Use the first negotiation's ID to fetch contracts
        const response = await fetch(`/api/contracts?negotiationId=${negotiations[0].id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contracts");
        }
        
        return response.json() as Promise<Contract[]>;
      } catch (error) {
        console.error("Error fetching contracts:", error);
        return [];
      }
    },
  });
  
  const handleDownload = (filePath: string, fileName: string) => {
    // Create a link and download the file
    const link = document.createElement("a");
    link.href = `/uploads/${filePath.split('/').pop()}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleUpdateStatus = async (contractId: number, status: string) => {
    try {
      const res = await apiRequest("PUT", `/api/contracts/${contractId}`, {
        status
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update contract status to ${status}`);
      }
      
      // Refresh contracts
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      
      toast({
        title: "Success",
        description: `Contract ${status === 'approved' ? 'approved' : status === 'signed' ? 'marked as signed' : 'status updated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Contracts</h2>
          <p className="text-sm text-gray-500">
            View and manage finalized contracts from completed negotiations.
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p>Loading contracts...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-500">Error loading contracts: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      ) : contracts && contracts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <CardTitle className="text-base">{contract.fileName}</CardTitle>
                    <Badge 
                      variant={
                        contract.status === 'draft' ? 'outline' : 
                        contract.status === 'approved' ? 'default' : 
                        contract.status === 'signed' ? 'default' : 'secondary'
                      }
                    >
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(contract.filePath, contract.fileName)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    {contract.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(contract.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                    {contract.status === 'approved' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(contract.id, 'signed')}
                      >
                        Mark as Signed
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Created on</p>
                    <p className="text-sm">{new Date(contract.generatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm capitalize">{contract.status}</p>
                  </div>
                  {contract.approvedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Approved on</p>
                      <p className="text-sm">{new Date(contract.approvedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {contract.signedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Signed on</p>
                      <p className="text-sm">{new Date(contract.signedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white shadow-sm">
          <CardContent>
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <FileDown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Contracts Available</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                When negotiations are completed successfully, contracts will be generated and displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Contract Management</h1>
          <p className="text-gray-500">
            Manage contract templates and view finalized contracts
          </p>
        </div>
        
        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Contract Templates</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <ContractTemplates />
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-4">
            <Contracts />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}