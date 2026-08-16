import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CommentModal from './CommentModal'
import OrderModal from './OrderModal'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const searchInputRef = useRef(null)
  const lastTapRef = useRef({ time: 0, itemId: null })

  const [isMuted, setIsMuted] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [heartAnim, setHeartAnim] = useState(null)
  const [activeCommentFoodId, setActiveCommentFoodId] = useState(null)
  const [activeOrderFood, setActiveOrderFood] = useState(null)
  
  // Local state maps for instant feedback synced with DB
  const [likedMap, setLikedMap] = useState({})
  const [savedMap, setSavedMap] = useState({})
  const [likesCountMap, setLikesCountMap] = useState({})
  const [savesCountMap, setSavesCountMap] = useState({})
  const [commentCounts, setCommentCounts] = useState({})

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const foodName = (item?.name || item?.title || item?.foodName || '').toLowerCase();
    const description = (item?.description || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return foodName.includes(query) || description.includes(query);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.muted = isMuted
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )
    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [filteredItems, isMuted])

  const setVideoRef = (id) => (el) => {
    if (!el) {
      videoRefs.current.delete(id);
      return
    }
    videoRefs.current.set(id, el)
  }

  const toggleMute = () => {
    const nextMuteState = !isMuted
    setIsMuted(nextMuteState)
    videoRefs.current.forEach((vid) => {
      if (vid) vid.muted = nextMuteState
    })
  }

  // 🟢 HELPER: Extract token safely from localStorage / user object
  const getAuthToken = () => {
    let token = localStorage.getItem('token') || localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('user');
    if (!token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        token = parsed.token || parsed.userToken;
      } catch (e) {}
    }
    return { token, hasUser: !!storedUser || !!token };
  }

  // 🟢 REAL BACKEND-SYNCED LIKE/UNLIKE TOGGLE
  const handleLikeToggle = async (item) => {
    try {
      const { token, hasUser } = getAuthToken();

      if (!hasUser) {
        alert("Please log in as a user to like dishes!");
        return;
      }

      const isCurrentlyLiked = !!likedMap[item._id];
      const baseCount = likesCountMap[item._id] ?? (item.likeCount ?? item.likesCount ?? item.likes ?? 0);

      // Instant Optimistic UI Update
      setLikedMap(prev => ({ ...prev, [item._id]: !isCurrentlyLiked }));
      setLikesCountMap(prev => ({
        ...prev,
        [item._id]: isCurrentlyLiked ? Math.max(0, baseCount - 1) : baseCount + 1
      }));

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Call Backend API
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food/like`,
        { foodId: item._id },
        {
          headers,
          withCredentials: true
        }
      );

      if (res.data?.message === "Food unliked successfully") {
        setLikedMap(prev => ({ ...prev, [item._id]: false }));
      } else if (res.data?.message === "Food liked successfully") {
        setLikedMap(prev => ({ ...prev, [item._id]: true }));
      }

      if (onLike) onLike(item);
    } catch (err) {
      console.error("Like toggle failed:", err);
      if (err.response?.status === 401) {
        alert("Please log in as a user to like dishes!");
      }
    }
  }

  // 🟢 REAL BACKEND-SYNCED SAVE/UNSAVE TOGGLE
  const handleSaveToggle = async (item) => {
    try {
      const { token, hasUser } = getAuthToken();

      if (!hasUser) {
        alert("Please log in to save dishes!");
        return;
      }

      const isCurrentlySaved = !!savedMap[item._id];
      const baseCount = savesCountMap[item._id] ?? (item.saveCount ?? item.savesCount ?? item.bookmarks ?? item.saves ?? 0);

      // Instant Optimistic UI Update
      setSavedMap(prev => ({ ...prev, [item._id]: !isCurrentlySaved }));
      setSavesCountMap(prev => ({
        ...prev,
        [item._id]: isCurrentlySaved ? Math.max(0, baseCount - 1) : baseCount + 1
      }));

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Call Backend API
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food/save`,
        { foodId: item._id },
        {
          headers,
          withCredentials: true
        }
      );

      if (onSave) onSave(item);
    } catch (err) {
      console.error("Save toggle failed:", err);
      if (err.response?.status === 401) {
        alert("Please log in to save dishes!");
      }
    }
  }

  // Double tap to like handler
  const handleVideoClick = (e, item) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current.itemId === item._id && (now - lastTapRef.current.time) < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setHeartAnim({ id: item._id, x, y });
      setTimeout(() => setHeartAnim(null), 800);

      if (!likedMap[item._id]) {
        handleLikeToggle(item);
      }
      lastTapRef.current = { time: 0, itemId: null };
    } else {
      lastTapRef.current = { time: now, itemId: item._id };
      toggleMute();
    }
  }

  const handleCommentAdded = (foodId) => {
    setCommentCounts((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] ?? 0) + 1
    }))
  }

  const getVideoSrc = (videoPath) => {
    if (!videoPath) return ''
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath
    }
    const baseUrl = import.meta.env.VITE_API_URL || ''
    return `${baseUrl}${videoPath.startsWith('/') ? '' : '/'}${videoPath}`
  }

  return (
    <div className="reels-page" style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, backgroundColor: '#000000', overflowX: 'hidden', position: 'relative' }}>
      
      {/* CSS FIX FOR EQUAL BUTTON SPACING */}
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000000 !important;
          overflow-x: hidden !important;
          width: 100% !important;
          min-height: 100vh !important;
        }

        @keyframes springPop {
          0% { transform: scale(1); }
          30% { transform: scale(1.22) rotate(-5deg); }
          50% { transform: scale(0.92) rotate(3deg); }
          75% { transform: scale(1.08) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes heartPopUp {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.4) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(5deg); opacity: 0; }
        }

        .spring-btn {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .spring-btn:hover {
          transform: scale(1.08);
        }

        .spring-btn:active {
          animation: springPop 0.38s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .glass-pill {
          background: rgba(18, 18, 20, 0.65) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
        }

        /* BALANCED RIGHT MARGIN FOR ACTION BUTTONS */
        .reel-actions {
          position: absolute !important;
          right: 28px !important;
          bottom: 96px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 16px !important;
          z-index: 999 !important;
        }

        .reel-action-group {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 4px !important;
        }

        .reel-action {
          width: 44px !important;
          height: 44px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .reel-action__count {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }

        .reel-content {
          padding-left: 28px !important;
        }
      `}</style>

      {/* SEARCH BAR */}
      <div 
        style={{
          position: 'fixed',
          top: '64px',
          right: '28px',
          zIndex: 9999,
          width: isSearchOpen ? 'calc(100vw - 56px)' : 'auto',
          maxWidth: isSearchOpen ? '500px' : '140px',
          left: isSearchOpen ? '50%' : 'auto',
          transform: isSearchOpen ? 'translateX(-50%)' : 'none',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {!isSearchOpen ? (
          <button
            type="button"
            className="spring-btn glass-pill"
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '999px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
          </button>
        ) : (
          <div className="glass-pill" style={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: '999px', padding: '4px 6px 4px 16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search dishes (e.g. Pancake, Biryani)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '500',
                outline: 'none'
              }}
            />
            <button 
              type="button"
              className="spring-btn"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0,
                marginLeft: '6px'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* REELS FEED */}
      <div className="reels-feed" role="list" style={{ width: '100%', margin: 0, padding: 0 }}>
        {filteredItems.length === 0 && (
          <div className="empty-state" style={{ padding: '140px 20px 60px 20px', textAlign: 'center', color: '#a1a1aa' }}>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>
              {searchQuery ? `No dishes found matching "${searchQuery}"` : emptyMessage}
            </p>
            {searchQuery && (
              <button 
                className="spring-btn"
                onClick={() => setSearchQuery('')}
                style={{ marginTop: '14px', padding: '10px 20px', background: '#eab308', color: '#000', border: 'none', borderRadius: '999px', fontWeight: '700', cursor: 'pointer' }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {filteredItems.map((item) => {
          const partnerId = typeof item.foodPartner === 'object' && item.foodPartner !== null 
            ? item.foodPartner._id 
            : (item.foodPartner || item.partnerId);

          const restaurantName = item?.foodPartner?.restaurantName || item?.foodPartner?.name || 'Food Partner';
          const foodDishName = item?.name || item?.title || item?.foodName || 'Dish Item';
          const price = item?.price || item?.basePrice || item?.portions?.medium || item?.portions?.small || 0;

          const isLiked = !!likedMap[item._id];
          const displayLikes = likesCountMap[item._id] ?? (item.likeCount ?? item.likesCount ?? item.likes ?? 0);

          const isSaved = !!savedMap[item._id];
          const displaySaves = savesCountMap[item._id] ?? (item.saveCount ?? item.savesCount ?? item.bookmarks ?? item.saves ?? 0);

          const baseCommentCount = item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0);
          const currentCommentCount = baseCommentCount + (commentCounts[item._id] || 0);

          return (
            <section 
              key={item._id} 
              className="reel" 
              role="listitem"
              style={{
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000000'
              }}
            >
              {/* VIDEO WITH DOUBLE TAP HANDLER */}
              <video 
                ref={setVideoRef(item._id)} 
                className="reel-video" 
                src={getVideoSrc(item.video)} 
                muted={isMuted}
                playsInline 
                loop 
                preload="metadata"
                onClick={(e) => handleVideoClick(e, item)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  cursor: 'pointer'
                }}
              />

              {/* DOUBLE-TAP HEART POP-UP ANIMATION */}
              {heartAnim && heartAnim.id === item._id && (
                <div style={{
                  position: 'absolute',
                  left: heartAnim.x - 40,
                  top: heartAnim.y - 40,
                  pointerEvents: 'none',
                  zIndex: 9999,
                  fontSize: '80px',
                  animation: 'heartPopUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  filter: 'drop-shadow(0 4px 12px rgba(239,68,68,0.8))'
                }}>
                  ❤️
                </div>
              )}
              
              <div className="reel-overlay" style={{ pointerEvents: 'none' }}>
                <div className="reel-overlay-gradient" aria-hidden="true" />
                
                {/* ACTION COLUMN (Right Side) */}
                <div className="reel-actions" style={{ pointerEvents: 'auto', zIndex: 999 }}>
                  
                  {/* Sound Toggle */}
                  <div className="reel-action-group">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }} 
                      className="reel-action sound-btn spring-btn glass-pill" 
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                    <div className="reel-action__count" style={{ color: '#d4d4d8' }}>{isMuted ? 'Muted' : 'Sound On'}</div>
                  </div>

                  {/* Order Button */}
                  <div className="reel-action-group" style={{ pointerEvents: 'auto', zIndex: 1000 }}>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveOrderFood(item);
                      }} 
                      className="reel-action order-btn spring-btn" 
                      aria-label="Order Now"
                      style={{ backgroundColor: '#eab308', color: '#000', cursor: 'pointer', pointerEvents: 'auto', boxShadow: '0 4px 20px rgba(234, 179, 8, 0.4)' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </button>
                    <div className="reel-action__count" style={{ color: '#eab308' }}>Order</div>
                  </div>

                  {/* LIKE BUTTON (Pink/Red Heart) */}
                  <div className="reel-action-group">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(item);
                      }} 
                      className="reel-action spring-btn glass-pill" 
                      aria-label="Like"
                      style={{
                        backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.25)' : undefined,
                        borderColor: isLiked ? 'rgba(239, 68, 68, 0.6)' : undefined
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={isLiked ? "#ef4444" : "none"} 
                        stroke={isLiked ? "#ef4444" : "currentColor"} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </button>
                    <div className="reel-action__count" style={{ color: isLiked ? '#ef4444' : '#ffffff' }}>
                      {displayLikes}
                    </div>
                  </div>

                  {/* BOOKMARK BUTTON (Gold/Yellow Bookmark) */}
                  <div className="reel-action-group">
                    <button 
                      className="reel-action spring-btn glass-pill" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveToggle(item);
                      }} 
                      aria-label="Bookmark"
                      style={{
                        backgroundColor: isSaved ? 'rgba(234, 179, 8, 0.25)' : undefined,
                        borderColor: isSaved ? 'rgba(234, 179, 8, 0.6)' : undefined
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={isSaved ? "#eab308" : "none"} 
                        stroke={isSaved ? "#eab308" : "currentColor"} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                      </svg>
                    </button>
                    <div className="reel-action__count" style={{ color: isSaved ? '#eab308' : '#ffffff' }}>
                      {displaySaves}
                    </div>
                  </div>

                  {/* Comments Button */}
                  <div className="reel-action-group">
                    <button 
                      className="reel-action spring-btn glass-pill" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCommentFoodId(item._id);
                      }} 
                      aria-label="Comments"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </button>
                    <div className="reel-action__count" style={{ color: '#ffffff' }}>
                      {currentCommentCount}
                    </div>
                  </div>
                </div>

                {/* BOTTOM REEL CONTENT DETAILS */}
                <div className="reel-content" style={{ pointerEvents: 'auto', paddingBottom: '70px' }}>
                  
                  {/* RESTAURANT BRAND BADGE */}
                  <span style={{
                    fontSize: '11px',
                    color: '#eab308',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '2px',
                    textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                  }}>
                    {restaurantName}
                  </span>

                  {/* DISH NAME + GLOWING PRICE BADGE */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h2 style={{
                      fontSize: '22px',
                      fontWeight: '800',
                      color: '#ffffff',
                      margin: 0,
                      textTransform: 'capitalize',
                      textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                      letterSpacing: '-0.01em'
                    }}>
                      {foodDishName}
                    </h2>

                    {price > 0 && (
                      <span style={{
                        background: 'rgba(234, 179, 8, 0.25)',
                        color: '#eab308',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: '800',
                        backdropFilter: 'blur(8px)'
                      }}>
                        ₹{price}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="reel-description" title={item.description} style={{ fontSize: '13px', color: '#e4e4e7', marginBottom: '10px' }}>
                      {item.description}
                    </p>
                  )}

                  {partnerId && (
                    <Link className="visit-store-btn spring-btn glass-pill" to={"/food-partner/" + partnerId} aria-label="Visit store">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                        <path d="M2 7h20" />
                      </svg>
                      <span>Visit Store</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      {/* Slide-Up Comment Modal */}
      {activeCommentFoodId && (
        <CommentModal 
          foodId={activeCommentFoodId} 
          onClose={() => setActiveCommentFoodId(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Slide-Up Order Modal */}
      {activeOrderFood && (
        <OrderModal 
          foodItem={activeOrderFood} 
          onClose={() => setActiveOrderFood(null)} 
        />
      )}
    </div>
  )
}

export default ReelFeed