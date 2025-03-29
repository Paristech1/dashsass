import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Inbox,
  TicketCheck,
  BarChart3,
  Users,
  BookOpen,
  Bell,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Get tickets count for the current user
  const ticketCountQuery = useQuery<number>({
    queryKey: ['/api/tickets/count'],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return 0;
      
      try {
        // Get all tickets
        const response = await fetch('/api/tickets');
        if (!response.ok) return 0;
        
        const tickets = await response.json();
        
        // Count tickets that are either assigned to or reported by the current user
        const userTicketsCount = tickets.filter((ticket: any) => 
          ticket.assignedToId === user.id || ticket.reportedById === user.id
        ).length;
        
        return userTicketsCount;
      } catch (error) {
        console.error("Error fetching ticket count:", error);
        return 0;
      }
    }
  });

  // Navigation items
  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    },
    {
      href: "/tickets",
      label: "My Tickets",
      icon: <Inbox className="h-5 w-5 mr-3" />,
      badge: !ticketCountQuery.isLoading && ticketCountQuery.data && ticketCountQuery.data > 0 ? ticketCountQuery.data : null,
    },
    {
      href: "/tickets/all",
      label: "All Tickets",
      icon: <TicketCheck className="h-5 w-5 mr-3" />,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
    },
  ];

  const supportNavItems = [
    {
      href: "/team",
      label: "Team",
      icon: <Users className="h-5 w-5 mr-3" />,
    },
    {
      href: "/knowledge-base",
      label: "Knowledge Base",
      icon: <BookOpen className="h-5 w-5 mr-3" />,
    },
  ];

  const settingsNavItems = [
    {
      href: "/notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5 mr-3" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white shadow-md z-20 flex flex-col h-screen fixed">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
            M
          </div>
          <span className="font-semibold text-gray-900">Modern Ticketing</span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Navigation */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors duration-200 ${
              isActive(item.href)
                ? "bg-primary-50 text-primary-700"
                : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            <div className="flex items-center">
              {item.icon}
              {item.label}
            </div>
            {item.badge && (
              <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}

        {/* Support Section */}
        <div className="mt-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Support
        </div>
        
        {supportNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors duration-200 ${
              isActive(item.href)
                ? "bg-primary-50 text-primary-700"
                : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {/* Settings Section */}
        <div className="mt-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Settings
        </div>
        
        {settingsNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors duration-200 ${
              isActive(item.href)
                ? "bg-primary-50 text-primary-700"
                : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer with User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <img
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'John Smith')}&background=0D8ABC&color=fff`}
            alt="User avatar"
            className="h-9 w-9 rounded-full"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.fullName || "John Smith"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.department || "IT Support"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
