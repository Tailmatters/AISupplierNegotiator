import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Handshake,
  Building2,
  FileText,
  Settings,
  User,
  Menu,
  X,
  CreditCard
} from "lucide-react";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      group: "Main",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/" },
        { label: "Negotiations", icon: <Handshake className="w-5 h-5" />, path: "/negotiations" },
        { label: "Suppliers", icon: <Building2 className="w-5 h-5" />, path: "/suppliers" },
        { label: "Contracts", icon: <FileText className="w-5 h-5" />, path: "/contracts" },
      ],
    },
    {
      group: "Settings",
      items: [
        { label: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
        { label: "Account", icon: <User className="w-5 h-5" />, path: "/account" },
      ],
    },
  ];

  return (
    <aside 
      className={`bg-white shadow-md overflow-y-auto flex flex-col ${
        mobile 
          ? "w-64 fixed inset-y-0 left-0 z-50" 
          : "w-64 hidden md:flex h-screen fixed"
      }`}
    >
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white mr-3">
            <CreditCard size={16} />
          </div>
          <h1 className="text-xl font-semibold text-primary">AI Negotiator</h1>
        </div>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <nav className="p-4 flex-1 overflow-y-auto">
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex} className={groupIndex > 0 ? "mt-6" : ""}>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">
              {group.group}
            </p>
            
            {group.items.map((item, index) => (
              <Link 
                key={index} 
                href={item.path}
                onClick={mobile ? onClose : undefined}
              >
                <a 
                  className={`flex items-center p-3 rounded-md mb-1 ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <span className="w-5 text-center mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      
      <div className="border-t border-neutral-100 p-4">
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user?.name || user?.username}</p>
            <p className="text-xs text-neutral-400">{user?.role || "Procurement Manager"}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full mt-3"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-20 h-16 flex items-center px-4 justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-3" 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white mr-2">
              <CreditCard size={14} />
            </div>
            <h1 className="text-lg font-semibold text-primary">AI Negotiator</h1>
          </div>
        </div>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-neutral-900 opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
        </>
      )}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">{children}</main>
    </div>
  );
}
