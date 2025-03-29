import { useLocation } from "wouter";
import { Search, PlusCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Direct navigation to ticket creation
  const handleCreateTicket = () => {
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
          onClick={handleCreateTicket}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2 text-base font-medium shadow-lg rounded-lg transition-transform hover:scale-105"
          size="lg"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          <span>Create Ticket</span>
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
    </header>
  );
}
