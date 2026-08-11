import React, { useState, useEffect } from 'react'
import '../../styles/profile.css'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const Profile = () => {
  const { id } = useParams()
  const [ profile, setProfile ] = useState(null)
  const [ videos, setVideos ] = useState([])

  // Get logged in user details from localStorage
  const savedUser = localStorage.getItem('user')
  const userType = localStorage.getItem('userType')
  const currentUser = savedUser ? JSON.parse(savedUser) : null

  // Check if the current profile belongs to the logged-in partner
  const isOwner = userType === 'partner' && currentUser && (currentUser._id === id || currentUser.id === id)

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/food-partner/${id}`, { withCredentials: true })
      .then(response => {
        setProfile(response.data.foodPartner)
        setVideos(response.data.foodPartner?.fooditems || response.data.foodPartner?.foodItems || []) 
      })
      .catch((err) => {
        console.error("Error fetching profile:", err)
      })
  }, [ id ])

  // Helper to ensure video URLs point to your live backend if they are relative paths
  const getVideoSrc = (videoPath) => {
    if (!videoPath) return ''
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath
    }
    const baseUrl = import.meta.env.VITE_API_URL || ''
    return `${baseUrl}${videoPath.startsWith('/') ? '' : '/'}${videoPath}`
  }

  return (
    <main className="profile-page">
      <section className="profile-header">
        <div className="profile-meta">
          <img className="profile-avatar" src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D" alt="Avatar" />
          <div className="profile-info">
            <h1 className="profile-pill profile-business" title="Business name">
              {profile?.name || profile?.restaurantName}
            </h1>
            <p className="profile-pill profile-address" title="Address">
              {profile?.address}
            </p>

            {/* Quick Action Buttons for Partner */}
            {(isOwner || userType === 'partner') && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <Link 
                  to="/food-partner/orders" 
                  style={{
                    backgroundColor: '#eab308',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  📦 Incoming Orders
                </Link>

                <Link 
                  to="/create-food" 
                  style={{
                    backgroundColor: '#27272a',
                    color: '#fff',
                    border: '1px solid #3f3f46',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  ➕ Add New Dish
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="profile-stats" role="list" aria-label="Stats">
          <div className="profile-stat" role="listitem">
            <span className="profile-stat-label">total meals</span>
            <span className="profile-stat-value">{profile?.totalMeals || videos.length}</span>
          </div>
          <div className="profile-stat" role="listitem">
            <span className="profile-stat-label">customer served</span>
            <span className="profile-stat-value">{profile?.customersServed || 0}</span>
          </div>
        </div>
      </section>
      <hr className="profile-sep" />
      <section className="profile-grid" aria-label="Videos">
        {videos.map((v) => (
          <div key={v._id} className="profile-grid-item">
            <video 
              className="profile-grid-video" 
              style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
              src={getVideoSrc(v.video)} 
              muted 
              playsInline
              preload="metadata"
            />
          </div>
        ))}
      </section>
    </main>
  )
}

export default Profile