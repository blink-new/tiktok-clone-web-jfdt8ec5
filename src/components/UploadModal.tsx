import { useState, useRef } from 'react'
import { X, Upload, Image, Globe, Lock, Hash, Music, Camera, Play } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { toast } from 'sonner'
import { blink } from '../blink/client'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onVideoUploaded: (video: any) => void
}

export default function UploadModal({ isOpen, onClose, user, onVideoUploaded }: UploadModalProps) {
  const [step, setStep] = useState(1) // 1: Upload, 2: Details, 3: Thumbnail
  const [isLoading, setIsLoading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [thumbnailOptions, setThumbnailOptions] = useState<string[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('')
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null)
  const [customThumbnailPreview, setCustomThumbnailPreview] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtags: '',
    musicTitle: '',
    musicArtist: '',
    isPublic: true
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast.error('Video file must be less than 100MB')
      return
    }

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
    
    setStep(2)
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for images
      toast.error('Image file must be less than 10MB')
      return
    }

    setCustomThumbnail(file)
    const url = URL.createObjectURL(file)
    setCustomThumbnailPreview(url)
    setSelectedThumbnail(url) // Auto-select the custom thumbnail
  }

  // Generate thumbnail frames from video
  const generateThumbnailsFromVideo = (videoElement: HTMLVideoElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const duration = videoElement.duration
    setVideoDuration(duration)
    
    // Set canvas size to match video aspect ratio
    canvas.width = 300
    canvas.height = 400

    const thumbnails: string[] = []
    const timePoints = [0, duration * 0.25, duration * 0.5, duration * 0.75]

    const generateThumbnail = (time: number) => {
      return new Promise<string>((resolve) => {
        videoElement.currentTime = time
        videoElement.onseeked = () => {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
          const dataURL = canvas.toDataURL('image/jpeg', 0.8)
          resolve(dataURL)
        }
      })
    }

    Promise.all(timePoints.map(generateThumbnail))
      .then((generatedThumbnails) => {
        setThumbnailOptions(generatedThumbnails)
        setSelectedThumbnail(generatedThumbnails[0])
      })
      .catch(() => {
        // Fallback to default thumbnails if generation fails
        const fallbackThumbnails = [
          'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=400&fit=crop',
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=400&fit=crop',
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop'
        ]
        setThumbnailOptions(fallbackThumbnails)
        setSelectedThumbnail(fallbackThumbnails[0])
      })
  }

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      generateThumbnailsFromVideo(videoRef.current)
    }
  }

  const handleUpload = async () => {
    if (!videoFile || !selectedThumbnail) {
      toast.error('Please complete all steps')
      return
    }

    setIsLoading(true)
    try {
      // Upload video file to Blink storage
      const { publicUrl: videoUrl } = await blink.storage.upload(
        videoFile,
        `videos/${user.id}/${Date.now()}_${videoFile.name}`,
        { upsert: true }
      )

      // Upload thumbnail
      let thumbnailUrl = selectedThumbnail
      
      if (customThumbnail && selectedThumbnail === customThumbnailPreview) {
        // Upload custom thumbnail file
        const { publicUrl } = await blink.storage.upload(
          customThumbnail,
          `thumbnails/${user.id}/${Date.now()}_${customThumbnail.name}`,
          { upsert: true }
        )
        thumbnailUrl = publicUrl
      } else if (selectedThumbnail.startsWith('data:')) {
        // Convert data URL to blob (generated from video)
        const response = await fetch(selectedThumbnail)
        const blob = await response.blob()
        
        const { publicUrl } = await blink.storage.upload(
          new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }),
          `thumbnails/${user.id}/${Date.now()}_thumbnail.jpg`,
          { upsert: true }
        )
        thumbnailUrl = publicUrl
      }

      const newVideo = {
        id: 'video_' + Date.now(),
        userId: user.id,
        title: formData.title || 'Untitled Video',
        description: formData.description,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        duration: Math.round(videoDuration),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        viewsCount: 0,
        hashtags: formData.hashtags,
        musicTitle: formData.musicTitle || 'Original Sound',
        musicArtist: formData.musicArtist || user.username,
        isPublic: formData.isPublic,
        author: {
          username: user.username,
          avatar: user.avatar,
          verified: user.verified || false
        },
        stats: {
          likes: 0,
          comments: 0,
          shares: 0
        },
        music: {
          title: formData.musicTitle || 'Original Sound',
          artist: formData.musicArtist || user.username
        },
        createdAt: new Date().toISOString()
      }

      // Save to localStorage
      const userVideos = JSON.parse(localStorage.getItem('user_videos') || '[]')
      userVideos.unshift(newVideo)
      localStorage.setItem('user_videos', JSON.stringify(userVideos))

      // Add to global videos list
      const allVideos = JSON.parse(localStorage.getItem('all_videos') || '[]')
      allVideos.unshift(newVideo)
      localStorage.setItem('all_videos', JSON.stringify(allVideos))

      onVideoUploaded(newVideo)
      onClose()
      resetForm()
      toast.success('Video uploaded successfully! 🎉 Redirecting to your video...')
      
      // Small delay to show success message before redirect
      setTimeout(() => {
        // The parent component will handle navigation to the uploaded video
      }, 1000)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setVideoFile(null)
    setVideoPreview('')
    setThumbnailOptions([])
    setSelectedThumbnail('')
    setCustomThumbnail(null)
    setCustomThumbnailPreview('')
    setVideoDuration(0)
    setFormData({
      title: '',
      description: '',
      hashtags: '',
      musicTitle: '',
      musicArtist: '',
      isPublic: true
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-[#FF0050] to-[#00F2EA] bg-clip-text text-transparent">
              Upload Video 📹
            </DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-[#FF0050] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select video to upload</h3>
                <p className="text-gray-400 mb-4">Or drag and drop a file</p>
                <Button className="bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-xl">
                  <Camera className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <div className="text-center text-sm text-gray-400">
                <p>MP4, WebM, or MOV files up to 100MB</p>
                <p>Recommended: 9:16 aspect ratio for best results</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-32 bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onLoadedMetadata={handleVideoLoaded}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white font-medium">Title</Label>
                    <Input
                      id="title"
                      placeholder="Add a catchy title..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell viewers about your video..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hashtags" className="text-white font-medium flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    Hashtags
                  </Label>
                  <Input
                    id="hashtags"
                    placeholder="#dance #viral #fyp"
                    value={formData.hashtags}
                    onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                    className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                  />
                </div>
                
                <div>
                  <Label htmlFor="music" className="text-white font-medium flex items-center">
                    <Music className="w-4 h-4 mr-1" />
                    Music
                  </Label>
                  <Input
                    id="music"
                    placeholder="Song title"
                    value={formData.musicTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, musicTitle: e.target.value }))}
                    className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  {formData.isPublic ? (
                    <Globe className="w-5 h-5 text-[#00F2EA]" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">
                      {formData.isPublic ? 'Public' : 'Private'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formData.isPublic ? 'Everyone can see this video' : 'Only you can see this video'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-gray-600 text-white hover:bg-gray-800 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-[#FF0050] to-[#e6004a] hover:from-[#e6004a] to-[#cc003d] text-white rounded-xl"
                >
                  Next: Choose Thumbnail
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Choose a thumbnail
                </h3>
                
                {/* Custom thumbnail upload option */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full border-gray-600 text-white hover:bg-gray-800 rounded-xl border-dashed"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Custom Thumbnail
                  </Button>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    JPG, PNG, or GIF up to 10MB
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Custom thumbnail option */}
                  {customThumbnailPreview && (
                    <div
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedThumbnail === customThumbnailPreview
                          ? 'border-[#FF0050] ring-2 ring-[#FF0050]/50'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedThumbnail(customThumbnailPreview)}
                    >
                      <img
                        src={customThumbnailPreview}
                        alt="Custom thumbnail"
                        className="w-full h-32 object-cover"
                      />
                      {selectedThumbnail === customThumbnailPreview && (
                        <div className="absolute inset-0 bg-[#FF0050]/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#FF0050] rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-1 left-1 bg-[#00F2EA] text-black text-xs px-2 py-1 rounded font-medium">
                        Custom
                      </div>
                    </div>
                  )}
                  
                  {/* Auto-generated thumbnails */}
                  {thumbnailOptions.map((thumbnail, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedThumbnail === thumbnail
                          ? 'border-[#FF0050] ring-2 ring-[#FF0050]/50'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedThumbnail(thumbnail)}
                    >
                      <img
                        src={thumbnail}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {selectedThumbnail === thumbnail && (
                        <div className="absolute inset-0 bg-[#FF0050]/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#FF0050] rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {index === 0 ? '0s' : `${Math.round((videoDuration * (index / 3)))}s`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-gray-600 text-white hover:bg-gray-800 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#00F2EA] to-[#00d4c7] hover:from-[#00d4c7] to-[#00b8ad] text-black rounded-xl font-semibold"
                >
                  {isLoading ? 'Uploading...' : 'Upload Video 🚀'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
}