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
        console.log("Fetched food items:", response.data);
        setVideos(response.data.foodItems || response.data.fooditems || [])
      })
      .catch((err) => { console.error("Error fetching videos:", err) })
  }, [])

  // Function to handle Liking / Unliking a video
  async function likeVideo(item) {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/like", 
        { foodId: item._id }, 
        { withCredentials: true }
      )

      console.log("Like response:", response.data);

      if (response.data.message === "Food liked successfully" || response.data.like) {
        console.log("Video liked");
        setVideos((prev) => 
          prev.map((v) => v._id === item._id ? { ...v, likeCount: (v.likeCount || 0) + 1 } : v)
        )
      } else {
        console.log("Video unliked");
        setVideos((prev) => 
          prev.map((v) => v._id === item._id ? { ...v, likeCount: Math.max(0, (v.likeCount || 0) - 1) } : v)
        )
      }
    } catch (error) {
      console.error("Error liking video:", error.response?.data || error.message);
    }
  }

  // Function to handle Saving / Unsaving a video
  async function saveCount(item) {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/save", 
        { foodId: item._id }, 
        { withCredentials: true }
      )

      if (response.data.message === "Food saved successfully" || response.data.save) {
        setVideos((prev) => 
          prev.map((v) => v._id === item._id ? { ...v, saveCount: (v.saveCount || 0) + 1 } : v)
        )
      } else {
        setVideos((prev) => 
          prev.map((v) => v._id === item._id ? { ...v, saveCount: Math.max(0, (v.saveCount || 0) - 1) } : v)
        )
      }
    } catch (error) {
      console.error("Error saving video:", error.response?.data || error.message);
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