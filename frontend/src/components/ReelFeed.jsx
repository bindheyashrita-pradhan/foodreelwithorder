import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CommentModal from './CommentModal'
import OrderModal from './OrderModal'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const [isMuted, setIsMuted] = useState(true)
  const [searchQuery, setSearchQuery] = useState('') // 🟢 State for search input
  const [activeCommentFoodId, setActiveCommentFoodId] = useState(null)
  const [activeOrderFood, setActiveOrderFood] = useState(null)
  const [commentCounts, setCommentCounts] = useState({})

  // 🟢 FILTER VIDEOS INSTANTLY BASED ON FOOD DISH NAME OR DESCRIPTION
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
            video.play().catch(() => { /* ignore autoplay errors */ })
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
      
      {/* GLOBAL FULL-BLEED RESET */}
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000000 !important;
          overflow-x: hidden !important;
          width: 100% !important;
          min-height: 100vh !important;
        }
      `}</style>

      {/* 🟢 FLOATING INSTANT SEARCH BAR */}
      <div style={{
        position: 'fixed',
        top: '68px', // Positioned below top navbar
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '90%',
        maxWidth: '440px'
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="🔍 Search food (e.g. Pancake, Biryani, Pizza)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 18px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(24, 24, 27, 0.75)',
              backdropFilter: 'blur(12px)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              outline: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: '#a1a1aa',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="reels-feed" role="list" style={{ width: '100%', margin: 0, padding: 0 }}>
        {filteredItems.length === 0 && (
          <div className="empty-state" style={{ padding: '120px 20px 60px 20px', textAlign: 'center', color: '#a1a1aa' }}>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>
              {searchQuery ? `No dishes found matching "${searchQuery}"` : emptyMessage}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ marginTop: '12px', padding: '8px 16px', background: '#eab308', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
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

          const foodDishName = item?.name || item?.title || item?.foodName || 'Dish Item';
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
              <video 
                ref={setVideoRef(item._id)} 
                className="reel-video" 
                src={getVideoSrc(item.video)} 
                muted={isMuted}
                playsInline 
                loop 
                preload="metadata"
                onClick={toggleMute}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              
              <div className="reel-overlay" style={{ pointerEvents: 'none' }}>
                <div className="reel-overlay-gradient" aria-hidden="true" />
                
                {/* ACTION BUTTONS (Right Column) */}
                <div className="reel-actions" style={{ pointerEvents: 'auto', zIndex: 999 }}>
                  {/* Sound Toggle */}
                  <div className="reel-action-group">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }} 
                      className="reel-action sound-btn" 
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                    <div className="reel-action__count">{isMuted ? 'Muted' : 'Sound On'}</div>
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
                      className="reel-action order-btn" 
                      aria-label="Order Now"
                      style={{ backgroundColor: '#eab308', color: '#000', cursor: 'pointer', pointerEvents: 'auto' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </button>
                    <div className="reel-action__count" style={{ color: '#eab308', fontWeight: 'bold' }}>Order</div>
                  </div>

                  {/* Like Button */}
                  <div className="reel-action-group">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLike) onLike(item);
                      }} 
                      className="reel-action" 
                      aria-label="Like"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                  </div>

                  {/* Bookmark Button */}
                  <div className="reel-action-group">
                    <button 
                      className="reel-action" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSave) onSave(item);
                      }} 
                      aria-label="Bookmark"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{item.saveCount ?? item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
                  </div>

                  {/* Comments Button */}
                  <div className="reel-action-group">
                    <button 
                      className="reel-action" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCommentFoodId(item._id);
                      }} 
                      aria-label="Comments"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{currentCommentCount}</div>
                  </div>
                </div>

                {/* 🟢 REEL CONTENT DETAILS WITH DISH NAME */}
                <div className="reel-content" style={{ pointerEvents: 'auto', paddingBottom: '70px' }}>
                  
                  {/* 🟢 DISH NAME (Uploaded by Food Partner) */}
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#ffffff',
                    margin: '0 0 6px 0',
                    textTransform: 'capitalize',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                    letterSpacing: '-0.01em'
                  }}>
                    {foodDishName}
                  </h2>

                  {item.description && (
                    <p className="reel-description" title={item.description} style={{ fontSize: '13px', color: '#e4e4e7', marginBottom: '10px' }}>
                      {item.description}
                    </p>
                  )}

                  {partnerId && (
                    <Link className="visit-store-btn" to={"/food-partner/" + partnerId} aria-label="Visit store">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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