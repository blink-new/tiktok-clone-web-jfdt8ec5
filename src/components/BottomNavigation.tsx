import { Home, Search, Plus, MessageCircle, User } from 'lucide-react'
import { Button } from './ui/button'

interface BottomNavigationProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}

export default function BottomNavigation({ currentPage, setCurrentPage }: BottomNavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Search, label: 'Discover' },
    { id: 'upload', icon: Plus, label: 'Upload', special: true },
    { id: 'inbox', icon: MessageCircle, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-800">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          if (item.special) {
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center space-y-1 p-2 min-w-0"
                onClick={() => setCurrentPage(item.id)}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#FF0050] to-[#00F2EA] rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-white font-medium">{item.label}</span>
              </Button>
            )
          }

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1 p-2 min-w-0"
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`} 
              />
              <span 
                className={`text-xs font-medium ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}