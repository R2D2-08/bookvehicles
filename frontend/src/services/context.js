"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  
  const [user_details, set_user] = useState(null);
  const [loading, setLoading] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const fetchDetails = async() => {
      const response = await fetch("http://localhost:5000/api/users/details", {
        method: "GET",
        credentials: "include"
      });

      if(!response.ok) {
        toast.error("Failed to fetch details");
        router.replace("/login");
      }

      const data = await response.json();
      set_user(data);
    };
    
    try {
      fetchDetails();
    } catch(err) {
      toast.error(err);
    }
  }, []);

  return <UserContext.Provider value={{ user_details, set_user, loading }}>
    {children}
  </UserContext.Provider>;
};
