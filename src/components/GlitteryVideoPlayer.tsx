import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share, Music, Volume2, VolumeX, ChevronUp, ChevronDown, Play, Pause, Sparkles, Star, Zap } from 'lucide-react'
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

interface GlitteryVideoPlayerProps {
  video: Video
  isActive: boolean
  user: any
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
}

// Sparkle component for animated sparkles
const SparkleEffect = ({ count = 20 }: { count?: number }) => {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
  }))

  return (
    <>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        />
      ))}
    </>
  )
}

export default function GlitteryVideoPlayer({ 
  video, 
  isActive, 
  user, 
  onPrevious, 
  onNext, 
  canGoPrevious, 
  canGoNext 
}: GlitteryVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(video.stats.likes)
  const [volume, setVolume] = useState(0.7)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isActive) {
      videoElement.currentTime = 0
      videoElement.volume = Math.max(0, Math.min(1, volume))
      videoElement.muted = isMuted
      
      const playVideo = async () => {
        try {
          await videoElement.play()
          setIsPlaying(true)
        } catch (error) {
          console.log('Auto-play prevented:', error)
          setIsPlaying(false)
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
      if (canGoNext) {
        onNext()
      } else {
        video.currentTime = 0
        video.play()
      }
    }

    const handleLoadedData = () => {
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
      
      if (clampedVolume > 0 && isMuted) {
        setIsMuted(false)
        videoRef.current.muted = false
      }
      
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

  return (
    <div 
      className="relative h-screen w-full video-item bg-black overflow-hidden sparkle-container"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Animated sparkles overlay */}
      <SparkleEffect count={30} />
      
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        loop={false}
        muted={isMuted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        crossOrigin="anonymous"
      />

      {/* Rainbow gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse" />

      {/* Navigation Arrows with glittery effects */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`w-14 h-14 rounded-full p-0 text-white hover:bg-white/20 glitter-rainbow transition-all ${
            !canGoPrevious ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 float-gentle'
          }`}
        >
          <ChevronUp className="w-8 h-8" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className={`w-14 h-14 rounded-full p-0 text-white hover:bg-white/20 glitter-rainbow transition-all ${
            !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 float-gentle'
          }`}
        >
          <ChevronDown className="w-8 h-8" />
        </Button>
      </div>

      {/* Right side actions with rainbow effects */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
        {/* Author avatar with rainbow border */}
        <div className="relative rainbow-border rounded-full">
          <Avatar className="w-14 h-14 border-2 border-white">
            <AvatarImage src={video.author.avatar} />
            <AvatarFallback>{video.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-7 h-7 rounded-full glitter-rainbow text-white p-0 hover:scale-110 transition-all"
          >
            +
          </Button>
        </div>

        {/* Like button with holographic effect */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className={`w-14 h-14 rounded-full p-0 transition-all hover:scale-110 particle-glow ${
              isLiked ? 'holographic' : 'text-white hover:bg-white/20'
            }`}
            onClick={handleLike}
          >
            <Heart className={`w-9 h-9 ${isLiked ? 'fill-current text-white' : ''}`} />
          </Button>
          <span className="text-white text-sm font-bold mt-1 prismatic-text">
            {likes > 999 ? `${(likes / 1000).toFixed(1)}K` : likes}
          </span>
        </div>

        {/* Comment button with sparkle effect */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-14 h-14 rounded-full p-0 text-white hover:bg-white/20 hover:scale-110 transition-all glitter-rainbow"
            onClick={() => {
              const commentInput = document.querySelector('input[placeholder*="comment"]') as HTMLInputElement
              if (commentInput) {
                commentInput.focus()
              }
            }}
          >
            <MessageCircle className="w-9 h-9" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
          </Button>
          <span className="text-white text-sm font-bold mt-1 prismatic-text">
            {video.stats.comments > 999 
              ? `${(video.stats.comments / 1000).toFixed(1)}K` 
              : video.stats.comments}
          </span>
        </div>

        {/* Share button with rainbow glow */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-14 h-14 rounded-full p-0 text-white hover:bg-white/20 hover:scale-110 transition-all glitter-rainbow"
          >
            <Share className="w-9 h-9" />
            <Zap className="absolute -top-1 -left-1 w-4 h-4 text-cyan-400 animate-bounce" />
          </Button>
          <span className="text-white text-sm font-bold mt-1 prismatic-text">
            {video.stats.shares > 999 
              ? `${(video.stats.shares / 1000).toFixed(1)}K` 
              : video.stats.shares}
          </span>
        </div>

        {/* Enhanced music disc with rainbow animation */}
        <div className="w-14 h-14 rounded-full rainbow-border p-1 animate-spin">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center holographic">
            <Music className="w-7 h-7 text-white" />
            <Star className="absolute w-3 h-3 text-yellow-400 animate-ping" />
          </div>
        </div>
      </div>

      {/* Bottom info with prismatic text */}
      <div className="absolute bottom-32 left-4 right-20">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-white font-bold text-lg prismatic-text">@{video.author.username}</span>
          {video.author.verified && (
            <div className="w-5 h-5 glitter-rainbow rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
        
        <p className="text-white text-base mb-3 leading-relaxed font-medium">
          {video.caption}
        </p>

        <div className="flex items-center space-x-2 comment-glass rounded-full px-4 py-2">
          <Music className="w-5 h-5 text-cyan-400" />
          <span className="text-white text-sm font-medium prismatic-text">
            {video.music.title} - {video.music.artist}
          </span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>

      {/* Enhanced Audio Controls with rainbow styling */}
      <div className={`absolute top-4 right-4 flex flex-col items-end space-y-3 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-70'
      }`}>
        {/* Volume Slider with rainbow track */}
        {!isMuted && (
          <div className="comment-glass rounded-full p-4 flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-2 glitter-rainbow rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white text-sm font-bold w-12 text-center prismatic-text">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
        
        {/* Volume Toggle with holographic effect */}
        <Button
          variant="ghost"
          size="sm"
          className="w-14 h-14 rounded-full p-0 text-white hover:bg-white/20 holographic"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
        </Button>
      </div>

      {/* Play/Pause Overlay with rainbow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className={`w-24 h-24 comment-glass rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          } glitter-rainbow`}
        >
          {isPlaying ? (
            <Pause className="w-12 h-12 text-white" />
          ) : (
            <Play className="w-12 h-12 text-white ml-1" />
          )}
        </div>
      </div>

      {/* Always visible play/pause button */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className={`w-16 h-16 rounded-full p-0 transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-70'
          } glitter-rainbow hover:scale-110`}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </Button>
      </div>

      {/* Enhanced Progress Bar with rainbow gradient */}
      <div className={`absolute bottom-4 left-4 right-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-70'
      }`}>
        <div className="flex items-center space-x-4 text-white text-sm">
          <span className="min-w-[40px] font-bold prismatic-text">{formatTime((progress / 100) * duration)}</span>
          <div 
            className="flex-1 bg-gray-600 rounded-full h-2 cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="glitter-rainbow h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
          <span className="min-w-[40px] font-bold prismatic-text">{formatTime(duration)}</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF0050, #00F2EA, #FFD700);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF0050, #00F2EA, #FFD700);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        
        .slider::-webkit-slider-track {
          background: linear-gradient(45deg, #FF0050, #FF6B35, #F7931E, #FFD700, #00F2EA, #9B59B6);
          border-radius: 5px;
          height: 6px;
        }
        
        .slider::-moz-range-track {
          background: linear-gradient(45deg, #FF0050, #FF6B35, #F7931E, #FFD700, #00F2EA, #9B59B6);
          border-radius: 5px;
          height: 6px;
        }
      `}</style>
    </div>
  )
}