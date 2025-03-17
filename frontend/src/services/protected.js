import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'sonner';

const ProtectedRoutes = ({children}) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const checkAuth = async() => {
        try {
            const response = await fetch("http://localhost:3000/api/users/check-auth", {
                credentials: "include"

            });

            if(!response.ok) {
                toast.error("Not authenticated");
                router.push("/login");
            }
            setIsAuthenticated(true);
        } catch(error) {
            toast.error("Authenticated failed");
            router.push("/login");
        }
    }
    
    checkAuth();
  }, [router])
  
    if(!isAuthenticated) {
        return <p>Loading...</p>
    }
    return children;
}

export default ProtectedRoutes
