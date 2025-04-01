import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, BarChart4, PieChart, UploadCloud, FileSpreadsheet, Clock } from "lucide-react";
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, Tooltip, TooltipProps } from "recharts";

// Define types for our data
interface YearData {
  year: number;
  total: number;
}

interface CategoryData {
  category: string;
  total: number;
}

interface SupplierData {
  supplierId: number;
  supplierName: string;
  total: number;
  percentage?: number;
  cumulativePercentage?: number;
}

interface UploadData {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: 'completed' | 'processing' | 'failed';
  recordCount: number;
}

// Color constants for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const SpendAnalysisPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [yearFilter, setYearFilter] = useState<string | undefined>(undefined);
  
  // Get years from spend data for filtering
  const { data: spendByYear } = useQuery<YearData[]>({
    queryKey: ['/api/spend/by-year'],
    enabled: !!user
  });
  
  // Prepare years for dropdown
  const availableYears = spendByYear ? spendByYear.map((item: YearData) => item.year.toString()) : [];
  
  // Fetch uploads
  const { data: uploads, isLoading: isLoadingUploads } = useQuery<UploadData[]>({
    queryKey: ['/api/spend/uploads'],
    enabled: !!user
  });
  
  // Fetch spend by category
  const { data: spendByCategory, isLoading: isLoadingCategories } = useQuery<CategoryData[]>({
    queryKey: ['/api/spend/by-category', yearFilter],
    queryFn: async () => {
      const url = yearFilter 
        ? `/api/spend/by-category?year=${yearFilter}`
        : '/api/spend/by-category';
      const res = await apiRequest('GET', url);
      return res.json();
    },
    enabled: !!user
  });
  
  // Fetch spend by supplier
  const { data: spendBySupplier, isLoading: isLoadingSuppliers } = useQuery<SupplierData[]>({
    queryKey: ['/api/spend/by-supplier', yearFilter],
    queryFn: async () => {
      const url = yearFilter 
        ? `/api/spend/by-supplier?year=${yearFilter}`
        : '/api/spend/by-supplier';
      const res = await apiRequest('GET', url);
      return res.json();
    },
    enabled: !!user
  });
  
  // Fetch top suppliers
  const { data: topSuppliers, isLoading: isLoadingTopSuppliers } = useQuery<SupplierData[]>({
    queryKey: ['/api/spend/top-suppliers'],
    enabled: !!user
  });
  
  // Prepare for Pareto analysis
  const paretoData = spendBySupplier ? [...spendBySupplier].sort((a, b) => b.total - a.total) : [];
  
  // Calculate cumulative percentages for Pareto chart
  if (paretoData?.length > 0) {
    const totalSpend = paretoData.reduce((sum: number, item: SupplierData) => sum + item.total, 0);
    let cumulativeSpend = 0;
    
    paretoData.forEach(item => {
      cumulativeSpend += item.total;
      item.percentage = (item.total / totalSpend) * 100;
      item.cumulativePercentage = (cumulativeSpend / totalSpend) * 100;
    });
  }
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/spend/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload spend data");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your spend data has been uploaded and processed.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/spend/uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spend/by-category'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spend/by-supplier'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spend/by-year'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spend/top-suppliers'] });
      
      // Reset the selected file
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle file upload
  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Spend Analysis</h1>
        
        <div className="flex items-center gap-2">
          <Select
            value={yearFilter}
            onValueChange={(value) => setYearFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {availableYears.map((year: string) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingSuppliers ? (
                    <div className="h-6 animate-pulse bg-muted rounded"></div>
                  ) : (
                    spendBySupplier?.length && spendBySupplier.length > 0 ? 
                      formatCurrency(spendBySupplier.reduce((acc: number, curr: SupplierData) => acc + curr.total, 0)) : 
                      "$0"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {yearFilter ? `in ${yearFilter}` : "across all years"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingSuppliers ? (
                    <div className="h-6 animate-pulse bg-muted rounded"></div>
                  ) : (
                    spendBySupplier?.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  with recorded spend
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingCategories ? (
                    <div className="h-6 animate-pulse bg-muted rounded"></div>
                  ) : (
                    spendByCategory?.length || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  spend categories tracked
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Suppliers by Spend</CardTitle>
                <CardDescription>Your highest spend suppliers</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoadingTopSuppliers ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 animate-pulse bg-muted rounded"></div>
                    ))}
                  </div>
                ) : topSuppliers?.length && topSuppliers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSuppliers.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="supplierName" type="category" width={150} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No supplier data available</h3>
                    <p className="text-sm text-muted-foreground">Upload spend data to see supplier analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
                <CardDescription>Distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="h-[300px] animate-pulse bg-muted rounded"></div>
                ) : spendByCategory?.length && spendByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={spendByCategory}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ category }) => category}
                      >
                        {spendByCategory && spendByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No category data available</h3>
                    <p className="text-sm text-muted-foreground">Upload spend data to see category analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Historical Spend by Year</CardTitle>
              <CardDescription>Track your spend over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUploads ? (
                <div className="h-[300px] animate-pulse bg-muted rounded"></div>
              ) : spendByYear?.length && spendByYear.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spendByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Spend" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No historical data available</h3>
                  <p className="text-sm text-muted-foreground">Upload spend data to see trends over time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Pareto Analysis</CardTitle>
              <CardDescription>
                Identifying the critical few suppliers that represent most of your spend
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSuppliers ? (
                <div className="h-[400px] animate-pulse bg-muted rounded"></div>
              ) : paretoData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={paretoData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="supplierName" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" unit="%" />
                    <Tooltip 
                      formatter={(value: any, name: any) => {
                      if (name === "cumulativePercentage" && typeof value === 'number') {
                        return [`${value.toFixed(1)}%`, "Cumulative %"];
                      }
                      return [formatCurrency(Number(value)), "Spend"];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill="#8884d8" name="Spend" />
                    <Bar yAxisId="right" dataKey="cumulativePercentage" fill="#82ca9d" name="Cumulative %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No supplier data available</h3>
                  <p className="text-sm text-muted-foreground">Upload spend data to see supplier analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Supplier Spend Details</CardTitle>
              <CardDescription>Detailed breakdown of spend by supplier</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSuppliers ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 animate-pulse bg-muted rounded"></div>
                  ))}
                </div>
              ) : spendBySupplier?.length && spendBySupplier.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 font-semibold border-b text-sm">
                    <div className="col-span-5">Supplier</div>
                    <div className="col-span-3 text-right">Total Spend</div>
                    <div className="col-span-2 text-right">% of Total</div>
                    <div className="col-span-2 text-right">Cumulative %</div>
                  </div>
                  <div className="divide-y">
                    {paretoData.map((supplier, index) => (
                      <div key={supplier.supplierId} className="grid grid-cols-12 p-4 text-sm">
                        <div className="col-span-5">
                          {supplier.supplierName}
                        </div>
                        <div className="col-span-3 text-right">
                          {formatCurrency(supplier.total)}
                        </div>
                        <div className="col-span-2 text-right">
                          {supplier.percentage?.toFixed(1)}%
                        </div>
                        <div className="col-span-2 text-right">
                          {supplier.cumulativePercentage?.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No supplier data available</h3>
                  <p className="text-sm text-muted-foreground">Upload spend data to see supplier details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Spend distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="h-[400px] animate-pulse bg-muted rounded"></div>
              ) : spendByCategory?.length && spendByCategory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <RechartsPieChart>
                        <Pie
                          data={spendByCategory}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          fill="#8884d8"
                          label
                        >
                          {spendByCategory && spendByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 p-4 font-semibold border-b text-sm">
                        <div className="col-span-3">Category</div>
                        <div className="col-span-2 text-right">Total Spend</div>
                        <div className="col-span-1 text-right">% of Total</div>
                      </div>
                      <div className="divide-y max-h-[350px] overflow-y-auto">
                        {spendByCategory && spendByCategory.map((category) => {
                          const totalSpend = spendByCategory.reduce((acc: number, curr: CategoryData) => acc + curr.total, 0);
                          const percentage = (category.total / totalSpend) * 100;
                          return (
                            <div key={category.category} className="grid grid-cols-6 p-4 text-sm">
                              <div className="col-span-3 flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ 
                                    backgroundColor: COLORS[(spendByCategory.findIndex(c => c.category === category.category) || 0) % COLORS.length] 
                                  }} 
                                />
                                {category.category}
                              </div>
                              <div className="col-span-2 text-right">
                                {formatCurrency(category.total)}
                              </div>
                              <div className="col-span-1 text-right">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No category data available</h3>
                  <p className="text-sm text-muted-foreground">Upload spend data to see category analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Spend Data</CardTitle>
              <CardDescription>Upload CSV or Excel files with your spend data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-medium mb-1">Upload your spend data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your CSV or Excel file, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="max-w-sm mx-auto"
                  />
                  {selectedFile && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <FileSpreadsheet className="h-4 w-4 inline mr-1" />
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Data"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Previous Uploads</CardTitle>
              <CardDescription>History of your spend data uploads</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUploads ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded"></div>
                  ))}
                </div>
              ) : uploads && uploads.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 font-semibold border-b text-sm">
                    <div className="col-span-3">Filename</div>
                    <div className="col-span-2">Upload Date</div>
                    <div className="col-span-2">File Type</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Records</div>
                    <div className="col-span-2 text-right">Size</div>
                  </div>
                  <div className="divide-y">
                    {uploads.map((upload: any) => (
                      <div key={upload.id} className="grid grid-cols-12 p-4 text-sm">
                        <div className="col-span-3 flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <span className="truncate">{upload.fileName}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </div>
                        <div className="col-span-2">
                          {upload.fileType.toUpperCase()}
                        </div>
                        <div className="col-span-2">
                          <Badge variant={
                            upload.status === 'completed' ? 'default' : 
                            upload.status === 'processing' ? 'outline' : 
                            'destructive'
                          }>
                            {upload.status}
                          </Badge>
                        </div>
                        <div className="col-span-1 text-right">
                          {upload.recordCount}
                        </div>
                        <div className="col-span-2 text-right">
                          {Math.round(upload.fileSize / 1024)} KB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No upload history</h3>
                  <p className="text-sm text-muted-foreground">You haven't uploaded any spend data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpendAnalysisPage;