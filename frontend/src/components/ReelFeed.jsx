import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CommentModal from './CommentModal'
import OrderModal from './OrderModal'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const searchInputRef = useRef(null)
  
  const [isMuted, setIsMuted] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeCommentFoodId, setActiveCommentFoodId] = useState(null)
  const [activeOrderFood, setActiveOrderFood] = useState(null)
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
      
      {/* 🟢 2026 MODERN GLASS & ANIMATION STYLES */}
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
          30% { transform: scale(1.18) rotate(-4deg); }
          50% { transform: scale(0.94) rotate(3deg); }
          75% { transform: scale(1.05) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .spring-btn {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .spring-btn:hover {
          transform: scale(1.06);
        }

        .spring-btn:active {
          animation: springPop 0.38s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .glass-pill {
          background: rgba(18, 18, 20, 0.65) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
        }

        .search-bar-wrap {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* 🟢 2026 HEADER SEARCH PILL (POSITIONED CLEANLY AT TOP) */}
      <div 
        className="search-bar-wrap"
        style={{
          position: 'fixed',
          top: '64px',
          right: '16px',
          zIndex: 9999,
          width: isSearchOpen ? 'calc(100vw - 32px)' : 'auto',
          maxWidth: isSearchOpen ? '500px' : '140px',
          left: isSearchOpen ? '50%' : 'auto',
          transform: isSearchOpen ? 'translateX(-50%)' : 'none'
        }}
      >
        {!isSearchOpen ? (
          /* COLLAPSED: Sleek Frosted Glass Search Pill */
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
          /* EXPANDED: Full Width Glass Search Input */
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
              {/* VIDEO */}
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
                    <div className="reel-action__count" style={{ fontSize: '11px', color: '#d4d4d8' }}>{isMuted ? 'Muted' : 'Sound On'}</div>
                  </div>

                  {/* Order Button (Primary Yellow Pill) */}
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
                    <div className="reel-action__count" style={{ color: '#eab308', fontWeight: '800', fontSize: '11px' }}>Order</div>
                  </div>

                  {/* Like Button */}
                  <div className="reel-action-group">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLike) onLike(item);
                      }} 
                      className="reel-action spring-btn glass-pill" 
                      aria-label="Like"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                  </div>

                  {/* Bookmark Button */}
                  <div className="reel-action-group">
                    <button 
                      className="reel-action spring-btn glass-pill" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSave) onSave(item);
                      }} 
                      aria-label="Bookmark"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{item.saveCount ?? item.savesCount ?? item.bookmarks ?? item.saves ?? 0}</div>
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
                    <div className="reel-action__count">{currentCommentCount}</div>
                  </div>
                </div>

                {/* BOTTOM REEL CONTENT DETAILS */}
                <div className="reel-content" style={{ pointerEvents: 'auto', paddingBottom: '70px' }}>
                  
                  {/* Dish Name */}
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#ffffff',
                    margin: '0 0 6px 0',
                    textTransform: 'capitalize',
                    textShadow: '0 2px 12px rgba(0,0,0,0.9)',
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