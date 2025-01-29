'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/navigation/Header'
import MapComponent from '@/components/map/MapComponent'

export default function HomePage() {
  // State variables
  const [user, setUser] = useState(null) // Store user details
  const [isAdmin, setIsAdmin] = useState(false) // Track if the user has admin privileges
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Track login status

  // Effect hook to handle user data and admin status on component mount
  useEffect(() => {
    // Function to check if the user is an admin
    const checkAdminStatus = async (userId) => {
      try {
        const userDocRef = doc(db, "users", userId)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().is_admin === true)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    // Retrieve user data from session storage
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setIsLoggedIn(parsedUser.isLoggedIn)
      
      if (parsedUser?.uid) {
        checkAdminStatus(parsedUser.uid)
      }
    }

    // Event listener to handle user login events
    const handleLogin = (event) => {
      const loggedInUser = event.detail.user
      setUser(loggedInUser)
      
      if (loggedInUser?.uid) {
        checkAdminStatus(loggedInUser.uid)
      }
    }

    // Add and clean up the event listener
    window.addEventListener('userLogin', handleLogin)
    return () => window.removeEventListener('userLogin', handleLogin)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Render the Header component, passing user data and login/admin status as props */}
      <Header user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="min-h-[75vh]">
          {/* Render the MapComponent with user data and login/admin status as props */}
          <MapComponent isLoggedIn={isLoggedIn} user={user} isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  )
}