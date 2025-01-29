'use client'

import { useState, useEffect } from 'react'
import { getDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const EventList = ({ userId }) => {
  // State variables to manage events, loading status, error, and cancelling event
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingEvent, setCancellingEvent] = useState(null)

  // useEffect hook to fetch user events based on userId
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true)

        // Fetch the user's document from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId))

        // If user document doesn't exist, throw an error
        if (!userDoc.exists()) {
          throw new Error('User not found')
        }

        // Extract user data and event list
        const userData = userDoc.data()
        const eventIds = userData.eventList || []

        // Fetch the event details for each event the user is part of
        const eventsData = await Promise.all(
          eventIds.map(async (eventId) => {
            const eventDoc = await getDoc(doc(db, 'event_list', eventId))
            // If the event exists, return the event data
            if (eventDoc.exists()) {
              return { id: eventDoc.id, ...eventDoc.data() }
            }
            return null // Skip if the event doesn't exist
          })
        )

        // Filter out null events and update the state
        setEvents(eventsData.filter(event => event !== null))
      } catch (err) {
        // Handle errors during fetching
        console.error('Error fetching user events:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Fetch user events if userId is available
    if (userId) {
      fetchUserEvents()
    }
  }, [userId])

  // Function to handle event booking cancellation
  const handleCancelBooking = async (eventId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      setCancellingEvent(eventId) // Mark the event as being cancelled
      
      const userRef = doc(db, 'users', userId)
      const eventRef = doc(db, 'event_list', eventId)
      
      // Get current event data
      const eventDoc = await getDoc(eventRef)
      if (!eventDoc.exists()) {
        throw new Error('Event not found')
      }

      // Update both the user and event documents in Firestore
      await Promise.all([
        updateDoc(userRef, {
          eventList: arrayRemove(eventId) // Remove eventId from user's eventList
        }),
        updateDoc(eventRef, {
          participants: eventDoc.data().participants + 1 // Increment participants in the event
        })
      ])

      // Update local state to remove the cancelled event
      setEvents(events.filter(event => event.id !== eventId))
      alert('Booking cancelled successfully') // Inform the user
    } catch (error) {
      // Handle any errors during the cancellation process
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setCancellingEvent(null) // Reset the cancelling state
    }
  }

  // If events are still loading, show a loading spinner
  if (loading) {
    return (
      <div className="mt-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your events...</p>
      </div>
    )
  }

  // If there is an error while fetching events, display the error message
  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-md">
        Error loading events: {error}
      </div>
    )
  }

  // If the user has no events, show a message
  if (!events.length) {
    return (
      <div className="mt-8 p-4 bg-yellow-50 text-yellow-700 rounded-md">
        You haven't booked any events yet.
      </div>
    )
  }

  // Render the list of booked events
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Booked Events</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div 
            key={event.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{event.eventName}</h3>
              <p className="text-gray-600 mb-2">{event.type}</p>
              <p className="text-gray-700 mb-2">{event.description}</p>
              <div className="text-sm text-gray-500">
                <p>Location: {event.location}</p>
                <p>Available Spots: {event.participants}</p>
              </div>
              <button
                onClick={() => handleCancelBooking(event.id)} // Trigger cancel booking
                disabled={cancellingEvent === event.id} // Disable button while cancelling
                className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingEvent === event.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </span>
                ) : 'Cancel Booking'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventList