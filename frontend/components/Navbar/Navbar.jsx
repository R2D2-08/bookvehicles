"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/services/context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NavLink = ({ href, children }) => (
  <Link href={href} className="hover:text-gray-300">
    {children}
  </Link>
);

const NavButton = ({ onClick, children }) => (
  <button
    className="bg-white text-black font-semibold px-4 py-2 rounded-2xl hover:bg-gray-100 transition"
    onClick={onClick}
  >
    {children}
  </button>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user_details, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: "/", label: "Ride" },
    { href: "/signup/driver", label: "Drive" },
    { href: "/", label: "Help" },
    { href: "/signup", label: "Sign up" },
  ];

  const authenticatedLinks = [
    { href: "/booking", label: "Book a Ride" },
    { href: "/profile", label: "Profile" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <nav className="bg-black text-white px-6 py-4 z-10 flex items-center justify-between relative">
      <div className="text-2xl font-bold">🥥 KeraGo</div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {isAuthenticated ? (
          <>
            {authenticatedLinks.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
            <p>{user_details?.name || "User"}</p>
            <NavButton onClick={handleLogout}>Log out</NavButton>
          </>
        ) : (
          <>
            {links.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
            <NavButton onClick={handleLogin}>
              Log in
            </NavButton>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black text-white flex flex-col items-center space-y-4 py-6 md:hidden">
          {isAuthenticated ? (
            <>
              {authenticatedLinks.map((link) => (
                <NavLink key={link.label} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
              <p>{user_details?.name || "User"}</p>
              <NavButton onClick={handleLogout}>Log out</NavButton>
            </>
          ) : (
            <>
              {links.map((link) => (
                <NavLink key={link.label} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
              <NavButton onClick={handleLogin}>
                Log in
              </NavButton>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
