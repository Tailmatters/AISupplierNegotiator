import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import DashboardPage from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import NegotiationsPage from "@/pages/negotiations-page";
import SuppliersPage from "@/pages/suppliers-page";
import NegotiationDetails from "@/pages/negotiation-details";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/negotiations" component={NegotiationsPage} />
      <ProtectedRoute path="/negotiations/:id" component={NegotiationDetails} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
