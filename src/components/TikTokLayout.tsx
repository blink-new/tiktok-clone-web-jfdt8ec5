import { useState } from 'react'
import { Search, Plus, Heart, MessageCircle, Share, Music, Volume2, VolumeX, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface TikTokLayoutProps {
  user: any
}

export default function TikTokLayout({ user }: TikTokLayoutProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [newComment, setNewComment] = useState('')

  const suggestedAccounts = [
    { username: 'kyliejenner', displayName: 'Kylie Jenner', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face' },
    { username: '9gag', displayName: '9GAG', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' },
    { username: 'bellapoarch', displayName: 'Bella Poarch', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' }
  ]

  const followingAccounts = [
    { username: 'Ann Smith', handle: 'user1203941', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    { username: 'Edward', handle: 'edward', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }
  ]

  const comments = [
    { username: 'user123', text: 'I love u 😍', likes: 0, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    { username: 'animann', text: 'What you are watching there?', likes: 3, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face' },
    { username: 'edward', text: 'Nice pijamas', likes: 0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    { username: 'omammon', text: 'noooooooooodlessss😂', likes: 0, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
  ]

  return (
    <div className="h-screen bg-black flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-black border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-bold text-xl">TikTok</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search accounts, hashtags, videos..."
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Main Navigation */}
            <div className="space-y-2 mb-6">
              <Button variant="ghost" className="w-full justify-start text-white bg-gray-800 hover:bg-gray-700">
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                For you
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                </div>
                Following
              </Button>
            </div>

            {/* Suggested Accounts */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">Suggested Accounts</h3>
              <div className="space-y-3">
                {suggestedAccounts.map((account, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={account.avatar} />
                      <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{account.displayName}</p>
                      <p className="text-gray-400 text-xs truncate">{account.username}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-[#FF0050] text-sm p-0 h-auto mt-2">
                See all
              </Button>
            </div>

            {/* Following */}
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">Following</h3>
              <div className="space-y-3">
                {followingAccounts.map((account, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={account.avatar} />
                      <AvatarFallback>{account.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{account.username}</p>
                      <p className="text-gray-400 text-xs truncate">{account.handle}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-[#FF0050] text-sm p-0 h-auto mt-2">
                See all
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom notification */}
        <div className="p-4 border-t border-gray-800">
          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-2">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            <span>1 Issue</span>
            <button className="ml-auto text-white">×</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Video Player */}
        <div className="flex-1 relative bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500">
          {/* Video container with gradient background */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Play button */}
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-8">
              <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
            </div>
          </div>

          {/* Video info overlay */}
          <div className="absolute bottom-20 left-6 right-20">
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-sm">
              <div className="flex items-center space-x-2 mb-1">
                <Music className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">Anime and chill</span>
                <span className="text-yellow-400">🌙</span>
              </div>
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-yellow-400">✨</span>
                <span className="text-white text-sm">Living my best colorful life!</span>
                <span className="text-yellow-400">✨</span>
              </div>
              <div className="flex items-center space-x-1">
                <Music className="w-3 h-3 text-white" />
                <span className="text-white text-xs">Lofi Hip Hop - Chill Vibes</span>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-4">
            {/* Like */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
              >
                <Heart className="w-7 h-7" />
              </Button>
              <span className="text-white text-xs font-medium mt-1">126</span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
              >
                <MessageCircle className="w-7 h-7" />
              </Button>
              <span className="text-white text-xs font-medium mt-1">89</span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
              >
                <Share className="w-7 h-7" />
              </Button>
              <span className="text-white text-xs font-medium mt-1 bg-black px-2 py-0.5 rounded text-[10px]">Share</span>
            </div>

            {/* YouTube */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 rounded-full p-0 text-white hover:bg-white/20 bg-red-600"
              >
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs">▶</span>
                </div>
              </Button>
              <span className="text-white text-xs font-medium mt-1 bg-black px-2 py-0.5 rounded text-[10px]">YouTube</span>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center space-x-4">
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            {/* Progress bar */}
            <div className="flex-1 flex items-center space-x-3">
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div className="bg-pink-500 h-1 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <span className="text-white text-sm">1:23</span>
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div className="bg-cyan-400 h-1 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-white text-sm">3:45</span>
            </div>
          </div>

          {/* Volume control top right */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 w-10 h-10 rounded-full p-0 text-white hover:bg-white/20 bg-black/50"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        {/* Right Comments Panel */}
        <div className="w-80 bg-black border-l border-gray-800 flex flex-col">
          {/* Comments header */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Comments</h3>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium text-sm">{comment.username}</span>
                    {comment.likes > 0 && (
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-red-500 fill-current" />
                        <span className="text-gray-400 text-xs">{comment.likes}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{comment.text}</p>
                  <button className="text-gray-500 text-xs mt-1 hover:text-gray-400">Reply</button>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
              />
              <Button 
                size="sm" 
                className="bg-[#FF0050] hover:bg-[#e6004a] text-white rounded-full px-6"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-64 right-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search accounts, hashtags, videos..."
                className="pl-10 w-96 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button className="bg-[#FF0050] hover:bg-[#e6004a] text-white rounded-md px-4 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 rounded-md px-4 py-2">
              Log in
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}