import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "@/context/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

// Lazy-load pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const TicketsList = lazy(() => import("@/pages/tickets/index"));
const CreateTicket = lazy(() => import("@/pages/tickets/create"));
const TicketDetail = lazy(() => import("@/pages/tickets/detail"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const TeamPage = lazy(() => import("@/pages/team"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen pl-64">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/tickets">
        <Layout>
          <TicketsList />
        </Layout>
      </Route>
      <Route path="/tickets/create">
        <Layout>
          <CreateTicket />
        </Layout>
      </Route>
      <Route path="/tickets/:id">
        {(params) => (
          <Layout>
            <TicketDetail id={params.id} />
          </Layout>
        )}
      </Route>
      <Route path="/knowledge-base">
        <Layout>
          <KnowledgeBase />
        </Layout>
      </Route>
      <Route path="/team">
        <Layout>
          <TeamPage />
        </Layout>
      </Route>
      <Route>
        <NotFound />
      </Route>
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
