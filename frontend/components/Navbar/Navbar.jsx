"use client";

import { useEffect, useState, useContext } from "react";
import { Menu, X } from "lucide-react";
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
  const [user, setUser] = useState("");

  const links = [
    { href: "/", label: "Ride" },
    { href: "/driversignup", label: "Drive" },
    { href: "/", label: "Help" },
    { href: "/signup", label: "Sign up" },
  ];

  const handleLogout = () => {
    set_user(null);
    localStorage.removeItem("user");
    setUser("");
  };

  useEffect(() => {
    const userName = localStorage.getItem("user");
    console.log("Username: ", userName);
    if (userName) {
      setUser(userName);
    }
  });

  return (
    <nav className="bg-black text-white px-6 py-4 z-10 flex items-center justify-between relative">
      <div className="text-2xl font-bold">RideBook</div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {user.length > 0 ? (
          <>
            <p>{user}</p>
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

      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black text-white flex flex-col items-center space-y-4 py-6 md:hidden">
          {user.length > 0 ? (
            <>
              <p>{user}</p>
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
      )}
    </nav>
  );
}
