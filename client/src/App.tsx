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
import ContractsPage from "@/pages/contracts-page";
import SettingsPage from "@/pages/settings-page";
import AccountPage from "@/pages/account-page";
import SpendAnalysisPage from "@/pages/spend-analysis-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/negotiations" component={NegotiationsPage} />
      <ProtectedRoute path="/negotiations/:id" component={NegotiationDetails} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} />
      <ProtectedRoute path="/contracts" component={ContractsPage} />
      <ProtectedRoute path="/spend-analysis" component={SpendAnalysisPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/account" component={AccountPage} />
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
