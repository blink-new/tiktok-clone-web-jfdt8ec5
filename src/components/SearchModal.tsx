import { useState, useEffect, useMemo } from 'react'
import { Search, X, Hash, User, Video, TrendingUp, Radio, Filter } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onVideoSelect: (video: any) => void
}

export default function SearchModal({ isOpen, onClose, onVideoSelect }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchResults, setSearchResults] = useState({
    videos: [],
    users: [],
    hashtags: [],
    trending: [],
    live: []
  })

  // Mock data for search results
  const mockSearchData = useMemo(() => ({
    videos: [
      {
        id: 'v1',
        title: 'Amazing dance moves! 💃',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=400&fit=crop',
        author: { username: 'dancequeen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face' },
        views: '1.2M',
        likes: '89K'
      },
      {
        id: 'v2',
        title: 'Cooking pasta like a pro 🍝',
        thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=400&fit=crop',
        author: { username: 'chefmike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
        views: '856K',
        likes: '45K'
      },
      {
        id: 'v3',
        title: 'Sunset workout motivation 🌅',
        thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
        author: { username: 'fitnessguru', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
        views: '2.1M',
        likes: '156K'
      }
    ],
    users: [
      {
        id: 'u1',
        username: 'dancequeen',
        displayName: 'Dance Queen 👑',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face',
        followers: '2.3M',
        verified: true,
        bio: 'Professional dancer & choreographer ✨'
      },
      {
        id: 'u2',
        username: 'chefmike',
        displayName: 'Chef Mike 👨‍🍳',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        followers: '1.8M',
        verified: false,
        bio: 'Cooking made simple & delicious 🍳'
      },
      {
        id: 'u3',
        username: 'fitnessguru',
        displayName: 'Fitness Guru 💪',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        followers: '3.1M',
        verified: true,
        bio: 'Transform your body & mind 🏋️‍♀️'
      }
    ],
    hashtags: [
      { name: 'dance', videos: '12.5M', trending: true },
      { name: 'cooking', videos: '8.9M', trending: false },
      { name: 'fitness', videos: '15.2M', trending: true },
      { name: 'viral', videos: '45.8M', trending: true },
      { name: 'fyp', videos: '89.3M', trending: true },
      { name: 'comedy', videos: '23.1M', trending: false }
    ],
    trending: [
      { name: 'silhouettechallenge', videos: '2.1M', growth: '+156%' },
      { name: 'morningvibes', videos: '1.8M', growth: '+89%' },
      { name: 'foodhack', videos: '3.2M', growth: '+234%' },
      { name: 'petcheck', videos: '1.5M', growth: '+67%' }
    ],
    live: [
      {
        id: 'l1',
        title: 'Live Dance Battle! 🔥',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop',
        author: { username: 'dancequeen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face' },
        viewers: '12.3K'
      },
      {
        id: 'l2',
        title: 'Cooking Show Live 👨‍🍳',
        thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop',
        author: { username: 'chefmike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
        viewers: '8.7K'
      }
    ]
  }), [])

  useEffect(() => {
    // Simulate search with delay
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        // Filter results based on search query
        const filteredResults = {
          videos: mockSearchData.videos.filter(v => 
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.author.username.toLowerCase().includes(searchQuery.toLowerCase())
          ),
          users: mockSearchData.users.filter(u => 
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
          ),
          hashtags: mockSearchData.hashtags.filter(h => 
            h.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
          trending: mockSearchData.trending,
          live: mockSearchData.live
        }
        setSearchResults(filteredResults)
      } else {
        setSearchResults(mockSearchData)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, mockSearchData])

  const handleVideoClick = (video: any) => {
    onVideoSelect(video)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-[#FF0050] to-[#00F2EA] bg-clip-text text-transparent">
            Discover Amazing Content 🔍
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search videos, users, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-12 text-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800 rounded-xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg">
                All
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg">
                Videos
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg">
                Users
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg">
                Hashtags
              </TabsTrigger>
              <TabsTrigger value="live" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg">
                Live
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 max-h-96 overflow-y-auto">
              <TabsContent value="all" className="space-y-6">
                {/* Trending Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#FF0050]" />
                    Trending Now
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {searchResults.trending.slice(0, 4).map((trend, index) => (
                      <div key={index} className="bg-gray-800 rounded-xl p-3 hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">#{trend.name}</span>
                          <Badge className="bg-[#00F2EA] text-black text-xs">
                            {trend.growth}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{trend.videos} videos</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Videos */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-[#00F2EA]" />
                    Popular Videos
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {searchResults.videos.slice(0, 6).map((video) => (
                      <div
                        key={video.id}
                        onClick={() => handleVideoClick(video)}
                        className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{video.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={video.author.avatar} />
                              <AvatarFallback>{video.author.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-400">@{video.author.username}</span>
                          </div>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                            <span>{video.views} views</span>
                            <span>{video.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="videos" className="space-y-3">
                {searchResults.videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="flex items-center space-x-4 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{video.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={video.author.avatar} />
                          <AvatarFallback>{video.author.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-400">@{video.author.username}</span>
                      </div>
                      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-400">
                        <span>{video.views} views</span>
                        <span>{video.likes} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="users" className="space-y-3">
                {searchResults.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-4 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{user.displayName}</h4>
                        {user.verified && (
                          <div className="w-4 h-4 bg-[#00F2EA] rounded-full flex items-center justify-center">
                            <span className="text-black text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                      <p className="text-sm text-gray-300 mt-1">{user.bio}</p>
                      <p className="text-sm text-gray-400 mt-1">{user.followers} followers</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FF0050] hover:bg-[#e6004a] text-white rounded-full px-6"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-3">
                {searchResults.hashtags.map((hashtag, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-full flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">#{hashtag.name}</h4>
                        <p className="text-sm text-gray-400">{hashtag.videos} videos</p>
                      </div>
                    </div>
                    {hashtag.trending && (
                      <Badge className="bg-[#FF0050] text-white">
                        Trending
                      </Badge>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="live" className="space-y-3">
                {searchResults.live.map((stream) => (
                  <div
                    key={stream.id}
                    className="flex items-center space-x-4 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded flex items-center">
                        <Radio className="w-3 h-3 mr-1" />
                        LIVE
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{stream.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={stream.author.avatar} />
                          <AvatarFallback>{stream.author.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-400">@{stream.author.username}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{stream.viewers} watching</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}