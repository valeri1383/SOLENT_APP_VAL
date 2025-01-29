'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function SignUpPage() {
  // State to manage user input
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // State to handle loading indicator
  const [isProcessing, setIsProcessing] = useState(false)
  // State to display error messages
  const [error, setError] = useState(null)
  // Next.js router for navigation
  const router = useRouter()

  // Function to handle the form submission
  const handleRegistration = async (e) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (userDetails.password !== userDetails.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsProcessing(true)

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userDetails.email,
        userDetails.password
      )

      const user = userCredential.user // Retrieve user data from the response

      // Update user profile with the full name
      await updateProfile(user, {
        displayName: userDetails.fullName
      })

      // Create a Firestore document for the new user
      await setDoc(doc(db, 'users', user.uid), {
        name: userDetails.fullName,
        email: userDetails.email,
        createdAt: new Date(), // Timestamp of account creation
        is_admin: false, // Set default admin status
        eventList: [] // Initialize with an empty list of events
      })

      // Redirect user to the sign-in page
      router.push('/signin')
    } catch (error) {
      // Handle Firebase authentication errors
      let errorMessage = 'Registration failed'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered'
          break
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address'
          break
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters'
          break
        default:
          errorMessage = error.message
      }
      
      setError(errorMessage) // Display the appropriate error message
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Link to return to the homepage */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Return to Home
        </Link>
      </div>

      {/* Page header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      {/* Form container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleRegistration}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={userDetails.fullName}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    fullName: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    email: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={userDetails.password}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    password: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={userDetails.confirmPassword}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    confirmPassword: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">
                  {error}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                  ) : "Create Account"}
                  </button>
                </div>
    
                {/* Link to Sign In Page */}
                <div className="text-sm text-center">
                  <span className="text-gray-600">Already have an account?</span>
                  {" "}
                  <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      )
    }