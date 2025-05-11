import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

// Mock authentication state - in a real app, this would come from a proper auth system
const ADMIN_MODE = true; // Toggle this for testing

export function Header() {
  const [location] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  // Simulate checking if the user is an admin
  useEffect(() => {
    // In a real application, this would be a call to check the user's role
    setIsAdmin(ADMIN_MODE);
  }, []);

  const isActive = (path: string) => {
    return location === path
      ? "text-primary font-medium"
      : "text-gray-600 hover:text-gray-900";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <Link href="/">
              <a className="text-xl font-bold text-gray-900">EventExtract</a>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link href="/">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/")}`}>
                Home
              </a>
            </Link>
            <Link href="/events">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/events")}`}>
                Events
              </a>
            </Link>
            {isAdmin && (
              <Link href="/upload">
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/upload")}`}>
                  Upload
                </a>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
