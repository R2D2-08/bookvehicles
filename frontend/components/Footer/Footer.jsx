import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-6 z-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold">RideShare</h2>
          <p className="text-gray-400 text-sm">Your trusted ride, anytime.</p>
        </div>

        <nav className="flex gap-6 my-4 md:my-0">
          <a href="#" className="text-gray-300 hover:text-white transition">About</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Careers</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Support</a>
        </nav>

        <div className="flex gap-4">
          <a href="#" className="text-gray-400 hover:text-white transition">
            <Facebook size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <Twitter size={20} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <Instagram size={20} />
          </a>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-4">
        &copy; {new Date().getFullYear()} RideBook. All rights reserved.
      </p>
    </footer>
  );
}
