import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import Overview from "@/pages/Overview";
import Traffic from "@/pages/Traffic";
import Sections from "@/pages/Sections";
import Heatmap from "@/pages/Heatmap";
import Checkout from "@/pages/Checkout";
import Alerts from "@/pages/Alerts";
import Pipeline from "@/pages/Pipeline";
import Admin from "@/pages/Admin";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/traffic" component={Traffic} />
      <Route path="/sections" component={Sections} />
      <Route path="/heatmap" component={Heatmap} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/pipeline" component={Pipeline} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <Layout>
            <AppRouter />
          </Layout>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
