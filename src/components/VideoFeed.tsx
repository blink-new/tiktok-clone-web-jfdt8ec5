import { useState, useEffect, useRef } from 'react'
import VideoPlayer from './VideoPlayer'
import { mockVideos } from '../data/mockData'

interface VideoFeedProps {
  currentPage: string
  user: any
}

export default function VideoFeed({ currentPage, user }: VideoFeedProps) {
  const [videos, setVideos] = useState(mockVideos)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1)
      } else if (e.deltaY < 0 && currentVideoIndex > 0) {
        setCurrentVideoIndex(prev => prev - 1)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1)
      } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        setCurrentVideoIndex(prev => prev - 1)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [currentVideoIndex, videos.length])

  if (currentPage !== 'home') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentPage === 'discover' && 'Discover'}
            {currentPage === 'upload' && 'Upload Video'}
            {currentPage === 'inbox' && 'Inbox'}
            {currentPage === 'profile' && 'Profile'}
          </h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="h-full video-container overflow-hidden"
      style={{
        transform: `translateY(-${currentVideoIndex * 100}vh)`,
        transition: 'transform 0.3s ease-out'
      }}
    >
      {videos.map((video, index) => (
        <VideoPlayer
          key={video.id}
          video={video}
          isActive={index === currentVideoIndex}
          user={user}
        />
      ))}
    </div>
  )
}