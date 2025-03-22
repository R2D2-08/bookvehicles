"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ProtectedRoutes = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/check-auth",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Not authenticated");
        }

        setIsAuthenticated(true);
      } catch (error) {
        toast.error("Not authenticated");
        router.replace("/login"); // Immediate redirect without UI flicker
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null; // Don't render anything if not authenticated
};

export default ProtectedRoutes;
