"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user_details, set_user] = useState(null);
  const [loading, setLoading] = useState(null);
  const router = useRouter();

  return (
    <UserContext.Provider value={{ user_details, set_user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
