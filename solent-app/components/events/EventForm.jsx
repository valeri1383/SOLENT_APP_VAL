'use client'

import { useState, useEffect } from 'react'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const EventForm = ({ event = null, onSuccess, onCancel }) => {
    // State variables for event form details, submission status, and errors
    const [eventDetails, setEventDetails] = useState({
        name: '',
        category: '',
        venue: '',
        lat: 0.0,
        lng: 0.0,
        details: '',
        capacity: 0
    })
    const [isSubmitting, setIsSubmitting] = useState(false) // Tracks if form is currently being submitted
    const [error, setError] = useState(null) // Stores any error message during the form submission

    // Populate form with existing event data when 'event' prop is passed (for editing an event)
    useEffect(() => {
        if (event) {
            setEventDetails({
                name: event.eventName,
                category: event.type,
                venue: event.location,
                lat: event.latitude,
                lng: event.longitude,
                details: event.description,
                capacity: event.participants
            })
        }
    }, [event])

    // Handle form submission (either create or update an event)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const eventData = {
                eventName: eventDetails.name,
                type: eventDetails.category,
                location: eventDetails.venue,
                latitude: eventDetails.lat,
                longitude: eventDetails.lng,
                description: eventDetails.details,
                participants: eventDetails.capacity,
                createdAt: new Date()
            }

            if (event) {
                // If 'event' prop exists, update the existing event in Firestore
                await updateDoc(doc(db, 'event_list', event.id), eventData)
            } else {
                // If no 'event' prop, create a new event in Firestore
                await addDoc(collection(db, 'event_list'), eventData)
            }

            onSuccess?.()
            resetForm() // Reset form fields after submission
        } catch (err) {
            console.error('Error managing event:', err)
            setError(err.message) // Set error message if the operation fails
        } finally {
            setIsSubmitting(false) // Stop the submission process
        }
    }

    // Reset the form fields to their initial empty state
    const resetForm = () => {
        setEventDetails({
            name: '',
            category: '',
            venue: '',
            lat: 0.0,
            lng: 0.0,
            details: '',
            capacity: 0
        })
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
                {event ? 'Edit Event' : 'Create New Event'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Grid layout for event details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Event Name
                        </label>
                        <input
                            type="text"
                            value={eventDetails.name}
                            onChange={(e) => setEventDetails({
                                ...eventDetails,
                                name: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Category Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <input
                            type="text"
                            value={eventDetails.category}
                            onChange={(e) => setEventDetails({
                                ...eventDetails,
                                category: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Venue Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Venue
                        </label>
                        <input
                            type="text"
                            value={eventDetails.venue}
                            onChange={(e) => setEventDetails({
                                ...eventDetails,
                                venue: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Capacity Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Capacity
                        </label>
                        <input
                            type="number"
                            value={eventDetails.capacity}
                            onChange={(e) => setEventDetails({
                                ...eventDetails,
                                capacity: parseInt(e.target.value)
                            })}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Latitude Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Latitude
                        </label>
                        <input
                            type="number"
                            value={eventDetails.lat}
                            onChange={(e) => setEventDetails({
                                ...eventDetails,
                                lat: parseFloat(e.target.value)
                            })}
                            step="0.000001"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Longitude Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Longitude
                        </label>
                        <input
                            type="number"
                            value={eventDetails.lng}
                            onChange={(e) => setEventDetails({
                                ...eventDetails,
                                lng: parseFloat(e.target.value)
                            })}
                            step="0.000001"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Event Description Textarea */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={eventDetails.details}
                        onChange={(e) => setEventDetails({
                            ...eventDetails,
                            details: e.target.value
                        })}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    ></textarea>
                </div>

                {/* Display error message if submission fails */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">
                            {error}
                        </div>
                    </div>
                )}

                {/* Buttons for submission and cancel */}
                <div className="flex gap-4">
                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : (event ? 'Update Event' : 'Create Event')}
                    </button>

                    {/* Cancel button */}
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

export default EventForm