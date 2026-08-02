import React, { useEffect, useState } from 'react'
import axios from 'axios';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const Home = () => {
  const [ videos, setVideos ] = useState([])

  // Fetch all videos from the backend database when the page loads
  useEffect(() => {
    axios.get("http://localhost:3000/api/food", { withCredentials: true })
      .then(response => {
        console.log(response.data);
        setVideos(response.data.foodItems)
      })
      .catch(() => { /* handle error if needed */ })
  }, [])

  // Function to handle Liking / Unliking a video
  async function likeVideo(item) {
    const response = await axios.post("http://localhost:3000/api/food/like", { foodId: item._id }, { withCredentials: true })
    if (response.data.like) {
      console.log("Video liked");
      // Added (v.likeCount || 0) safety fallback!
      setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: (v.likeCount || 0) + 1 } : v))
    } else {
      console.log("Video unliked");
      // Added (v.likeCount || 0) safety fallback!
      setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: (v.likeCount || 0) - 1 } : v))
    }
  }

  // Function to handle Saving / Unsaving a video
  async function saveCount(item) {
    const response = await axios.post("http://localhost:3000/api/food/save", { foodId: item._id }, { withCredentials: true })
    if (response.data.save) {
      // Fixed savesCount to saveCount to match MongoDB schema
      setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, saveCount: (v.saveCount || 0) + 1 } : v))
    } else {
      setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, saveCount: (v.saveCount || 0) - 1 } : v))
    }
  }

  return (
    <ReelFeed 
      items={videos} 
      onLike={likeVideo} 
      onSave={saveCount} 
      emptyMessage="No videos available." 
    />
  )
}

export default Home