'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const Header = ({ user, isLoggedIn, isAdmin }) => {
  // Use Next.js router for navigation
  const router = useRouter()

  // Handle user logout by clearing session storage and redirecting to home page
  const handleLogout = () => {
    sessionStorage.removeItem('user') // Remove user data from session storage
    router.push('/') // Redirect to homepage
    window.location.reload() // Reload the page to update the UI
  }

  return (
    <header className="w-full">
      {/* Top section with background gradient for the header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-3">
        <div className="container mx-auto px-4">
          {/* Main header text with two-part title */}
          <h1 className="text-center text-2xl md:text-3xl font-bold">
            <span className="text-white">SOLENT</span>
            <span className="text-gray-200"> MEETUPS AND SOCIAL EVENTS</span>
          </h1>
        </div>
      </div>

      {/* Navigation bar below the header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          {/* Flexbox container for layout */}
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              
              {isAdmin && (
                <Link 
                  href="/admin"
                  className="text-lg font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Event Managment
                </Link>
              )}
            </div>

            {/* Right section for user sign-in/sign-up or user info if logged in */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-600">Welcome,</span>
                    <span className="font-medium text-gray-800">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  {/* Button to log out */}
                  <button 
                    onClick={handleLogout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  {/* Links for sign-in and sign-up if not logged in */}
                  <Link 
                    href="/signin"
                    className="inline-flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header