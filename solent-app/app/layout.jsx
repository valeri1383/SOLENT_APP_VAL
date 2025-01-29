import { Inter } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import '../styles/globals.css'

// Configure the 'Inter' font with the Latin subset
const inter = Inter({ subsets: ['latin'] })

// Metadata for the application, used in the `<head>` section
export const metadata = {
  title: 'Solent Events - Find and Join Local Events',
  description: 'Discover and participate in social events around the Solent area',
}

// RootLayout component wraps the entire application
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Link to the Leaflet CSS stylesheet */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  )
}