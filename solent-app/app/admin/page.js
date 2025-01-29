'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Link from 'next/link'

export default function AdminPage() {
  // State to track if the user has admin privileges
  const [isAdmin, setIsAdmin] = useState(false)
  // State to track if the application is still loading
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Function to verify if the current user has admin privileges
    const checkAdminStatus = async () => {
      const userData = sessionStorage.getItem('user')
      if (!userData) {
        router.push('/signin')
        return
      }

      try {
        const user = JSON.parse(userData)
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)
        
        // Check if the user document exists and the user is an admin
        if (userDoc.exists() && userDoc.data().is_admin) {
          setIsAdmin(true)// Grant access if user is an admin
        } else {
          router.push('/')// Redirect to the homepage if not an admin
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push('/')// Redirect to homepage on error
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [router])

  if (isLoading) {
    // Display a loading indicator while verifying credentials
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking credentials...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    // Render an access denied message for non-admin users
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
  // Render the admin dashboard for authenticated admin users
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Return to Home
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard />
      </main>
    </div>
  )
}