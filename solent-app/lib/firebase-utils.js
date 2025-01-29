import { db } from './firebase';
import { 
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit 
} from 'firebase/firestore';

// EVENTS COLLECTION OPERATIONS

// Fetch all events from the 'event_list' collection
export const getEvents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'event_list'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// Fetch a single event by its ID
export const getEventById = async (eventId) => {
    try {
        const eventDoc = await getDoc(doc(db, 'event_list', eventId));
        if (eventDoc.exists()) {
            return { id: eventDoc.id, ...eventDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
};

// Create a new event and add it to the 'event_list' collection
export const createEvent = async (eventData) => {
    try {
        const docRef = await addDoc(collection(db, 'event_list'), {
            ...eventData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Update an existing event's data
export const updateEvent = async (eventId, eventData) => {
    try {
        await updateDoc(doc(db, 'event_list', eventId), eventData);
        return true;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

// Delete an event by its ID from the 'event_list' collection
export const deleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, 'event_list', eventId));
        return true;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

// USER OPERATIONS

// Fetch all events that a user is associated with, by user ID
export const getUserEvents = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return [];
        
        const eventList = userDoc.data().eventList || [];
        const events = await Promise.all(
            eventList.map(eventId => getEventById(eventId))
        );
        
        return events.filter(event => event !== null); // Remove any null events
    } catch (error) {
        console.error('Error fetching user events:', error);
        throw error;
    }
};

// Book an event for a user
export const bookEvent = async (userId, eventId) => {
    try {
        const userRef = doc(db, 'users', userId); // Reference to the user's document
        const eventRef = doc(db, 'event_list', eventId); // Reference to the event document
        
        // Fetch both user and event documents concurrently
        const [userDoc, eventDoc] = await Promise.all([
            getDoc(userRef),
            getDoc(eventRef)
        ]);

        if (!userDoc.exists()) throw new Error('User not found'); // If the user doesn't exist, throw an error
        if (!eventDoc.exists()) throw new Error('Event not found'); // If the event doesn't exist, throw an error


        const userData = userDoc.data();
        const eventData = eventDoc.data();

        // Check if user already booked
        if (userData.eventList?.includes(eventId)) {
            throw new Error('Event already booked');
        }

        // Check if event has available spots
        if (eventData.participants <= 0) {
            throw new Error('No spots available');
        }

        // Update both user and event documents: 
        // Add the event to the user's booked events list and reduce the available spots
        await Promise.all([
            updateDoc(userRef, {
                eventList: [...(userData.eventList || []), eventId] // Add event ID to user's event list
            }),
            updateDoc(eventRef, {
                participants: eventData.participants - 1 // Decrease the available spots for the event
            }) 
        ]);

        return true; // Return true to indicate the event booking was successful
    } catch (error) {
        console.error('Error booking event:', error); // Log any errors encountered
        throw error;
    }
};

// ADMIN OPERATIONS

// Fetch events of a specific type, ordered by creation date
export const getEventsByType = async (type) => {
    try {
        const q = query(
            collection(db, 'event_list'),
            where('type', '==', type), // Filter events by type
            orderBy('createdAt', 'desc') // Order events by creation date (most recent first)
        );
        const querySnapshot = await getDocs(q); // Fetch events matching the query
        return querySnapshot.docs.map(doc => ({
            id: doc.id, // Get document ID
            ...doc.data() // Get document data
        }));
    } catch (error) {
        console.error('Error fetching events by type:', error); // Log any errors encountered
        throw error;
    }
};

// Fetch the most recent events, with an optional limit on the number of events
export const getRecentEvents = async (limitCount = 5) => {
    try {
        const q = query(
            collection(db, 'event_list'),
            orderBy('createdAt', 'desc'),
            limit(limitCount) // Limit the number of events returned
        );
        const querySnapshot = await getDocs(q); // Fetch the events
        return querySnapshot.docs.map(doc => ({
            id: doc.id, // Get document ID
            ...doc.data() // Get document data
        }));
    } catch (error) {
        console.error('Error fetching recent events:', error); // Log any errors encountered
        throw error;
    }
};