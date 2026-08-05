import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const [isMuted, setIsMuted] = useState(true) // Default muted due to browser autoplay policies

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.muted = isMuted // Sync current mute state
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
  }, [items, isMuted])

  const setVideoRef = (id) => (el) => {
    if (!el) {
      videoRefs.current.delete(id);
      return
    }
    videoRefs.current.set(id, el)
  }

  // Toggle mute state for all videos
  const toggleMute = () => {
    const nextMuteState = !isMuted
    setIsMuted(nextMuteState)
    videoRefs.current.forEach((vid) => {
      if (vid) vid.muted = nextMuteState
    })
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}
        {items.map((item) => {
          const partnerId = typeof item.foodPartner === 'object' && item.foodPartner !== null 
            ? item.foodPartner._id 
            : item.foodPartner;

          return (
            <section key={item._id} className="reel" role="listitem">
              <video 
                ref={setVideoRef(item._id)} 
                className="reel-video" 
                src={item.video} 
                muted={isMuted}
                playsInline 
                loop 
                preload="metadata"
                onClick={toggleMute}
              />
              <div className="reel-overlay">
                <div className="reel-overlay-gradient" aria-hidden="true" />
                
                <div className="reel-actions">
                  {/* Sound Toggle Button */}
                  <div className="reel-action-group">
                    <button 
                      onClick={toggleMute} 
                      className="reel-action sound-btn" 
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        /* Muted Icon */
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      ) : (
                        /* Unmuted / Volume High Icon */
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                    <div className="reel-action__count">{isMuted ? 'Muted' : 'Sound On'}</div>
                  </div>

                  {/* Like Button */}
                  <div className="reel-action-group">
                    <button 
                      onClick={onLike ? () => onLike(item) : undefined} 
                      className="reel-action" 
                      aria-label="Like"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{item.likeCount ?? item.likesCount ?? item.likes ?? 0}</div>
                  </div>

                  {/* Bookmark/Save Button */}
                  <div className="reel-action-group">
                    <button 
                      className="reel-action" 
                      onClick={onSave ? () => onSave(item) : undefined} 
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
                    <button className="reel-action" aria-label="Comments">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </button>
                    <div className="reel-action__count">{item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)}</div>
                  </div>
                </div>

                {/* Reel Content Details */}
                <div className="reel-content">
                  <p className="reel-description" title={item.description}>{item.description}</p>
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
    </div>
  )
}

export default ReelFeed