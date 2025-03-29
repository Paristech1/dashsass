import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, PlusCircle, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handleCreateTicket = () => {
    setIsCreateDialogOpen(false);
    navigate("/tickets/create");
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tickets, users, or knowledge base"
            className="pl-10 pr-3 py-2 w-full"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          <span>New Ticket</span>
        </Button>
        <button
          type="button"
          className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="View notifications"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <img
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'John Smith')}&background=0D8ABC&color=fff`}
          alt="User avatar"
          className="h-8 w-8 rounded-full cursor-pointer"
        />
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Create New Ticket</DialogTitle>
          <div className="py-4">
            <p>Would you like to create a new support ticket?</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>Create Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
