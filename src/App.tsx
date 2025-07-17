import { useState, useEffect } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import EnhancedTikTokLayout from './components/EnhancedTikTokLayout'
import { Toaster } from './components/ui/sonner'

const blink = createClient({
  projectId: 'tiktok-clone-web-jfdt8ec5',
  authRequired: false
})

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Check for saved user in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('tiktok_user')
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [user])

  const handleUserUpdate = (newUser: any) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('tiktok_user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('tiktok_user')
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-full animate-spin flex items-center justify-center">
            <div className="w-12 h-12 bg-black rounded-full"></div>
          </div>
          <div className="text-white font-semibold text-lg bg-gradient-to-r from-[#FF0050] to-[#00F2EA] bg-clip-text text-transparent">
            Loading TikTok...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden">
      <EnhancedTikTokLayout user={user} onUserUpdate={handleUserUpdate} />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(17, 24, 39, 0.95)',
            color: 'white',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            backdropFilter: 'blur(12px)'
          }
        }}
      />
    </div>
  )
}

export default App