'use client'

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"

const AdminDashboard = () => {
    // State variables
    const [eventDetails, setEventDetails] = useState({
        name: '',
        category: '',
        venue: '',
        lat: 0.0,
        lng: 0.0,
        details: '',
        capacity: 0
    })
    const [eventsList, setEventsList] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [displayForm, setDisplayForm] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)

    // Fetch events from Firestore when the component mounts
    useEffect(() => {
        const fetchEventsList = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'event_list'))
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setEventsList(eventsData)
                setIsLoading(false)
            } catch (err) {
                console.error("Error fetching events: ", err)
                setErrorMessage(err)
                setIsLoading(false)
            }
        }

        fetchEventsList()
    }, [])

    // Handle form submission for creating or updating an event
    const handleFormSubmit = async (e) => {
        e.preventDefault()
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

            if (selectedEvent) {
                // Update an existing event
                await updateDoc(doc(db, 'event_list', selectedEvent.id), eventData)
            } else {
                // Add a new event
                await addDoc(collection(db, 'event_list'), eventData)
            }

            resetFormFields()
            refreshEventsList()
        } catch(error) {
            console.error("Error managing event: ", error)
        }
    }

    // Delete an event
    const handleEventDelete = async (eventId) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteDoc(doc(db, 'event_list', eventId))
                refreshEventsList()
            } catch(error) {
                console.error("Error deleting event: ", error)
            }
        }
    }

    // Prepare form for editing an event
    const initializeEventEdit = (event) => {
        setSelectedEvent(event)
        setEventDetails({
            name: event.eventName,
            category: event.type,
            venue: event.location,
            lat: event.latitude,
            lng: event.longitude,
            details: event.description,
            capacity: event.participants
        })
        setDisplayForm(true)
    }

    // Reset form to initial state
    const resetFormFields = () => {
        setEventDetails({
            name: '',
            category: '',
            venue: '',
            lat: 0.0,
            lng: 0.0,
            details: '',
            capacity: 0
        })
        setSelectedEvent(null)
        setDisplayForm(false)
    }

    // Refresh the list of events from Firestore
    const refreshEventsList = async () => {
        const querySnapshot = await getDocs(collection(db, 'event_list'))
        const eventsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        setEventsList(eventsData)
    }

    // Render loading spinner
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Render error message
    if (errorMessage) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                Error loading events: {errorMessage.message}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Event Management</h2>
                <button 
                    onClick={() => {
                        resetFormFields()
                        setDisplayForm(!displayForm)
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    {displayForm ? 'Cancel' : 'Add New Event'}
                </button>
            </div>

            {/* Form for creating or editing an event */}
            {displayForm && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">
                        {selectedEvent ? 'Edit Event' : 'Create New Event'}
                    </h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
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
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            {selectedEvent ? 'Update Event' : 'Create Event'}
                        </button>
                    </form>
                </div>
            )}

            {/* Table displaying the list of events */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Event Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Capacity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {eventsList.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.eventName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.participants}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => initializeEventEdit(event)}
                                                className="text-yellow-600 hover:text-yellow-900 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleEventDelete(event.id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {eventsList.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No events found.
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard    