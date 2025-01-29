'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function SignInPage() {
  // State to hold the user's credentials (email and password)
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  // State to track any authentication errors
  const [authError, setAuthError] = useState('')
  // State to track the loading status while signing in
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Handle form submission and user authentication
  const handleAuthentication = async (e) => {
    e.preventDefault()
    setAuthError('') // Clear any previous errors
    setIsProcessing(true)

    try {
      // Attempt to sign in the user with the provided credentials
      const authResult = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      )
      
      // Fetch the user's record from Firestore
      const userRecord = await getDoc(doc(db, 'users', authResult.user.uid))
      
      // Create a user details object including data from both Firebase Auth and Firestore
      const userDetails = {
        uid: authResult.user.uid,
        email: authResult.user.email,
        displayName: authResult.user.displayName || '',
        ...userRecord.exists() ? userRecord.data() : {}
      }

      // Store user data in sessionStorage for session persistence
      sessionStorage.setItem('user', JSON.stringify({
        ...userDetails,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
      }))

      // Dispatch a custom event to notify other parts of the application about the user login
      window.dispatchEvent(new CustomEvent('userLogin', { 
        detail: { user: userDetails }
      }))

      // Redirect the user to the homepage after successful login
      router.push('/')
    } catch (error) {
      // Handle authentication errors based on Firebase error codes
      let errorMessage = 'Authentication failed'
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been deactivated'
          break
        case 'auth/user-not-found':
          errorMessage = 'Account not found'
          break
        case 'auth/wrong-password':
          errorMessage = 'Invalid password'
          break
        default:
          errorMessage = error.message
      }
      // Set the error message to be displayed
      setAuthError(errorMessage)
    } finally {
      // End the loading process
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4">
        {/* Link back to the homepage */}
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Return to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAuthentication}>
            {/* Email input field */}
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
                  value={credentials.email}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    email: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Password input field */}
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
                  value={credentials.password}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    password: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Display authentication errors, if any */}
            {authError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">
                  {authError}
                </div>
              </div>
            )}

            {/* Submit button with loading spinner while processing */}
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
                    Signing in...
                  </div>
                ) : "Sign in"}
              </button>
            </div>

            {/* Link to sign-up page */}
            <div className="text-sm text-center">
              <span className="text-gray-600">Don't have an account?</span>
              {" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}