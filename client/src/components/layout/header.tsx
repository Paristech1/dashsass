import { useLocation, Link } from "wouter";
import { useState, startTransition } from "react";
import { Search, PlusCircle, Bell, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Direct navigation to ticket creation
  const handleCreateTicket = () => {
    navigate("/tickets/create");
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    startTransition(() => {
      setNotificationsOpen(!notificationsOpen);
    });
  };

  // Clear all notifications
  const clearNotifications = () => {
    startTransition(() => {
      setHasNotifications(false);
      setNotificationsOpen(false);
    });
  };

  return (
    <header className="bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tickets, users, or knowledge base"
            className="pl-10 pr-3 py-2 w-full bg-secondary text-foreground placeholder:text-muted-foreground border-border"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleCreateTicket}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 text-base font-medium shadow-lg rounded-lg transition-transform hover:scale-105"
          size="lg"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          <span>Create Ticket</span>
        </Button>
        
        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            className="relative p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="View notifications"
            onClick={toggleNotifications}
          >
            <Bell className="h-6 w-6" />
            {hasNotifications && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-card"></span>
            )}
          </button>
          
          {/* Notifications Dropdown Panel (Simplified) */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 bg-card rounded-md shadow-lg z-50 w-80 border">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-base font-semibold text-foreground">Notifications</div>
                <button 
                  className="text-muted-foreground hover:text-foreground" 
                  onClick={clearNotifications}
                  title="Clear all notifications"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
              
              {hasNotifications ? (
                <div>
                  <div className="p-3 hover:bg-secondary/70 cursor-pointer border-b">
                    <div className="font-medium text-foreground">New ticket: Network connectivity issue</div>
                    <div className="text-sm text-muted-foreground">2 minutes ago</div>
                  </div>
                  <div className="p-3 hover:bg-secondary/70 cursor-pointer border-b">
                    <div className="font-medium text-foreground">Ticket updated: Printer not working</div>
                    <div className="text-sm text-muted-foreground">15 minutes ago</div>
                  </div>
                  <div className="p-3 hover:bg-secondary/70 cursor-pointer border-b">
                    <div className="font-medium text-foreground">New comment on ticket #HD-1234</div>
                    <div className="text-sm text-muted-foreground">1 hour ago</div>
                  </div>
                  <div className="p-2 text-center border-t">
                    <Link href="/notifications" className="text-primary text-sm hover:underline">
                      View all notifications
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Menu (Simplified) */}
        <div className="relative">
          <button 
            onClick={() => navigate("/profile")}
            className="flex items-center"
          >
            <img
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'John Smith')}&background=0D8ABC&color=fff`}
              alt="User avatar"
              className="h-8 w-8 rounded-full cursor-pointer ring-1 ring-border"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
