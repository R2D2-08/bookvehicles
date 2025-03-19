"use client";

import { createContext, useContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user_details, set_user] = useState(null);
  const [loading, setLoading] = useState(null);

  <UserContext.Provider value={{ user_details, set_user, loading }}>
    {children}
  </UserContext.Provider>;
};
