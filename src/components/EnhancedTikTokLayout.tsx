import { useState, useEffect } from 'react'
import { Search, Plus, Heart, MessageCircle, Share, Music, Volume2, VolumeX, MoreHorizontal, Sparkles, TrendingUp, Users, Video, Radio, Gift, DollarSign, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import GlitteryVideoPlayer from './GlitteryVideoPlayer'
import EnhancedCommentSection from './EnhancedCommentSection'
import AuthModal from './AuthModal'
import UploadModal from './UploadModal'
import SearchModal from './SearchModal'
import ProfileModal from './ProfileModal'
import LiveStreamModal from './LiveStreamModal'
import { mockVideos } from '../data/mockData'
import { toast } from 'sonner'

interface EnhancedTikTokLayoutProps {
  user: any
  onUserUpdate: (user: any) => void
}

export default function EnhancedTikTokLayout({ user, onUserUpdate }: EnhancedTikTokLayoutProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState('foryou') // 'foryou', 'following', 'trending'
  const [videos, setVideos] = useState(() => {
    // Load videos from localStorage and combine with mock data
    const savedVideos = JSON.parse(localStorage.getItem('all_videos') || '[]')
    return [...savedVideos, ...mockVideos]
  })
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'follow', username: 'dancequeen', message: 'started following you', timestamp: Date.now() - 300000, read: false },
    { id: '2', type: 'live', username: 'chefmike', message: 'is going live now!', timestamp: Date.now() - 600000, read: false },
    { id: '3', type: 'upload', username: 'fitnessguru', message: 'uploaded a new video', timestamp: Date.now() - 900000, read: true }
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [comments, setComments] = useState([
    { 
      id: '1', 
      username: 'user123', 
      displayName: 'Sarah Chen',
      text: 'This is absolutely amazing! 😍 The creativity is off the charts!', 
      likes: 24, 
      timestamp: new Date(Date.now() - 300000).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      badges: ['verified', 'top_fan']
    },
    { 
      id: '2', 
      username: 'animann', 
      displayName: 'Alex Rivera',
      text: 'What you are watching there? This looks so cool! Can you do a tutorial?', 
      likes: 8, 
      timestamp: new Date(Date.now() - 600000).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face',
      badges: ['supporter'],
      replies: [
        {
          id: '2-1',
          username: 'creator_user',
          displayName: 'Creator',
          text: 'Thanks! I\'ll definitely consider making a tutorial 🎥',
          likes: 3,
          timestamp: new Date(Date.now() - 500000).toISOString(),
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          isCreator: true,
          badges: ['creator']
        }
      ]
    },
    { 
      id: '3', 
      username: 'edward', 
      displayName: 'Edward Kim',
      text: 'Nice work! The attention to detail is incredible 👏', 
      likes: 12, 
      timestamp: new Date(Date.now() - 900000).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      badges: ['new']
    },
    { 
      id: '4', 
      username: 'omammon', 
      displayName: 'Maya Johnson',
      text: 'This is giving me so much inspiration! 🌟✨', 
      likes: 6, 
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      isPinned: true,
      badges: ['verified']
    }
  ])

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tiktok_user')
    if (savedUser && !user) {
      onUserUpdate(JSON.parse(savedUser))
    }
  }, [user, onUserUpdate])

  // Enhanced navigation with keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        setCurrentVideoIndex(prev => prev - 1)
      } else if (e.key === 'ArrowDown' && currentVideoIndex < filteredVideos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1)
      } else if (e.key === ' ') {
        e.preventDefault()
        // Space bar handled by video player
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentVideoIndex, filteredVideos.length])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showNotifications) {
        const target = e.target as Element
        if (!target.closest('.notification-dropdown') && !target.closest('.notification-bell')) {
          setShowNotifications(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentVideoIndex < filteredVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1)
    }
  }

  const handleLogin = () => {
    if (user) {
      // Logout
      localStorage.removeItem('tiktok_user')
      onUserUpdate(null)
      toast.success('Logged out successfully! 👋')
    } else {
      setShowAuthModal(true)
    }
  }

  const handleUpload = () => {
    if (!user) {
      toast.error('Please log in to upload videos')
      setShowAuthModal(true)
      return
    }
    setShowUploadModal(true)
  }

  const handleVideoUploaded = (newVideo: any) => {
    setVideos(prev => [newVideo, ...prev])
    // Navigate to the uploaded video
    setCurrentVideoIndex(0)
    toast.success('Video uploaded successfully! 🎉')
  }

  const handleLiveStream = () => {
    if (!user) {
      toast.error('Please log in to start a live stream')
      setShowAuthModal(true)
      return
    }
    setShowLiveStreamModal(true)
  }

  const handleVideoSelect = (video: any) => {
    const videoIndex = filteredVideos.findIndex(v => v.id === video.id)
    if (videoIndex !== -1) {
      setCurrentVideoIndex(videoIndex)
    }
  }

  const handleSendTip = () => {
    if (!user) {
      toast.error('Please log in to send tips')
      setShowAuthModal(true)
      return
    }
    setShowTipModal(true)
  }

  const sendTip = () => {
    if (!tipAmount || !user) return

    const amount = parseFloat(tipAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid tip amount')
      return
    }

    // Add tip message to comments (simulated)
    const currentVideo = filteredVideos[currentVideoIndex]
    if (currentVideo) {
      toast.success(`Tip of ${amount} sent to @${currentVideo.author.username}! 🎉`)
    }
    
    setTipAmount('')
    setShowTipModal(false)
  }

  const handleAddComment = (text: string) => {
    if (!user) return

    const newComment = {
      id: Date.now().toString(),
      username: user.username || 'user',
      displayName: user.displayName || user.username,
      text,
      likes: 0,
      timestamp: new Date().toISOString(),
      avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      badges: ['new']
    }

    setComments(prev => [newComment, ...prev])
  }

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1, isLiked: !comment.isLiked }
      }
      return comment
    }))
  }

  const handleReplyComment = (commentId: string, text: string) => {
    if (!user) return

    const newReply = {
      id: `${commentId}-${Date.now()}`,
      username: user.username || 'user',
      displayName: user.displayName || user.username,
      text,
      likes: 0,
      timestamp: new Date().toISOString(),
      avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      badges: ['new']
    }

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { 
          ...comment, 
          replies: [...(comment.replies || []), newReply]
        }
      }
      return comment
    }))
  }

  // Filter videos based on current page
  const getFilteredVideos = () => {
    switch (currentPage) {
      case 'following':
        // Show videos from followed users (simulate with some videos)
        return videos.filter(video => ['dancequeen', 'chefmike', 'fitnessguru'].includes(video.author.username))
      case 'trending':
        // Show trending videos (simulate with high engagement videos)
        return videos.filter(video => video.stats.likes > 10000).sort((a, b) => b.stats.likes - a.stats.likes)
      default:
        return videos
    }
  }

  const filteredVideos = getFilteredVideos()

  // Handle page navigation
  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    setCurrentVideoIndex(0) // Reset to first video when changing pages
  }

  // Handle notifications
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    // Mark all notifications as read when opened
    if (!showNotifications) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  // Handle follow action
  const handleFollow = (username: string) => {
    if (!user) {
      toast.error('Please log in to follow users')
      setShowAuthModal(true)
      return
    }

    // Add follow notification
    const newNotification = {
      id: Date.now().toString(),
      type: 'follow' as const,
      username: username,
      message: 'You are now following this user! You\'ll get notified when they go live or upload videos.',
      timestamp: Date.now(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])
    toast.success(`Now following @${username}! 🎉`)

    // Simulate getting notified when they upload or go live
    setTimeout(() => {
      const uploadNotification = {
        id: (Date.now() + 1).toString(),
        type: 'upload' as const,
        username: username,
        message: 'uploaded a new video',
        timestamp: Date.now(),
        read: false
      }
      setNotifications(prev => [uploadNotification, ...prev])
    }, 3000) // Simulate upload notification after 3 seconds
  }

  const suggestedAccounts = [
    { username: 'kyliejenner', displayName: 'Kylie Jenner', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face', followers: '52.1M' },
    { username: '9gag', displayName: '9GAG', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', followers: '57.8M' },
    { username: 'bellapoarch', displayName: 'Bella Poarch', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', followers: '93.4M' }
  ]

  const followingAccounts = [
    { username: 'Ann Smith', handle: 'user1203941', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    { username: 'Edward', handle: 'edward', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }
  ]



  return (
    <div className="h-screen bg-gradient-to-br from-purple-900/30 via-black via-pink-900/20 to-blue-900/30 flex overflow-hidden relative">
      {/* Fun background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-40 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Floating emojis */}
        <div className="absolute top-20 left-1/4 text-4xl animate-bounce opacity-30" style={{ animationDelay: '0s' }}>🌈</div>
        <div className="absolute top-40 right-1/3 text-3xl animate-bounce opacity-30" style={{ animationDelay: '1.5s' }}>✨</div>
        <div className="absolute bottom-32 left-1/3 text-5xl animate-bounce opacity-30" style={{ animationDelay: '2.5s' }}>🎉</div>
        <div className="absolute bottom-60 right-1/4 text-3xl animate-bounce opacity-30" style={{ animationDelay: '1s' }}>🚀</div>
      </div>
      {/* Enhanced Left Sidebar */}
      <div className="w-72 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-r border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FF0050] via-[#FFD700] to-[#00F2EA] rounded-2xl flex items-center justify-center shadow-lg rainbow-border animate-bounce">
              <div className="text-white font-bold text-xl">🐰</div>
            </div>
            <span className="text-white font-bold text-2xl prismatic-text">RabbitTok</span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <div className="text-lg animate-bounce">🌈</div>
          </div>

          {/* Enhanced Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">🔍</div>
            <Input 
              placeholder="Discover amazing content... ✨"
              onClick={() => setShowSearchModal(true)}
              className="pl-12 bg-gray-800/50 border-2 border-[#FF0050]/30 text-white placeholder-gray-300 rounded-2xl backdrop-blur-sm hover:bg-gray-700/50 hover:border-[#00F2EA]/50 transition-all cursor-pointer font-medium"
              readOnly
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Main Navigation */}
            <div className="space-y-4 mb-8">
              <Button 
                variant="ghost" 
                onClick={() => handlePageChange('foryou')}
                className={`w-full justify-start text-white hover:scale-105 rounded-2xl border-2 shadow-lg transition-all ${
                  currentPage === 'foryou' 
                    ? 'glitter-rainbow border-[#FF0050]/50 bg-gradient-to-r from-[#FF0050]/20 to-[#00F2EA]/20' 
                    : 'border-gray-600/30 hover:border-[#FF0050]/30'
                }`}
              >
                <div className="w-10 h-10 mr-4 flex items-center justify-center bg-gradient-to-r from-[#FF0050] via-[#FFD700] to-[#00F2EA] rounded-xl shadow-md">
                  <div className="text-lg">🏠</div>
                </div>
                <span className="font-bold">For You</span>
                <Badge className="ml-auto bg-gradient-to-r from-[#FF0050] to-[#e6004a] text-white animate-pulse">🔥 Hot</Badge>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => handlePageChange('following')}
                className={`w-full justify-start text-white hover:scale-105 rounded-2xl border-2 transition-all ${
                  currentPage === 'following' 
                    ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
                    : 'border-gray-600/30 hover:border-cyan-500/30 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20'
                }`}
              >
                <div className="w-10 h-10 mr-4 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-md">
                  <div className="text-lg">👥</div>
                </div>
                <span className="font-bold">Following</span>
                <div className="ml-auto text-cyan-400 animate-bounce">💙</div>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => handlePageChange('trending')}
                className={`w-full justify-start text-white hover:scale-105 rounded-2xl border-2 transition-all ${
                  currentPage === 'trending' 
                    ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20' 
                    : 'border-gray-600/30 hover:border-yellow-500/30 hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20'
                }`}
              >
                <div className="w-10 h-10 mr-4 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-md">
                  <div className="text-lg">📈</div>
                </div>
                <span className="font-bold">Trending</span>
                <Badge className="ml-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold animate-bounce">🔥 Viral</Badge>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleLiveStream}
                className="w-full justify-start text-white hover:text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 rounded-2xl transition-all hover:scale-105"
              >
                <div className="w-10 h-10 mr-4 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-md">
                  <div className="text-lg">📺</div>
                </div>
                <span className="font-bold">Live Stream</span>
                <Badge className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs animate-pulse font-bold">🔴 LIVE</Badge>
              </Button>
              
              {/* New fun menu items */}
              <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-indigo-500/20 rounded-2xl transition-all hover:scale-105">
                <div className="w-10 h-10 mr-4 flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-md">
                  <div className="text-lg">🎮</div>
                </div>
                <span className="font-bold">Games</span>
                <div className="ml-auto text-purple-400 animate-spin">🎯</div>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 rounded-2xl transition-all hover:scale-105">
                <div className="w-10 h-10 mr-4 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md">
                  <div className="text-lg">🎵</div>
                </div>
                <span className="font-bold">Music</span>
                <div className="ml-auto text-green-400 animate-bounce">🎶</div>
              </Button>
            </div>

            {/* Suggested Accounts */}
            <div className="mb-8">
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider flex items-center prismatic-text">
                <div className="text-lg mr-2 animate-bounce">✨</div>
                Suggested for you
                <div className="text-lg ml-2 animate-pulse">🌟</div>
              </h3>
              <div className="space-y-4">
                {suggestedAccounts.map((account, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all cursor-pointer hover:scale-105 comment-glass">
                    <Avatar className="w-12 h-12 rainbow-border">
                      <AvatarImage src={account.avatar} />
                      <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate prismatic-text">{account.displayName}</p>
                      <p className="text-gray-300 text-xs truncate font-medium">{account.followers} followers 👥</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleFollow(account.username)}
                      className="bg-gradient-to-r from-[#FF0050] via-[#FFD700] to-[#00F2EA] hover:scale-110 text-white rounded-full px-4 text-xs font-bold shadow-lg transition-all"
                    >
                      Follow ➕
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-[#00F2EA] text-sm p-0 h-auto mt-3 hover:text-[#00d4c7] font-bold prismatic-text">
                See all suggestions 🔍
              </Button>
            </div>

            {/* Following */}
            <div>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider prismatic-text flex items-center">
                <div className="text-lg mr-2 animate-bounce">👥</div>
                Following
                <div className="text-lg ml-2 animate-pulse">💖</div>
              </h3>
              <div className="space-y-4">
                {followingAccounts.map((account, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all cursor-pointer hover:scale-105 comment-glass">
                    <Avatar className="w-12 h-12 rainbow-border">
                      <AvatarImage src={account.avatar} />
                      <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate prismatic-text">{account.username}</p>
                      <p className="text-gray-300 text-xs truncate font-medium">@{account.handle} ✨</p>
                    </div>
                    <div className="text-green-400 animate-pulse">💚</div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-[#00F2EA] text-sm p-0 h-auto mt-3 hover:text-[#00d4c7] font-bold prismatic-text">
                See all 👀
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="glitter-rainbow border-2 border-[#FF0050]/30 text-white text-xs px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-lg">
            <div className="text-lg animate-bounce">🐰</div>
            <span className="font-bold prismatic-text">RabbitTok Enhanced</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#FF0050] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#00F2EA] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto text-white p-0 h-auto hover:scale-110 transition-all">×</Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Enhanced Video Player */}
        <div className="flex-1 relative">
          <div 
            className="h-full"
            style={{
              transform: `translateY(-${currentVideoIndex * 100}vh)`,
              transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            {filteredVideos.map((video, index) => (
              <GlitteryVideoPlayer
                key={video.id}
                video={video}
                isActive={index === currentVideoIndex}
                user={user}
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoPrevious={currentVideoIndex > 0}
                canGoNext={currentVideoIndex < filteredVideos.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Comments Panel */}
        <EnhancedCommentSection
          comments={comments}
          user={user}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onReplyComment={handleReplyComment}
          onSendTip={(username, amount) => {
            if (!user) {
              toast.error('Please log in to send tips')
              return
            }
            toast.success(`Tip of ${amount} sent to @${username}! 🎉`)
            // Here you could integrate with a real payment system
          }}
          videoAuthor={filteredVideos[currentVideoIndex]?.author}
        />
      </div>

      {/* Enhanced Top Header */}
      <div className="absolute top-0 left-72 right-0 bg-gradient-to-r from-black/80 via-purple-900/20 to-black/80 backdrop-blur-xl border-b border-gray-700/30 z-10">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-6">
            {/* Page Indicator */}
            <div className="flex items-center space-x-2">
              <div className="text-white font-bold text-lg prismatic-text">
                {currentPage === 'foryou' && '🏠 For You'}
                {currentPage === 'following' && '👥 Following'}
                {currentPage === 'trending' && '📈 Trending'}
              </div>
              <div className="text-sm text-gray-400">
                ({filteredVideos.length} videos)
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">🔍</div>
              <Input 
                placeholder="Search videos, creators, sounds... 🎵"
                onClick={() => setShowSearchModal(true)}
                className="pl-12 w-96 bg-gray-800/50 border-2 border-[#FF0050]/30 text-white placeholder-gray-300 rounded-2xl backdrop-blur-sm hover:bg-gray-700/50 hover:border-[#00F2EA]/50 transition-all cursor-pointer font-medium"
                readOnly
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleUpload}
              className="bg-gradient-to-r from-[#FF0050] via-[#FFD700] to-[#00F2EA] hover:scale-110 text-white rounded-2xl px-6 py-2 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-lg mr-2">📤</div>
              Upload
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={handleNotificationClick}
                    className="notification-bell relative text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 rounded-2xl p-3 transition-all hover:scale-105"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadNotifications > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#FF0050] to-[#e6004a] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{unreadNotifications}</span>
                      </div>
                    )}
                  </Button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50">
                      <div className="p-4 border-b border-gray-700/50">
                        <h3 className="text-white font-bold text-lg flex items-center">
                          <Bell className="w-5 h-5 mr-2 text-blue-400" />
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400">
                            <div className="text-4xl mb-2">🔔</div>
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition-all cursor-pointer ${
                                !notification.read ? 'bg-blue-500/10' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'follow' ? 'bg-blue-400' :
                                  notification.type === 'live' ? 'bg-red-400' :
                                  'bg-green-400'
                                }`} />
                                <div className="flex-1">
                                  <p className="text-white text-sm">
                                    <span className="font-bold">@{notification.username}</span>{' '}
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="text-lg">
                                  {notification.type === 'follow' ? '👤' :
                                   notification.type === 'live' ? '🔴' : '📹'}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center space-x-2 text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 rounded-2xl px-4 py-2 transition-all hover:scale-105"
                >
                  <Avatar className="w-8 h-8 rainbow-border">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold prismatic-text">{user.displayName}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-2 border-gray-600 text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 rounded-2xl px-4 py-2 font-bold transition-all hover:scale-105"
                >
                  Logout 👋
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleLogin}
                className="border-2 border-[#00F2EA] text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-2xl px-6 py-2 font-bold transition-all hover:scale-105"
              >
                Log in 🚀
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          onUserUpdate(user)
          setShowAuthModal(false)
        }}
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        user={user}
        onVideoUploaded={handleVideoUploaded}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onVideoSelect={handleVideoSelect}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUserUpdate={onUserUpdate}
        onVideoSelect={handleVideoSelect}
      />

      <LiveStreamModal
        isOpen={showLiveStreamModal}
        onClose={() => setShowLiveStreamModal(false)}
        user={user}
      />

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-green-500" />
              Send a Tip
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Show your support to @{filteredVideos[currentVideoIndex]?.author.username} with a tip!
            </p>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                {[1, 5, 10, 20].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setTipAmount(amount.toString())}
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-green-500/20 hover:border-green-500"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <Input
                type="number"
                placeholder="Custom amount"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                min="0.01"
                step="0.01"
              />
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowTipModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendTip}
                  disabled={!tipAmount || parseFloat(tipAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Send ${tipAmount || '0'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}