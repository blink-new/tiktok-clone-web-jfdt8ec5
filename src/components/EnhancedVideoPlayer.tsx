import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share, Music, Volume2, VolumeX, ChevronUp, ChevronDown, Play, Pause, Maximize, Download } from 'lucide-react'
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

interface EnhancedVideoPlayerProps {
  video: Video
  isActive: boolean
  user: any
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export default function EnhancedVideoPlayer({ 
  video, 
  isActive, 
  user, 
  onPrevious, 
  onNext, 
  canGoPrevious, 
  canGoNext 
}: EnhancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false) // Start unmuted for better audio experience
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(video.stats.likes)
  const [volume, setVolume] = useState(0.7) // Default volume at 70%
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isActive) {
      // Reset video to beginning when becoming active
      videoElement.currentTime = 0
      
      // Ensure audio settings are applied
      videoElement.volume = Math.max(0, Math.min(1, volume))
      videoElement.muted = isMuted
      
      // Add a small delay to ensure video is ready
      const playVideo = async () => {
        try {
          await videoElement.play()
          setIsPlaying(true)
        } catch (error) {
          console.log('Auto-play prevented:', error)
          setIsPlaying(false)
          // Try to play muted if auto-play fails
          if (!isMuted) {
            videoElement.muted = true
            setIsMuted(true)
            try {
              await videoElement.play()
              setIsPlaying(true)
            } catch (mutedError) {
              console.log('Muted auto-play also failed:', mutedError)
            }
          }
        }
      }
      
      // Small delay to ensure video element is ready
      setTimeout(playVideo, 100)
    } else {
      videoElement.pause()
      setIsPlaying(false)
    }
  }, [isActive, volume, isMuted])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100
        setProgress(progress)
      }
    }

    const updateDuration = () => {
      setDuration(video.duration || 0)
    }

    const handleEnded = () => {
      // Auto-advance to next video when current one ends
      if (canGoNext) {
        onNext()
      } else {
        // Loop current video if it's the last one
        video.currentTime = 0
        video.play()
      }
    }

    const handleLoadedData = () => {
      // Ensure audio is properly initialized
      video.volume = volume
      video.muted = isMuted
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('ended', handleEnded)
    }
  }, [canGoNext, onNext, volume, isMuted])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Play failed:', error)
          })
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
      
      // If unmuting and volume is 0, set to a reasonable level
      if (!newMutedState && volume === 0) {
        const newVolume = 0.5
        videoRef.current.volume = newVolume
        setVolume(newVolume)
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume))
      videoRef.current.volume = clampedVolume
      setVolume(clampedVolume)
      
      // Auto-unmute if volume is increased from 0
      if (clampedVolume > 0 && isMuted) {
        setIsMuted(false)
        videoRef.current.muted = false
      }
      
      // Auto-mute if volume is set to 0
      if (clampedVolume === 0 && !isMuted) {
        setIsMuted(true)
        videoRef.current.muted = true
      }
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      videoRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
    <div 
      ref={containerRef}
      className="relative h-screen w-full video-item bg-black overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        loop={false} // Disable loop to allow auto-advance
        muted={isMuted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        crossOrigin="anonymous"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Navigation Arrows */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/50 transition-all ${
            !canGoPrevious ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          }`}
        >
          <ChevronUp className="w-8 h-8" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className={`w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/50 transition-all ${
            !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
          }`}
        >
          <ChevronDown className="w-8 h-8" />
        </Button>
      </div>

      {/* Right side actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
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
            className={`w-12 h-12 rounded-full p-0 transition-all hover:scale-110 ${
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
            className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 hover:scale-110 transition-all"
            onClick={() => {
              // Focus on comment input in the sidebar
              const commentInput = document.querySelector('input[placeholder*="comment"]') as HTMLInputElement
              if (commentInput) {
                commentInput.focus()
              }
            }}
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
            className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 hover:scale-110 transition-all"
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
            className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 hover:scale-110 transition-all"
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
      <div className="absolute bottom-32 left-4 right-20">
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

      {/* Enhanced Audio Controls */}
      <div className={`absolute top-4 right-4 flex flex-col items-end space-y-2 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-70'
      }`}>
        {/* Volume Slider */}
        {!isMuted && (
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-3 flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white text-xs w-10 text-center">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
        
        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          <Maximize className="w-6 h-6" />
        </Button>
        
        {/* Volume Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>

      {/* Play/Pause Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className={`w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white ml-1" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`absolute bottom-4 left-4 right-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-70'
      }`}>
        <div className="flex items-center space-x-3 text-white text-sm">
          <span className="min-w-[35px]">{formatTime((progress / 100) * duration)}</span>
          <div 
            className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="bg-gradient-to-r from-[#FF0050] to-[#00F2EA] h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="min-w-[35px]">{formatTime(duration)}</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF0050, #00F2EA);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF0050, #00F2EA);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .slider::-webkit-slider-track {
          background: #4B5563;
          border-radius: 5px;
          height: 4px;
        }
        
        .slider::-moz-range-track {
          background: #4B5563;
          border-radius: 5px;
          height: 4px;
        }
      `}</style>
    </div>
  )
}