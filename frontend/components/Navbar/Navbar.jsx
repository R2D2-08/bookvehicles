"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold">RideBook</div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <a href="#" className="hover:text-gray-300">Ride</a>
        <a href="#" className="hover:text-gray-300">Drive</a>
        <a href="#" className="hover:text-gray-300">Help</a>
        <a href="#" className="hover:text-gray-300">Sign up</a>
        <button className="bg-white text-black font-semibold px-4 py-2 rounded-2xl">
          Log in
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black text-white flex flex-col items-center space-y-4 py-6 md:hidden">
          <a href="#" className="hover:text-gray-300">Ride</a>
          <a href="#" className="hover:text-gray-300">Drive</a>
          <a href="#" className="hover:text-gray-300">Help</a>
          <a href="#" className="hover:text-gray-300">Sign up</a>
          <button className="bg-white text-black font-semibold px-4 py-2 rounded-2xl">
            Log in
          </button>
        </div>
      )}
    </nav>
  );
}
