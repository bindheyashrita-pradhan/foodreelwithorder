import React, { useState, useEffect } from 'react' // Fixed: Removed unused 'use' import
import '../../styles/profile.css'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const Profile = () => {
  const { id } = useParams()
  const [ profile, setProfile ] = useState(null)
  const [ videos, setVideos ] = useState([])

  useEffect(() => {
    axios.get(`http://localhost:3000/api/food-partner/${id}`, { withCredentials: true })
      .then(response => {
        setProfile(response.data.foodPartner)
        // Fixed: Changed foodItems to fooditems to match your backend controller key
        setVideos(response.data.foodPartner.fooditems || []) 
      })
      .catch((err) => {
        console.error("Error fetching profile:", err)
      })
  }, [ id ])

  return (
    <main className="profile-page">
      <section className="profile-header">
        <div className="profile-meta">
          <img className="profile-avatar" src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D" alt="Avatar" />
          <div className="profile-info">
            <h1 className="profile-pill profile-business" title="Business name">
              {profile?.name}
            </h1>
            <p className="profile-pill profile-address" title="Address">
              {profile?.address}
            </p>
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
          // Fixed: Changed key and lookup to v._id to align with MongoDB IDs
          <div key={v._id} className="profile-grid-item">
            <video 
              className="profile-grid-video" 
              style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
              src={v.video} 
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