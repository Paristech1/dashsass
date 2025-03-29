import { Suspense, lazy, Component, ReactNode, startTransition } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "@/context/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotificationListener } from "@/components/notifications/notification-listener";

// Error boundary for catching runtime errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen flex-col p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">The application encountered an unexpected error.</p>
          <pre className="bg-gray-100 p-4 rounded-md text-sm mb-6 max-w-xl overflow-auto">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy-load pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MyTickets = lazy(() => import("@/pages/tickets/index"));
const AllTickets = lazy(() => import("@/pages/tickets/all"));
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
      <Route path="/tickets/all">
        <Layout>
          <AllTickets />
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
      <Route path="/tickets">
        <Layout>
          <MyTickets />
        </Layout>
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
      <Route path="/">
        <Layout>
          <Dashboard />
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
        <ErrorBoundary>
          <Router />
          <NotificationListener />
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
