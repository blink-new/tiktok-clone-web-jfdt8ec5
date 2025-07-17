import { useState, useEffect } from 'react'
import { X, Edit, Settings, Share, Heart, MessageCircle, Play, Users, Video, Grid, Bookmark } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { toast } from 'sonner'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUserUpdate: (user: any) => void
  onVideoSelect: (video: any) => void
}

export default function ProfileModal({ isOpen, onClose, user, onUserUpdate, onVideoSelect }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [userVideos, setUserVideos] = useState([])
  const [likedVideos, setLikedVideos] = useState([])
  const [activeTab, setActiveTab] = useState('videos')
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  })

  useEffect(() => {
    if (user) {
      // Load user's videos from localStorage
      const allVideos = JSON.parse(localStorage.getItem('user_videos') || '[]')
      const userVids = allVideos.filter((video: any) => video.userId === user.id)
      setUserVideos(userVids)

      // Load liked videos (mock data for now)
      const mockLikedVideos = [
        {
          id: 'liked1',
          title: 'Amazing dance moves! 💃',
          thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=400&fit=crop',
          author: { username: 'dancequeen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=100&h=100&fit=crop&crop=face' },
          views: '1.2M',
          likes: '89K'
        },
        {
          id: 'liked2',
          title: 'Cooking pasta like a pro 🍝',
          thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=400&fit=crop',
          author: { username: 'chefmike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
          views: '856K',
          likes: '45K'
        }
      ]
      setLikedVideos(mockLikedVideos)

      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      displayName: editForm.displayName,
      bio: editForm.bio,
      avatar: editForm.avatar
    }
    
    localStorage.setItem('tiktok_user', JSON.stringify(updatedUser))
    onUserUpdate(updatedUser)
    setIsEditing(false)
    toast.success('Profile updated successfully! ✨')
  }

  const handleVideoClick = (video: any) => {
    onVideoSelect(video)
    onClose()
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-[#FF0050] to-[#00F2EA] bg-clip-text text-transparent">
            {isEditing ? 'Edit Profile ✏️' : `${user.displayName}'s Profile 👤`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-gradient-to-r from-[#FF0050] to-[#00F2EA]">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-[#FF0050] to-[#00F2EA] text-white">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00F2EA] rounded-full flex items-center justify-center border-2 border-gray-900">
                  <span className="text-black text-sm font-bold">✓</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Display Name"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                  />
                  <Textarea
                    placeholder="Bio (tell people about yourself...)"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none"
                    rows={3}
                  />
                  <Input
                    placeholder="Avatar URL"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                  />
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-[#00F2EA] to-[#00d4c7] hover:from-[#00d4c7] to-[#00b8ad] text-black rounded-xl font-semibold"
                    >
                      Save Changes ✨
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gray-600 text-white hover:bg-gray-800 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold">{user.displayName}</h2>
                    {user.verified && (
                      <Badge className="bg-[#00F2EA] text-black">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 mb-1">@{user.username}</p>
                  <p className="text-gray-300 mb-4">{user.bio || 'No bio yet...'}</p>
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{user.followingCount || 0}</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{user.followersCount || 0}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{userVideos.length}</div>
                      <div className="text-sm text-gray-400">Videos</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-xl"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-800 rounded-xl"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-800 rounded-xl"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Tabs */}
          {!isEditing && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-xl">
                <TabsTrigger value="videos" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg flex items-center space-x-2">
                  <Grid className="w-4 h-4" />
                  <span>Videos</span>
                </TabsTrigger>
                <TabsTrigger value="liked" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Liked</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-[#FF0050] data-[state=active]:text-white rounded-lg flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Saved</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="videos" className="space-y-4">
                  {userVideos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {userVideos.map((video: any) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoClick(video)}
                          className="relative aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-sm font-medium truncate">{video.title}</p>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-300">
                              <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{video.likesCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{video.commentsCount || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No videos yet</h3>
                      <p className="text-gray-500">Start creating amazing content!</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="liked" className="space-y-4">
                  {likedVideos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {likedVideos.map((video: any) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoClick(video)}
                          className="relative aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-sm font-medium truncate">{video.title}</p>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-300">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={video.author.avatar} />
                                <AvatarFallback>{video.author.username[0]}</AvatarFallback>
                              </Avatar>
                              <span>@{video.author.username}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No liked videos yet</h3>
                      <p className="text-gray-500">Videos you like will appear here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No saved videos yet</h3>
                    <p className="text-gray-500">Videos you save will appear here</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}