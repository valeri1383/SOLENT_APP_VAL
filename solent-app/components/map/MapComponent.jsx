'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, getDocs, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import "leaflet/dist/leaflet.css"
import EventList from '../events/EventList'

const MapComponent = ({ isLoggedIn, user }) => {
    // State variables
    const [events, setEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [noEventsFound, setNoEventsFound] = useState(false)
    const [error, setError] = useState(null)
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    
    // Refs for map and markers
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])

    // Initialize the map with Leaflet.js
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const initMap = async () => {
                try {
                    const L = (await import('leaflet')).default

                    if (!mapInstanceRef.current && mapRef.current) {
                        // Initialize Leaflet map if not already initialized
                        mapInstanceRef.current = L.map(mapRef.current, {
                            center: [50.9097, -1.4044],
                            zoom: 12,
                            layers: [
                                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                })
                            ]
                        })
                        setIsMapLoaded(true) // Set map as loaded
                    }
                } catch (error) {
                    console.error("Map initialization error:", error)
                    setError(error)
                }
            }

            initMap()
        }

        // Clean up the map when component is unmounted
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // Fetch events from Firestore
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "event_list"))
                const eventsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(), // Get event data from Firestore
                }))
                setEvents(eventsList)
                setFilteredEvents(eventsList)
            } catch (err) {
                console.error("Error fetching events: ", err)
                setError(err)
            }
        }

        fetchEvents()
    }, [])

    // Update markers when events or filters change
    useEffect(() => {
        const updateMarkers = async () => {
            if (!mapInstanceRef.current || !isMapLoaded) return
            
            try {
                const L = (await import('leaflet')).default

                // Set up the default icon for map markers
                const DefaultIcon = L.icon({
                    iconUrl: '/images/marker-icon-2x.png',

                    shadowUrl: '/images/marker-shadow-2x.png',              
                    iconSize: [41, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                })
                L.Marker.prototype.options.icon = DefaultIcon

                // Clear existing markers
                markersRef.current.forEach(marker => marker.remove())
                markersRef.current = []

                // Add new markers for each event
                const eventsToShow = filteredEvents.length > 0 ? filteredEvents : events
                eventsToShow.forEach((event) => {
                    if (event.latitude && event.longitude) {
                        const marker = L.marker([event.latitude, event.longitude])
                            .addTo(mapInstanceRef.current)

                        // Popup content for each marker
                        const popupContent = `
                            <div class="p-4">
                                <h3 class="font-bold text-lg mb-2">${event.eventName || ""}</h3>
                                <p class="mb-1"><strong>Type:</strong> ${event.type || "N/A"}</p>
                                <p class="mb-1"><strong>Description:</strong> ${event.description || ""}</p>
                                <p class="mb-1"><strong>Location:</strong> ${event.location || ""}</p>
                                <p class="mb-3"><strong>Available spots:</strong> ${event.participants || ""}</p>
                                ${isLoggedIn ? `
                                    <button 
                                        id="book-${event.id}"
                                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        Book Event
                                    </button>
                                ` : ''}
                            </div>
                        `

                        marker.bindPopup(popupContent)

                        // Add booking functionality when popup opens
                        marker.on("popupopen", () => {
                            const bookButton = document.getElementById(`book-${event.id}`)
                            if (bookButton) {
                                bookButton.addEventListener("click", () => {
                                    handleBooking(event.id, user?.uid) // Handle booking event
                                })
                            }
                        })

                        markersRef.current.push(marker) // Store marker in reference
                    }
                })
            } catch (error) {
                console.error("Error updating markers:", error) // Log errors when updating markers
            }
        }

        updateMarkers()
    }, [events, filteredEvents, isLoggedIn, user, isMapLoaded])

    // Handle search input to filter events
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        setNoEventsFound(false)

        if (term === '') {
            setFilteredEvents(events)
            return
        }

        const filtered = events.filter((event) => 
            event.type && event.type.toLowerCase().includes(term)
        )
        
        setFilteredEvents(filtered)
        setNoEventsFound(filtered.length === 0)
    }

    // Handle event booking functionality
    const handleBooking = async (eventId, userId) => {
        if (!userId) {
            alert("Please sign in to book events!") // Alert if user is not signed in
            return
        }

        try {
            const docRef = doc(db, "users", userId)
            const eventRef = doc(db, "event_list", eventId)
            const [userSnapshot, eventSnapshot] = await Promise.all([
                getDoc(docRef), // Fetch user data
                getDoc(eventRef) // Fetch event data
            ])

            if (!userSnapshot.exists()) {
                throw new Error("User not found")
            }

            if (!eventSnapshot.exists()) {
                throw new Error("Event not found")
            }

            const userData = userSnapshot.data()
            const eventData = eventSnapshot.data()

            if (userData.eventList?.includes(eventId)) {
                alert("You have already booked this event!")
                return
            }

            if (eventData.participants <= 0) {
                alert("No more spots available for this event!")
                return
            }

            await Promise.all([
                updateDoc(docRef, {
                    eventList: arrayUnion(eventId) // Add event to user's booked list
                }),
                updateDoc(eventRef, {
                    participants: eventData.participants - 1 // Decrease available spots
                })
            ])

            alert("Event booked successfully!")
            window.location.reload() // Reload page after booking
        } catch (error) {
            console.error("Error booking event: ", error) // Log any errors
            alert("An error occurred while booking the event.")
        }
    }

    return (
        <div className="container mx-auto px-4">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Map and Search */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search Bar */}
                    <div className="w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Search events by type..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    {noEventsFound && (
                        <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-md">
                            No events found for "{searchTerm}".
                        </div>
                    )}

                    {/* Map Container */}
                    <div className="relative h-[700px] rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div
                            ref={mapRef}
                            className="h-full w-full"
                        />
                        {!isMapLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading map...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Booked Events */}
                <div className="lg:col-span-1">
                    {isLoggedIn ? (
                        <EventList userId={user?.uid} />
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <h2 className="text-xl font-semibold mb-4">Your Booked Events</h2>
                            <p className="text-gray-600">Please sign in to book an event<br/>or to view your booked events.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MapComponent