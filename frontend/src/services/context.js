"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user_details, set_user] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/check-auth",
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          set_user(data);
        } else {
          setIsAuthenticated(false);
          set_user(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        set_user(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to logout user
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      set_user(null);
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user_details, 
      set_user, 
      loading, 
      isAuthenticated, 
      setIsAuthenticated,
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easier access to the context
export const useAuth = () => useContext(UserContext);
