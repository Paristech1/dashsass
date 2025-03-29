import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, TicketCheck, MessageSquare, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

// Mock notification data - in a real app this would come from an API
const mockNotifications = [
  {
    id: 1,
    type: "ticket_assigned",
    title: "Ticket assigned to you",
    content: "Ticket #TKT-0012: 'Network Connection Issue' has been assigned to you.",
    ticketId: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false
  },
  {
    id: 2,
    type: "ticket_updated",
    title: "Ticket status changed",
    content: "Ticket #TKT-0008 status changed from 'Open' to 'In Progress'",
    ticketId: 8,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: false
  },
  {
    id: 3,
    type: "comment_added",
    title: "New comment on ticket",
    content: "John Smith added a comment to Ticket #TKT-0015",
    ticketId: 15,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isRead: true
  },
  {
    id: 4,
    type: "sla_alert",
    title: "SLA Breach Warning",
    content: "Ticket #TKT-0010 is about to breach SLA in 1 hour",
    ticketId: 10,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isRead: true
  },
  {
    id: 5,
    type: "ticket_assigned",
    title: "Ticket assigned to you",
    content: "Ticket #TKT-0007: 'Password Reset Request' has been assigned to you.",
    ticketId: 7,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true
  },
];

// Type for our notification
interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  ticketId: number;
  createdAt: Date;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return true;
  });
  
  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(currentNotifications => 
      currentNotifications.map(notification => ({
        ...notification,
        isRead: true
      }))
    );
  };
  
  // Mark a single notification as read
  const markAsRead = (id: number) => {
    setNotifications(currentNotifications => 
      currentNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket_assigned":
        return <TicketCheck className="h-5 w-5 text-primary" />;
      case "ticket_updated":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "comment_added":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "sla_alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <div className="flex space-x-4">
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">
              All 
              <Badge className="ml-2 bg-gray-200 text-gray-800" variant="secondary">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread 
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary text-white" variant="default">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View all notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications available</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="relative">
                      <div 
                        className={`p-4 border rounded-md flex gap-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-base font-medium ${!notification.isRead ? 'text-black' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                          <div className="mt-2">
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-sm text-primary"
                            >
                              View Ticket
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>View notifications you haven't read yet</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">No unread notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="relative">
                      <div 
                        className="p-4 border rounded-md flex gap-4 hover:bg-gray-50 cursor-pointer bg-blue-50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="text-base font-medium text-black">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                          <div className="mt-2">
                            <Button 
                              variant="link" 
                              className="h-auto p-0 text-sm text-primary"
                            >
                              View Ticket
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 