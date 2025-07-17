import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Reply, MoreHorizontal, Gift, Sparkles, Star, Crown, Flame, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { toast } from 'sonner'

interface Comment {
  id: string
  username: string
  displayName?: string
  text: string
  likes: number
  timestamp: string
  avatar: string
  isLiked?: boolean
  isVerified?: boolean
  isCreator?: boolean
  isPinned?: boolean
  replies?: Comment[]
  badges?: string[]
}

interface EnhancedCommentSectionProps {
  comments: Comment[]
  user: any
  onAddComment: (text: string) => void
  onLikeComment: (commentId: string) => void
  onReplyComment: (commentId: string, text: string) => void
  onSendTip?: (username: string, amount: number) => void
  videoAuthor?: {
    username: string
    avatar: string
  }
}

const CommentBadge = ({ type }: { type: string }) => {
  const badgeConfig = {
    creator: { icon: Crown, color: 'from-yellow-400 to-orange-500', text: 'Creator' },
    verified: { icon: Star, color: 'from-blue-400 to-cyan-500', text: 'Verified' },
    top_fan: { icon: Flame, color: 'from-red-400 to-pink-500', text: 'Top Fan' },
    supporter: { icon: Gift, color: 'from-green-400 to-emerald-500', text: 'Supporter' },
    new: { icon: Sparkles, color: 'from-purple-400 to-indigo-500', text: 'New' }
  }

  const config = badgeConfig[type as keyof typeof badgeConfig]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge className={`bg-gradient-to-r ${config.color} text-white text-xs px-2 py-0.5 rounded-full flex items-center space-x-1`}>
      <Icon className="w-3 h-3" />
      <span>{config.text}</span>
    </Badge>
  )
}

const CommentItem = ({ 
  comment, 
  user, 
  onLike, 
  onReply, 
  onSendTip,
  isReply = false 
}: { 
  comment: Comment
  user: any
  onLike: (id: string) => void
  onReply: (id: string, text: string) => void
  onSendTip?: (username: string, amount: number) => void
  isReply?: boolean
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isLiked, setIsLiked] = useState(comment.isLiked || false)
  const [likes, setLikes] = useState(comment.likes)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
    onLike(comment.id)
  }

  const handleReply = () => {
    if (!replyText.trim()) return
    onReply(comment.id, replyText)
    setReplyText('')
    setShowReplyInput(false)
    toast.success('Reply posted! 💬')
  }

  const handleSendTip = () => {
    if (!user) {
      toast.error('Please log in to send tips')
      return
    }
    setShowTipModal(true)
  }

  const sendTip = () => {
    if (!tipAmount || !onSendTip) return

    const amount = parseFloat(tipAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid tip amount')
      return
    }

    onSendTip(comment.username, amount)
    setTipAmount('')
    setShowTipModal(false)
    toast.success(`Tip of $${amount} sent to @${comment.username}! 🎉`)
  }

  const timeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return 'now'
  }

  return (
    <>
      <div className={`${isReply ? 'ml-12' : ''} mb-6`}>
        {comment.isPinned && (
          <div className="flex items-center space-x-2 mb-2 text-yellow-400 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">Pinned by creator</span>
          </div>
        )}
        
        <div className="flex space-x-3">
          <div className="relative">
            <Avatar className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} flex-shrink-0 rainbow-border`}>
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {comment.isCreator && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="comment-glass rounded-2xl p-4 mb-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-white font-semibold text-sm prismatic-text">
                  {comment.displayName || comment.username}
                </span>
                
                {comment.badges?.map((badge, index) => (
                  <CommentBadge key={index} type={badge} />
                ))}
                
                <span className="text-gray-400 text-xs">
                  {timeAgo(comment.timestamp)}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-gray-200 text-sm leading-relaxed mb-3">
                {comment.text}
              </p>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center space-x-1 text-xs hover:bg-white/10 rounded-full px-3 py-1 transition-all ${
                    isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{likes > 0 ? likes : 'Like'}</span>
                </Button>
                
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-full px-3 py-1 transition-all"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span className="font-medium">Reply</span>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendTip}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-full px-3 py-1 transition-all"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span className="font-medium">Tip</span>
                </Button>
              </div>
            </div>
            
            {/* Reply Input */}
            {showReplyInput && (
              <div className="flex space-x-2 mb-4">
                {user && (
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 flex space-x-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.displayName || comment.username}...`}
                    className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 rounded-xl text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-xl px-4 disabled:opacity-50"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    user={user}
                    onLike={onLike}
                    onReply={onReply}
                    onSendTip={onSendTip}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-green-500" />
              Send Tip to @{comment.username}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Show your appreciation with a tip!
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
    </>
  )
}

export default function EnhancedCommentSection({
  comments,
  user,
  onAddComment,
  onLikeComment,
  onReplyComment,
  onSendTip,
  videoAuthor
}: EnhancedCommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'oldest'>('newest')
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when comment button is clicked from video player
  useEffect(() => {
    const handleFocus = () => {
      inputRef.current?.focus()
    }

    // Listen for focus events from video player
    window.addEventListener('focusCommentInput', handleFocus)
    return () => window.removeEventListener('focusCommentInput', handleFocus)
  }, [])

  const handleAddComment = () => {
    if (!newComment.trim()) return
    if (!user) {
      toast.error('Please log in to comment')
      return
    }
    
    onAddComment(newComment)
    setNewComment('')
    toast.success('Comment posted! 🎉')
  }

  const handleSendCreatorTip = () => {
    if (!user) {
      toast.error('Please log in to send tips')
      return
    }
    setShowTipModal(true)
  }

  const sendCreatorTip = () => {
    if (!tipAmount || !onSendTip || !videoAuthor) return

    const amount = parseFloat(tipAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid tip amount')
      return
    }

    onSendTip(videoAuthor.username, amount)
    setTipAmount('')
    setShowTipModal(false)
    toast.success(`Tip of $${amount} sent to @${videoAuthor.username}! 🎉`)
  }

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      case 'newest':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  return (
    <div className="w-80 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-l border-gray-700/50 flex flex-col sparkle-container">
      {/* Animated sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Comments header */}
      <div className="p-6 border-b border-gray-700/50 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-[#00F2EA]" />
            <span className="prismatic-text">Comments</span>
            <Badge className="ml-2 bg-gradient-to-r from-[#FF0050] to-[#e6004a] text-white text-xs">
              {comments.length}
            </Badge>
          </h3>
          
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
          </div>
        </div>
        
        {/* Sort options */}
        <div className="flex space-x-2">
          {(['newest', 'popular', 'oldest'] as const).map((sort) => (
            <Button
              key={sort}
              variant="ghost"
              size="sm"
              onClick={() => setSortBy(sort)}
              className={`text-xs rounded-full px-3 py-1 transition-all ${
                sortBy === sort 
                  ? 'glitter-rainbow text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No comments yet</p>
            <p className="text-gray-500 text-xs">Be the first to share your thoughts!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              onLike={onLikeComment}
              onReply={onReplyComment}
              onSendTip={onSendTip}
            />
          ))
        )}
      </div>

      {/* Enhanced Comment input */}
      <div className="p-6 border-t border-gray-700/50 space-y-4 relative z-10">
        {/* Creator tip section */}
        {videoAuthor && (
          <div className="comment-glass rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-8 h-8 rainbow-border">
                <AvatarImage src={videoAuthor.avatar} />
                <AvatarFallback>{videoAuthor.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Support <span className="prismatic-text">@{videoAuthor.username}</span>
                </p>
                <p className="text-gray-400 text-xs">Show love with a tip!</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleSendCreatorTip}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-sm font-medium"
              >
                <Gift className="w-4 h-4 mr-2" />
                Send Tip
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium">
                <Crown className="w-4 h-4 mr-2" />
                Super Thanks
              </Button>
            </div>
          </div>
        )}
        
        {/* Comment input */}
        <div className="flex space-x-3">
          {user && (
            <Avatar className="w-10 h-10 flex-shrink-0 rainbow-border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 space-y-3">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Add a thoughtful comment..." : "Log in to join the conversation"}
                disabled={!user}
                className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-[#00F2EA]/50"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button 
                size="sm" 
                onClick={handleAddComment}
                disabled={!user || !newComment.trim()}
                className="bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-2xl px-6 disabled:opacity-50 font-semibold"
              >
                Post
              </Button>
            </div>
            
            {/* Quick reactions */}
            {user && (
              <div className="flex space-x-2">
                {['🔥', '💯', '😍', '🤩', '👏'].map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewComment(prev => prev + emoji)}
                    className="w-8 h-8 p-0 text-lg hover:bg-white/10 rounded-full hover:scale-110 transition-all"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {!user && (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Join the conversation!</p>
            <Button className="bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-2xl px-6 font-semibold">
              Log in to comment
            </Button>
          </div>
        )}
      </div>

      {/* Creator Tip Modal */}
      {showTipModal && videoAuthor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-green-500" />
              Send Tip to @{videoAuthor.username}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Support the creator with a tip!
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
                  onClick={sendCreatorTip}
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