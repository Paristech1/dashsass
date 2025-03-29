import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // In a real app, we would fetch the current user from a /me endpoint
  // For this demo, we'll use a placeholder user
  const { 
    data: fetchedUser, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/users/1'],
    queryFn: async () => {
      // Simulate a delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the first user as the logged-in user
      return {
        id: 1,
        username: 'johnsmith',
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        role: 'agent',
        department: 'IT Support',
        avatarUrl: null
      };
    },
    staleTime: Infinity, // Don't refetch once we have the user
  });
  
  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);
  
  // Mock login function
  const login = async (username: string, password: string) => {
    try {
      // In a real app, this would make an API call to authenticate
      setUser({
        id: 1,
        username: username,
        password: '',
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        role: 'agent',
        department: 'IT Support',
        avatarUrl: null
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  
  // Mock logout function
  const logout = () => {
    // In a real app, this would call an API endpoint and clear tokens
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, error: error as Error | null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
