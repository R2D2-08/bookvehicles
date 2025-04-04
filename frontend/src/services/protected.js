"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ProtectedRoutes = ({ children, roles = []}) => {
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
          toast.error("Not authenticated");
          router.push("/login");
          setLoading(false);
          return;
        }

        const res = await response.json();
        if(!roles.includes(res.role)) {
          console.log(res.role);
          toast.error("Not Authorized"); 
          router.replace("/booking");
          setLoading(false);
          return;
        }
        
        // Only set authenticated if both checks pass
        setIsAuthenticated(true);
      } catch (error) {
        toast.error("Not authenticated");
        router.replace("/login"); // Immediate redirect without UI flicker
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    checkAuth();
  }, [router, roles]);

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
