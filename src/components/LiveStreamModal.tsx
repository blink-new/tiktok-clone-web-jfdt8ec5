import { useState, useRef, useEffect } from 'react'
import { X, Video, Users, Heart, MessageCircle, Send, Settings, Mic, MicOff, VideoOff, DollarSign, Gift } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { toast } from 'sonner'

interface LiveStreamModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

interface LiveMessage {
  id: string
  username: string
  avatar: string
  message: string
  timestamp: number
  isSuper?: boolean
  tipAmount?: number
}

export default function LiveStreamModal({ isOpen, onClose, user }: LiveStreamModalProps) {
  const [isLive, setIsLive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [streamTitle, setStreamTitle] = useState('')
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [totalTips, setTotalTips] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Simulate live chat messages
  useEffect(() => {
    if (!isLive) return

    const messageTemplates = [
      "Amazing stream! 🔥",
      "Love your content!",
      "First time here, loving it!",
      "Can you do a dance?",
      "Greetings from Brazil! 🇧🇷",
      "You're so talented!",
      "This is so cool!",
      "More content like this please!",
      "Following you now!",
      "Best streamer ever! ⭐"
    ]

    const usernames = [
      "StreamFan123", "DanceLover", "MusicVibes", "CoolViewer", "TikTokFan",
      "VideoLover", "ContentKing", "StreamQueen", "ViralVibes", "TrendSetter"
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of new message
        const randomMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]
        const randomUsername = usernames[Math.floor(Math.random() * usernames.length)]
        
        // 15% chance of tip message
        const isTip = Math.random() > 0.85
        const tipAmount = isTip ? [1, 2, 5, 10, 20][Math.floor(Math.random() * 5)] : undefined
        
        const newMsg: LiveMessage = {
          id: Date.now().toString(),
          username: randomUsername,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=40&h=40&fit=crop&crop=face`,
          message: isTip ? `Sent $${tipAmount} tip! ${randomMessage}` : randomMessage,
          timestamp: Date.now(),
          isSuper: Math.random() > 0.9, // 10% chance of super chat
          tipAmount
        }

        if (tipAmount) {
          setTotalTips(prev => prev + tipAmount)
        }

        setMessages(prev => [...prev.slice(-20), newMsg]) // Keep last 20 messages
      }

      // Simulate viewer count changes
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5
        return Math.max(1, prev + change)
      })

      // Simulate likes
      if (Math.random() > 0.7) {
        setLikeCount(prev => prev + Math.floor(Math.random() * 3) + 1)
      }
    }, 2000 + Math.random() * 3000) // Random interval between 2-5 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const startStream = async () => {
    if (!streamTitle.trim()) {
      toast.error('Please enter a stream title')
      return
    }

    setIsStarting(true)
    try {
      // Debug: Log browser and device info
      console.log('Starting stream with browser:', navigator.userAgent)
      console.log('MediaDevices supported:', !!navigator.mediaDevices)
      console.log('getUserMedia supported:', !!navigator.mediaDevices?.getUserMedia)
      
      // Check if devices are available first
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasCamera = devices.some(device => device.kind === 'videoinput')
      const hasMicrophone = devices.some(device => device.kind === 'audioinput')
      
      console.log('Available devices:', {
        total: devices.length,
        cameras: devices.filter(d => d.kind === 'videoinput').length,
        microphones: devices.filter(d => d.kind === 'audioinput').length,
        hasCamera,
        hasMicrophone
      })

      if (!hasCamera && !hasMicrophone) {
        throw new Error('No camera or microphone found')
      }

      // Check permissions first
      if (navigator.permissions) {
        try {
          const cameraPermission = hasCamera ? await navigator.permissions.query({ name: 'camera' as PermissionName }) : null
          const micPermission = hasMicrophone ? await navigator.permissions.query({ name: 'microphone' as PermissionName }) : null
          
          console.log('Permissions status:', {
            camera: cameraPermission?.state,
            microphone: micPermission?.state
          })
          
          if (cameraPermission?.state === 'denied' || micPermission?.state === 'denied') {
            throw new Error('Camera or microphone access denied. Please check your browser permissions.')
          }
        } catch (permError) {
          console.warn('Permission check failed:', permError)
        }
      }

      // Request camera and microphone access with compatible constraints
      const constraints: MediaStreamConstraints = {
        video: hasCamera ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        } : false,
        audio: hasMicrophone ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (constraintError) {
        console.warn('Enhanced constraints failed, trying basic constraints:', constraintError)
        // Fallback to basic constraints
        const basicConstraints: MediaStreamConstraints = {
          video: hasCamera ? true : false,
          audio: hasMicrophone ? true : false
        }
        stream = await navigator.mediaDevices.getUserMedia(basicConstraints)
      }
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true // Prevent feedback
        videoRef.current.playsInline = true
        videoRef.current.autoplay = true
        
        // Force video to play immediately
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.warn('Video autoplay failed, user interaction may be required:', playError)
          // Try to play again after a short delay
          setTimeout(async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play()
              }
            } catch (retryError) {
              console.error('Video play retry failed:', retryError)
            }
          }, 100)
        }
      }

      // Update track states based on what we actually got
      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]
      
      setIsCameraOn(!!videoTrack && videoTrack.enabled)
      setIsMicOn(!!audioTrack && audioTrack.enabled)

      setIsLive(true)
      setViewerCount(Math.floor(Math.random() * 50) + 10) // Start with 10-60 viewers
      toast.success('🔴 You are now live!')
      
      // Log successful stream start
      console.log('Stream started successfully:', {
        video: !!videoTrack,
        audio: !!audioTrack,
        videoSettings: videoTrack?.getSettings(),
        audioSettings: audioTrack?.getSettings()
      })
      
    } catch (error) {
      console.error('Failed to start stream:', error)
      let errorMessage = 'Failed to access camera/microphone'
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera/microphone access denied. Please allow permissions in your browser settings and try again.'
            break
          case 'NotFoundError':
            errorMessage = 'No camera or microphone found. Please check your devices are connected and working.'
            break
          case 'NotReadableError':
            errorMessage = 'Camera/microphone is already in use by another application. Please close other apps and try again.'
            break
          case 'OverconstrainedError':
            errorMessage = 'Camera/microphone constraints not supported. Please try with different settings.'
            break
          case 'SecurityError':
            errorMessage = 'Access denied due to security restrictions. Please use HTTPS or localhost.'
            break
          case 'AbortError':
            errorMessage = 'Stream request was aborted. Please try again.'
            break
          default:
            errorMessage = error.message || 'Unknown error occurred while accessing camera/microphone'
        }
      }
      
      toast.error(errorMessage)
      
      // Provide helpful instructions
      setTimeout(() => {
        toast.info('💡 Tip: Make sure to allow camera/microphone permissions when prompted by your browser')
      }, 2000)
      
    } finally {
      setIsStarting(false)
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log(`Stopped ${track.kind} track`)
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsLive(false)
    setViewerCount(0)
    setLikeCount(0)
    setMessages([])
    setTotalTips(0)
    toast.success('Stream ended')
  }

  const toggleMic = async () => {
    if (!streamRef.current) {
      toast.error('No active stream found')
      return
    }

    const audioTrack = streamRef.current.getAudioTracks()[0]
    if (!audioTrack) {
      // Try to get microphone access if not available
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        const newAudioTrack = audioStream.getAudioTracks()[0]
        
        if (streamRef.current && newAudioTrack) {
          streamRef.current.addTrack(newAudioTrack)
          
          // Create new stream with all tracks
          const allTracks = streamRef.current.getTracks()
          const newStream = new MediaStream(allTracks)
          if (videoRef.current) {
            videoRef.current.srcObject = newStream
          }
          streamRef.current = newStream
          
          setIsMicOn(true)
          toast.success('Microphone enabled')
        }
      } catch (error) {
        toast.error('Failed to access microphone')
        console.error('Microphone access error:', error)
      }
      return
    }

    // Toggle existing track
    audioTrack.enabled = !isMicOn
    setIsMicOn(!isMicOn)
    toast.success(isMicOn ? '🔇 Microphone muted' : '🎤 Microphone unmuted')
    
    // Log track state
    console.log('Audio track toggled:', {
      enabled: audioTrack.enabled,
      readyState: audioTrack.readyState,
      settings: audioTrack.getSettings()
    })
  }

  const toggleCamera = async () => {
    if (!streamRef.current) {
      toast.error('No active stream found')
      return
    }

    const videoTrack = streamRef.current.getVideoTracks()[0]
    if (!videoTrack) {
      // Try to get camera access if not available
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: 'user'
          } 
        })
        const newVideoTrack = videoStream.getVideoTracks()[0]
        
        if (streamRef.current && newVideoTrack && videoRef.current) {
          streamRef.current.addTrack(newVideoTrack)
          
          // Create new stream with all tracks
          const allTracks = streamRef.current.getTracks()
          const newStream = new MediaStream(allTracks)
          videoRef.current.srcObject = newStream
          streamRef.current = newStream
          
          // Ensure video plays
          try {
            await videoRef.current.play()
          } catch (playError) {
            console.warn('Video play failed after camera toggle:', playError)
          }
          
          setIsCameraOn(true)
          toast.success('Camera enabled')
        }
      } catch (error) {
        toast.error('Failed to access camera')
        console.error('Camera access error:', error)
      }
      return
    }

    // Toggle existing track
    videoTrack.enabled = !isCameraOn
    setIsCameraOn(!isCameraOn)
    toast.success(isCameraOn ? '📹 Camera turned off' : '📷 Camera turned on')
    
    // Log track state
    console.log('Video track toggled:', {
      enabled: videoTrack.enabled,
      readyState: videoTrack.readyState,
      settings: videoTrack.getSettings()
    })
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: LiveMessage = {
      id: Date.now().toString(),
      username: user.username || user.displayName || 'You',
      avatar: user.avatar || '',
      message: newMessage,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev.slice(-20), message])
    setNewMessage('')
  }

  const sendTip = () => {
    if (!tipAmount || !user || !isLive) return

    const amount = parseFloat(tipAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid tip amount')
      return
    }

    const tipMessage: LiveMessage = {
      id: Date.now().toString(),
      username: user.username || user.displayName || 'You',
      avatar: user.avatar || '',
      message: `Sent $${amount} tip! Thanks for the amazing content! 💝`,
      timestamp: Date.now(),
      tipAmount: amount,
      isSuper: true
    }

    setMessages(prev => [...prev.slice(-20), tipMessage])
    setTotalTips(prev => prev + amount)
    setTipAmount('')
    setShowTipModal(false)
    toast.success(`Tip of $${amount} sent! 🎉`)
  }

  const handleClose = () => {
    if (isLive) {
      stopStream()
    }
    onClose()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-[#FF0050] to-[#00F2EA] bg-clip-text text-transparent flex items-center justify-center">
            <Video className="w-6 h-6 mr-2 text-[#FF0050]" />
            Live Stream
            {isLive && <Badge className="ml-2 bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[75vh] space-x-4">
          {/* Video Preview */}
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative">
            {!isLive ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-white" />
                </div>
                
                <div className="text-center space-y-4 max-w-md">
                  <h3 className="text-xl font-semibold">Ready to go live?</h3>
                  <p className="text-gray-400">
                    Connect with your audience in real-time! Share your thoughts, showcase your talents, or just chat with your followers.
                  </p>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter your stream title..."
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                      maxLength={100}
                    />
                    
                    <Button
                      onClick={startStream}
                      disabled={isStarting || !streamTitle.trim()}
                      className="w-full bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-xl py-3 font-semibold"
                    >
                      {isStarting ? 'Starting...' : '🔴 Go Live'}
                    </Button>
                    
                    <Button
                      onClick={async () => {
                        try {
                          const devices = await navigator.mediaDevices.enumerateDevices()
                          console.log('Device test:', devices)
                          
                          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                          console.log('Stream test successful:', stream.getTracks())
                          
                          // Stop test stream
                          stream.getTracks().forEach(track => track.stop())
                          toast.success('Camera and microphone test successful!')
                        } catch (error) {
                          console.error('Device test failed:', error)
                          toast.error('Device test failed: ' + (error as Error).message)
                        }
                      }}
                      variant="outline"
                      className="w-full border-gray-600 text-white hover:bg-gray-700 rounded-xl py-2 text-sm"
                    >
                      🔧 Test Camera & Mic
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Stream overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2">
                    <h3 className="font-semibold text-lg">{streamTitle}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{viewerCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{likeCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>${totalTips}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge className="bg-red-500 text-white animate-pulse">
                    🔴 LIVE
                  </Badge>
                </div>

                {/* Stream controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-full p-0 ${
                      isMicOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
                    } hover:bg-opacity-80`}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCamera}
                    className={`w-12 h-12 rounded-full p-0 ${
                      isCameraOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
                    } hover:bg-opacity-80`}
                  >
                    {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    onClick={stopStream}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6"
                  >
                    End Stream
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Live Chat */}
          <div className="w-80 bg-gray-800 rounded-xl flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-[#00F2EA]" />
                Live Chat
                {isLive && (
                  <Badge className="ml-2 bg-[#00F2EA] text-black text-xs">
                    {messages.length}
                  </Badge>
                )}
              </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!isLive ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chat will appear when you go live</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No messages yet...</p>
                  <p className="text-sm">Be the first to say hello!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex space-x-2 ${
                    message.isSuper || message.tipAmount ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-2 rounded-lg border border-yellow-500/30' : ''
                  }`}>
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback className="text-xs">{message.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-medium ${
                          message.isSuper || message.tipAmount ? 'text-yellow-400' : 'text-white'
                        }`}>
                          {message.username}
                        </span>
                        {message.isSuper && <span className="text-yellow-400">💎</span>}
                        {message.tipAmount && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            ${message.tipAmount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 break-words">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input with tip button */}
            <div className="p-4 border-t border-gray-700 space-y-3">
              {/* Tip section */}
              {isLive && user && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowTipModal(true)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-sm"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Send Tip
                  </Button>
                  {totalTips > 0 && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-2 text-green-400 text-sm font-medium">
                      ${totalTips} earned
                    </div>
                  )}
                </div>
              )}
              
              {/* Message input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isLive ? "Say something..." : "Go live to chat"}
                  disabled={!isLive}
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  maxLength={200}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!isLive || !newMessage.trim()}
                  size="sm"
                  className="bg-[#00F2EA] hover:bg-[#00d4c7] text-black rounded-xl px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Modal */}
        {showTipModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-96 border border-gray-700">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-green-500" />
                Send a Tip
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Show your support to the streamer with a tip!
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
      </DialogContent>
    </Dialog>
  )
}