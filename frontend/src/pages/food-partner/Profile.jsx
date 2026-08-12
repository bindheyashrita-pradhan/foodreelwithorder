import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged in user details from localStorage
  const savedUser = localStorage.getItem('user');
  const userType = localStorage.getItem('userType');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  // Check if current profile belongs to logged-in partner
  const isOwner = userType === 'partner' && currentUser && (currentUser._id === id || currentUser.id === id);

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/food-partner/${id}`, { withCredentials: true })
      .then(response => {
        const partnerData = response.data?.foodPartner || response.data?.partner || response.data;
        setProfile(partnerData);
        
        const foodList = partnerData?.foodItems || partnerData?.fooditems || response.data?.foodItems || [];
        setVideos(foodList);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getVideoSrc = (videoPath) => {
    if (!videoPath) return '';
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath;
    }
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}${videoPath.startsWith('/') ? '' : '/'}${videoPath}`;
  };

  if (loading) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', padding: 60, fontFamily: 'system-ui' }}>
        Loading partner profile...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '85vh', backgroundColor: '#09090b', color: '#fff', padding: '30px 16px', fontFamily: 'system-ui' }}>
      <main style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Profile Header Container */}
        <section style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            
            <img 
              src="https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D" 
              alt="Avatar" 
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eab308' }}
            />
            
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {profile?.restaurantName || profile?.name || 'Food Partner'}
              </h1>
              <p style={{ fontSize: 14, color: '#a1a1aa', margin: '4px 0 0 0' }}>
                📍 {profile?.address || 'Location not specified'}
              </p>

              {/* Action Buttons for Partner */}
              {(isOwner || userType === 'partner') && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <Link 
                    to="/food-partner/orders" 
                    style={{
                      backgroundColor: '#eab308',
                      color: '#000',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: 'none'
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
                      textDecoration: 'none'
                    }}
                  >
                    ➕ Add New Dish
                  </Link>
                </div>
              )}
            </div>

            {/* Stats Block */}
            <div style={{ display: 'flex', gap: 24, background: '#09090b', padding: '12px 20px', borderRadius: 12, border: '1px solid #27272a' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>Total Meals</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#eab308' }}>{videos.length}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>Customers</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{profile?.customersServed || 0}</span>
              </div>
            </div>

          </div>
        </section>

        {/* Video Reel Grid */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#fff' }}>Uploaded Meals</h2>

        {videos.length === 0 ? (
          <div style={{ background: '#18181b', padding: 40, borderRadius: 12, textAlign: 'center', color: '#a1a1aa', border: '1px solid #27272a' }}>
            No food videos uploaded yet by this partner.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {videos.map((v) => (
              <div key={v._id} style={{ position: 'relative', aspectRatio: '9/16', borderRadius: 12, overflow: 'hidden', background: '#18181b', border: '1px solid #27272a' }}>
                <video 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  src={getVideoSrc(v.video)} 
                  muted 
                  playsInline
                  controls
                  preload="metadata"
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>{v.name || v.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#eab308', fontWeight: 600 }}>₹{v.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Profile;