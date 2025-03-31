import { Layout } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BadgeCheck, Building, Clock, FileText, Handshake, Mail, Package, ShieldAlert, User } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{user?.name || user?.username}</h3>
                  <p className="text-neutral-500">{user?.role || "Procurement Manager"}</p>
                  <div className="flex items-center mt-2 text-sm text-primary">
                    <BadgeCheck className="w-4 h-4 mr-1" />
                    <span>Verified Account</span>
                  </div>
                  <Button className="mt-4 w-full" variant="outline">
                    Edit Profile
                  </Button>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-neutral-400" />
                    <span>{user?.email || "john.doe@example.com"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-neutral-400" />
                    <span>Procurement Department</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                    <span>Member since {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ActivityItem 
                      icon={<Handshake className="w-5 h-5 text-green-500" />}
                      title="Negotiation Started"
                      description="You started a new negotiation with Dell Technologies"
                      time="2 hours ago"
                    />
                    <ActivityItem 
                      icon={<FileText className="w-5 h-5 text-blue-500" />}
                      title="Contract Generated"
                      description="A new contract was generated for Office Supplies"
                      time="Yesterday"
                    />
                    <ActivityItem 
                      icon={<User className="w-5 h-5 text-purple-500" />}
                      title="Profile Updated"
                      description="You updated your profile information"
                      time="3 days ago"
                    />
                    <ActivityItem 
                      icon={<Package className="w-5 h-5 text-amber-500" />}
                      title="Supplier Added"
                      description="You added AWS as a new supplier"
                      time="1 week ago"
                    />
                    
                    <Button variant="ghost" className="w-full flex items-center justify-center mt-2">
                      View All Activity
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your account security and password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldAlert className="w-5 h-5 text-amber-500 mr-2" />
                          <div>
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-neutral-500">Secure your account with 2FA</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Password</h4>
                      <p className="text-sm text-neutral-500 mb-3">Last changed 3 months ago</p>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Session History</h4>
                      <p className="text-sm text-neutral-500 mb-3">Manage your active sessions</p>
                      <Button variant="outline" size="sm">View Sessions</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle>API Access</CardTitle>
                    <CardDescription>
                      Manage API keys and integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-1">OpenAI API Key</h4>
                        <p className="text-sm text-neutral-500 mb-3">Used for AI-powered negotiations</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-mono bg-neutral-100 p-2 rounded">••••••••••••••••</div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">Refresh</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Revoke</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-1">Webhooks</h4>
                        <p className="text-sm text-neutral-500 mb-3">Get notified about events</p>
                        <Button variant="outline" size="sm">Configure Webhooks</Button>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-1">Integrations</h4>
                        <p className="text-sm text-neutral-500 mb-3">Connect with other services</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">CRM Systems</Button>
                          <Button variant="outline" size="sm">ERP Systems</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <div className="text-xs text-neutral-400">{time}</div>
    </div>
  );
}