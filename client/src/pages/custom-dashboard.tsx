import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MoreVertical, 
  Grid3X3, 
  PieChart, 
  BarChart, 
  LineChart, 
  Table, 
  MessageSquare, 
  FileText, 
  Users, 
  X,
  Settings,
  Edit,
  Trash2,
  ChevronDown
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Widget types
type WidgetType = {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  icon: string;
  defaultHeight: number;
  defaultWidth: number;
  minHeight: number;
  minWidth: number;
  maxHeight: number;
  maxWidth: number;
  availableSettings: any;
  createdAt: Date;
};

type Widget = {
  id: number;
  title: string | null;
  dashboardId: number;
  widgetTypeId: number;
  position: number;
  width: number;
  height: number;
  x: number | null;
  y: number | null;
  settings: any;
  createdAt: string;
  updatedAt: string;
  widgetType?: WidgetType;
};

type Dashboard = {
  id: number;
  name: string;
  userId: number;
  isDefault: boolean;
  layout: any;
  createdAt: string;
  updatedAt: string;
  widgets: Widget[];
};

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "PieChart": return <PieChart className="h-5 w-5" />;
    case "BarChart": return <BarChart className="h-5 w-5" />;
    case "LineChart": return <LineChart className="h-5 w-5" />;
    case "Table": return <Table className="h-5 w-5" />;
    case "MessageSquare": return <MessageSquare className="h-5 w-5" />;
    case "FileText": return <FileText className="h-5 w-5" />;
    case "Users": return <Users className="h-5 w-5" />;
    case "Grid3X3": return <Grid3X3 className="h-5 w-5" />;
    default: return <Grid3X3 className="h-5 w-5" />;
  }
};

// Widget Content Component
const WidgetContent = ({ widget }: { widget: Widget }) => {
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/widget-data/${widget.widgetTypeId}`, widget.id],
    enabled: !!widget.widgetTypeId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Failed to load widget data</p>
      </div>
    );
  }

  // Render widget content based on widget type
  switch (widget.widgetType?.type) {
    case 'recent-negotiations':
      return <RecentNegotiationsWidget data={data} />;
    case 'category-summary':
      return <CategorySummaryWidget data={data} />;
    case 'top-suppliers':
      return <TopSuppliersWidget data={data} />;
    case 'spend-by-year':
      return <SpendByYearWidget data={data} />;
    default:
      return (
        <div className="text-center text-muted-foreground">
          <div className="mb-2">
            {getIconComponent(widget.widgetType?.icon || "Grid3X3")}
          </div>
          <p>This widget type is not yet implemented</p>
        </div>
      );
  }
};

// Specific Widget Components
const RecentNegotiationsWidget = ({ data }: { data: any }) => {
  if (!data || !data.negotiations || data.negotiations.length === 0) {
    return <div className="text-center p-4">No recent negotiations</div>;
  }

  return (
    <div className="space-y-3">
      {data.negotiations.map((negotiation: any) => (
        <div key={negotiation.id} className="flex justify-between items-center p-2 hover:bg-accent/30 rounded">
          <div>
            <p className="font-medium">{negotiation.title}</p>
            <p className="text-xs text-muted-foreground">{negotiation.category}</p>
          </div>
          <div className="text-xs">
            <span className={`px-2 py-1 rounded-full ${negotiation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {negotiation.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategorySummaryWidget = ({ data }: { data: any }) => {
  if (!data || !data.categories || data.categories.length === 0) {
    return <div className="text-center p-4">No category data available</div>;
  }

  return (
    <div className="space-y-3">
      {data.categories.map((category: any) => (
        <div key={category.name} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
            <span>{category.name}</span>
          </div>
          <span className="font-medium">${category.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const TopSuppliersWidget = ({ data }: { data: any }) => {
  if (!data || !data.suppliers || data.suppliers.length === 0) {
    return <div className="text-center p-4">No supplier data available</div>;
  }

  return (
    <div className="space-y-3">
      {data.suppliers.map((supplier: any, index: number) => (
        <div key={supplier.id} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>
            <span>{supplier.name}</span>
          </div>
          <span className="font-medium">${supplier.spend.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const SpendByYearWidget = ({ data }: { data: any }) => {
  if (!data || !data.years || data.years.length === 0) {
    return <div className="text-center p-4">No yearly spend data available</div>;
  }

  return (
    <div className="space-y-3">
      {data.years.map((year: any) => (
        <div key={year.year} className="space-y-1">
          <div className="flex justify-between items-center">
            <span>{year.year}</span>
            <span className="font-medium">${year.total.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2" 
              style={{ width: `${(year.total / data.maxTotal) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Widget Component
const WidgetCard = ({ 
  widget, 
  onRemove, 
  onEdit 
}: { 
  widget: Widget; 
  onRemove: (id: number) => void;
  onEdit: (widget: Widget) => void;
}) => {
  return (
    <Card className="overflow-hidden" style={{
      gridColumn: `span ${widget.width}`,
      gridRow: `span ${widget.height}`,
    }}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          {widget.widgetType?.icon && getIconComponent(widget.widgetType.icon)}
          <CardTitle className="text-base">{widget.title || widget.widgetType?.name || "Widget"}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(widget)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive" 
              onClick={() => onRemove(widget.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <CardDescription>
          {widget.widgetType?.description || "Widget description"}
        </CardDescription>
        <div className="p-4 min-h-[160px] bg-muted/20 rounded-md mt-4">
          <WidgetContent widget={widget} />
        </div>
      </CardContent>
    </Card>
  );
};

// Widget Gallery Dialog
const AddWidgetDialog = ({ 
  dashboardId, 
  onAdd, 
  open, 
  setOpen 
}: { 
  dashboardId: number; 
  onAdd: (widget: Widget) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { data: widgetTypes = [], isLoading } = useQuery<WidgetType[]>({
    queryKey: ["/api/widget-types"],
  });

  const { toast } = useToast();
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(widgetTypes.map(wt => wt.category)));

  // Filter widget types by selected category
  const filteredWidgetTypes = selectedCategory
    ? widgetTypes.filter(wt => wt.category === selectedCategory)
    : widgetTypes;

  const addWidgetMutation = useMutation({
    mutationFn: async (widgetData: any) => {
      const res = await apiRequest("POST", "/api/dashboard-widgets", widgetData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}`] });
      onAdd(data);
      setOpen(false);
      toast({
        title: "Widget added",
        description: "The widget has been added to your dashboard",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add widget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddWidget = (widgetType: WidgetType) => {
    setSelectedWidgetType(widgetType);
    
    const widgetData = {
      dashboardId,
      widgetTypeId: widgetType.id,
      title: widgetType.name,
      position: 0, // Will be positioned automatically 
      width: widgetType.defaultWidth,
      height: widgetType.defaultHeight,
      settings: {}
    };
    
    addWidgetMutation.mutate(widgetData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add widget to dashboard</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        
        {/* Category filter */}
        <div className="flex items-center gap-2 my-4">
          <span className="text-sm font-medium">Filter by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedCategory || "All categories"} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                All categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[400px] pr-2">
            {filteredWidgetTypes.map((widgetType) => (
              <Card key={widgetType.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    {getIconComponent(widgetType.icon)}
                    <CardTitle className="text-base">{widgetType.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>{widgetType.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => handleAddWidget(widgetType)}
                    disabled={addWidgetMutation.isPending}
                  >
                    Add widget
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Edit Widget Dialog
const EditWidgetDialog = ({ 
  widget, 
  open, 
  setOpen, 
  onSave 
}: { 
  widget: Widget | null; 
  open: boolean; 
  setOpen: (open: boolean) => void;
  onSave: () => void;
}) => {
  const [title, setTitle] = useState(widget?.title || "");
  const [width, setWidth] = useState(widget?.width || 2);
  const [height, setHeight] = useState(widget?.height || 2);
  const { toast } = useToast();

  // Update state when widget changes
  useEffect(() => {
    if (widget) {
      setTitle(widget.title || "");
      setWidth(widget.width || 2);
      setHeight(widget.height || 2);
    }
  }, [widget]);

  const updateWidgetMutation = useMutation({
    mutationFn: async (widgetData: any) => {
      if (!widget) throw new Error("No widget selected");
      const res = await apiRequest("PATCH", `/api/dashboard-widgets/${widget.id}`, widgetData);
      return await res.json();
    },
    onSuccess: () => {
      if (widget) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${widget.dashboardId}`] });
      }
      onSave();
      setOpen(false);
      toast({
        title: "Widget updated",
        description: "The widget has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update widget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!widget) return;
    
    updateWidgetMutation.mutate({
      title,
      width,
      height
    });
  };

  if (!widget) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit widget</DialogTitle>
          <DialogDescription>
            Customize your widget appearance and settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="width" className="text-right text-sm font-medium">
              Width
            </label>
            <div className="col-span-3 flex items-center gap-2">
              <input
                id="width"
                type="range"
                min={widget.widgetType?.minWidth || 1}
                max={widget.widgetType?.maxWidth || 4}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
              />
              <span className="w-8 text-center">{width}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="height" className="text-right text-sm font-medium">
              Height
            </label>
            <div className="col-span-3 flex items-center gap-2">
              <input
                id="height"
                type="range"
                min={widget.widgetType?.minHeight || 1}
                max={widget.widgetType?.maxHeight || 4}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
              />
              <span className="w-8 text-center">{height}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateWidgetMutation.isPending}>
            {updateWidgetMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CustomDashboardPage() {
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [editWidgetOpen, setEditWidgetOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const { toast } = useToast();

  // Create dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: async (dashboardData: any) => {
      const res = await apiRequest("POST", "/api/dashboards", dashboardData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/dashboards/default"], data);
      toast({
        title: "Dashboard created",
        description: "Your default dashboard has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch user's default dashboard or create if it doesn't exist
  const { 
    data: dashboard, 
    isLoading, 
    isError,
    error
  } = useQuery<Dashboard>({
    queryKey: ["/api/dashboards/default"]
  });
  
  // Handle error by creating a default dashboard
  useEffect(() => {
    if (isError && !createDashboardMutation.isPending) {
      // Create a default dashboard if none exists
      createDashboardMutation.mutate({
        name: "My Dashboard",
        isDefault: true,
        layout: {}
      });
    }
  }, [isError, createDashboardMutation.isPending]);

  // Delete widget mutation
  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: number) => {
      const res = await apiRequest("DELETE", `/api/dashboard-widgets/${widgetId}`);
      return res.status === 204;
    },
    onSuccess: () => {
      if (dashboard) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboard.id}`] });
      }
      toast({
        title: "Widget removed",
        description: "The widget has been removed from your dashboard",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove widget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveWidget = (widgetId: number) => {
    if (confirm("Are you sure you want to remove this widget?")) {
      deleteWidgetMutation.mutate(widgetId);
    }
  };

  const handleEditWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setEditWidgetOpen(true);
  };

  const handleWidgetAdded = (widget: Widget) => {
    // The query invalidation will handle updating the UI
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Customizable Dashboard</h1>
            <p className="text-neutral-500">Arrange and customize widgets to create your personalized dashboard</p>
          </div>
          <Button onClick={() => setAddWidgetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError && !createDashboardMutation.isPending ? (
          <Card>
            <CardHeader>
              <CardTitle>Error loading dashboard</CardTitle>
              <CardDescription>
                There was a problem loading your dashboard. Please try again.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/dashboards/default"] })}>
                Retry
              </Button>
            </CardFooter>
          </Card>
        ) : dashboard && dashboard.widgets && dashboard.widgets.length === 0 ? (
          <Card className="text-center p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Grid3X3 className="h-12 w-12 text-muted-foreground" />
              <CardTitle>No widgets added yet</CardTitle>
              <CardDescription>
                Your dashboard is empty. Click the button below to add your first widget.
              </CardDescription>
              <Button onClick={() => setAddWidgetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {dashboard?.widgets?.map((widget: Widget) => (
              <WidgetCard 
                key={widget.id} 
                widget={widget} 
                onRemove={handleRemoveWidget}
                onEdit={handleEditWidget}
              />
            ))}
          </div>
        )}

        {/* Add Widget Dialog */}
        {dashboard && (
          <AddWidgetDialog 
            dashboardId={dashboard.id} 
            onAdd={handleWidgetAdded}
            open={addWidgetOpen}
            setOpen={setAddWidgetOpen}
          />
        )}

        {/* Edit Widget Dialog */}
        <EditWidgetDialog 
          widget={selectedWidget}
          open={editWidgetOpen}
          setOpen={setEditWidgetOpen}
          onSave={() => {
            // This will be handled by the query invalidation
          }}
        />
      </div>
    </Layout>
  );
}