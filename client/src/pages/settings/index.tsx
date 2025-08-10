import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings state
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [ticketAssigned, setTicketAssigned] = useState(true);
  const [ticketUpdated, setTicketUpdated] = useState(true);
  const [commentAdded, setCommentAdded] = useState(true);
  
  // Appearance settings
  const [theme, setTheme] = useState("light");
  const [compactMode, setCompactMode] = useState(false);
  
  // Handle profile update
  const handleProfileUpdate = () => {
    // In a real application, we would call an API endpoint to update the user's profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  // Handle notification settings update
  const handleNotificationUpdate = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  // Handle appearance settings update
  const handleAppearanceUpdate = () => {
    toast({
      title: "Appearance Settings Updated",
      description: "Your appearance preferences have been saved.",
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input 
                    id="full-name"
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                  <Switch
                    id="desktop-notifications"
                    checked={desktopNotifications}
                    onCheckedChange={setDesktopNotifications}
                  />
                </div>
                
                <Separator />
                <h3 className="text-lg font-medium">Notify me when:</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="ticket-assigned">A ticket is assigned to me</Label>
                  <Switch
                    id="ticket-assigned"
                    checked={ticketAssigned}
                    onCheckedChange={setTicketAssigned}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="ticket-updated">A ticket I'm involved with is updated</Label>
                  <Switch
                    id="ticket-updated"
                    checked={ticketUpdated}
                    onCheckedChange={setTicketUpdated}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="comment-added">A comment is added to my ticket</Label>
                  <Switch
                    id="comment-added"
                    checked={commentAdded}
                    onCheckedChange={setCommentAdded}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleNotificationUpdate}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex space-x-2">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                    >
                      System
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <Switch
                    id="compact-mode"
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleAppearanceUpdate}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 