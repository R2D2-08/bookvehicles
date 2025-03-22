"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/services/context";
import Link from "next/link";

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
  const { user_details, set_user } = useContext(UserContext);

  const links = [
    { href: "/", label: "Ride" },
    { href: "/driversignup", label: "Drive" },
    { href: "/", label: "Help" },
    { href: "/signup", label: "Sign up" },
  ];

  const handleLogout = () => {
    set_user(null); 
  };

  return (
    <nav className="bg-black text-white px-6 py-4 z-10 flex items-center justify-between">
      <div className="text-2xl font-bold">RideBook</div>

      <div className="hidden md:flex items-center space-x-6">
        {user_details ? (
          <>
            <p>{user_details.name}</p>
            <NavButton onClick={handleLogout}>Log out</NavButton>
          </>
        ) : (
          <>
            {links.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
            <NavButton onClick={() => (window.location.href = "/login")}>
              Log in
            </NavButton>
          </>
        )}
      </div>

      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>


      {isOpen && (
        <div className="absolute top-16 z-10 left-0 w-full bg-black text-white flex flex-col items-center space-y-4 py-6 md:hidden">
          {links.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          <NavButton onClick={() => (window.location.href = "/login")}>
            Log in
          </NavButton>
        </div>
      )}
    </nav>
  );
}