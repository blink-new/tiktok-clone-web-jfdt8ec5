import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share, Music, Volume2, VolumeX, Maximize, Download } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'

interface Video {
  id: string
  videoUrl: string
  thumbnailUrl: string
  caption: string
  author: {
    username: string
    avatar: string
    verified: boolean
  }
  stats: {
    likes: number
    comments: number
    shares: number
  }
  music: {
    title: string
    artist: string
  }
}

interface VideoPlayerProps {
  video: Video
  isActive: boolean
  user: any
}

export default function VideoPlayer({ video, isActive, user }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(video.stats.likes)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isActive])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(video.videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${video.author.username}_${video.id}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: open video in new tab
      window.open(video.videoUrl, '_blank')
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div ref={containerRef} className="relative h-screen w-full video-item bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Right side actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6">
        {/* Author avatar */}
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={video.author.avatar} />
            <AvatarFallback>{video.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-[#FF0050] hover:bg-[#e6004a] text-white p-0"
          >
            +
          </Button>
        </div>

        {/* Like button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`w-12 h-12 rounded-full p-0 ${
              isLiked ? 'text-[#FF0050]' : 'text-white'
            } hover:bg-white/20`}
            onClick={handleLike}
          >
            <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-white text-xs font-medium mt-1">
            {likes > 999 ? `${(likes / 1000).toFixed(1)}K` : likes}
          </span>
        </div>

        {/* Comment button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20"
          >
            <MessageCircle className="w-8 h-8" />
          </Button>
          <span className="text-white text-xs font-medium mt-1">
            {video.stats.comments > 999 
              ? `${(video.stats.comments / 1000).toFixed(1)}K` 
              : video.stats.comments}
          </span>
        </div>

        {/* Download button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20"
            onClick={handleDownload}
          >
            <Download className="w-8 h-8" />
          </Button>
          <span className="text-white text-xs font-medium mt-1">
            Save
          </span>
        </div>

        {/* Share button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20"
          >
            <Share className="w-8 h-8" />
          </Button>
          <span className="text-white text-xs font-medium mt-1">
            {video.stats.shares > 999 
              ? `${(video.stats.shares / 1000).toFixed(1)}K` 
              : video.stats.shares}
          </span>
        </div>

        {/* Music disc */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF0050] to-[#00F2EA] p-0.5 animate-spin">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-24 left-4 right-20">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-white font-semibold">@{video.author.username}</span>
          {video.author.verified && (
            <div className="w-4 h-4 bg-[#00F2EA] rounded-full flex items-center justify-center">
              <span className="text-black text-xs">✓</span>
            </div>
          )}
        </div>
        
        <p className="text-white text-sm mb-3 leading-relaxed">
          {video.caption}
        </p>

        <div className="flex items-center space-x-2">
          <Music className="w-4 h-4 text-white" />
          <span className="text-white text-sm">
            {video.music.title} - {video.music.artist}
          </span>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {/* Fullscreen control */}
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
          onClick={toggleFullscreen}
        >
          <Maximize className="w-6 h-6" />
        </Button>
        
        {/* Volume control */}
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  )
}