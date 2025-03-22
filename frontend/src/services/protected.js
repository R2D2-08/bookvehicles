"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ProtectedRoutes = ({ children, roles = []}) => {
  const router = useRouter();
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
        }

        console.log(roles);

        const res = await response.json();
        if(!roles.includes(res.role)) {
          console.log(res.role);
          toast.error("Not Authorized"); 
          router.replace("/booking");
        }
        setIsAuthenticated(true);
      } catch (error) {
        toast.error("Authenticated failed");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  return children;
};

export default ProtectedRoutes;
