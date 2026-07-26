import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../contexts/ThemeProvider"
import { Sun, Moon, Bell, Check, User, Settings, Palette, Activity, LogOut, Trash2 } from "lucide-react"

export function Navbar() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Model drift detected', desc: 'Prediction variance exceeded 5% on Grade B.', time: '2 hours ago', read: false },
    { id: 2, title: 'Optimization Complete', desc: 'New pareto setpoints generated.', time: '4 hours ago', read: false },
    { id: 3, title: 'System Update', desc: 'M7 Knowledge Base synchronized.', time: '6 hours ago', read: true }
  ])
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(notifications.map(n => ({...n, read: true})))
  const clearNotifications = () => setNotifications([])

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="sticky top-0 z-50 flex h-16 flex-shrink-0 bg-card border-b border-border shadow-sm">
      <div className="flex flex-1 items-center justify-between px-6">
        <div className="flex flex-1 items-center gap-2">
        </div>
        <div className="ml-4 flex items-center space-x-2">
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors relative ${showNotifications ? 'bg-muted text-foreground' : 'hover:bg-muted'}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card animate-pulse"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-card shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                  <span className="font-semibold text-sm">Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                  <div className="flex gap-2">
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1" title="Mark all as read">
                      <Check className="h-3 w-3" />
                    </button>
                    <button onClick={clearNotifications} className="text-xs text-destructive hover:underline flex items-center gap-1" title="Clear all">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 border-b border-border hover:bg-muted/50 cursor-pointer ${n.read ? 'opacity-60' : 'bg-primary/5'}`}>
                        <div className="flex justify-between">
                          <p className={`text-sm font-medium ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1"></span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center border-t border-border bg-muted/30 hover:bg-muted cursor-pointer transition-colors" onClick={() => navigate('/timeline')}>
                  <span className="text-xs font-medium text-primary">View All History</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative ml-2" ref={profileRef}>
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <span className="text-xs font-bold">OP</span>
              </div>
            </button>
            
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold">Operator Portal</p>
                  <p className="text-xs text-muted-foreground truncate">operator@gci.local</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowProfile(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Operator Profile
                  </button>
                  <button onClick={() => { setShowProfile(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Preferences
                  </button>
                  <button onClick={() => { setShowProfile(false); navigate('/timeline'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" /> Activity Log
                  </button>
                  <button onClick={() => { setShowProfile(false); setTheme(theme === 'dark' ? 'light' : 'dark'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" /> Toggle Theme
                  </button>
                </div>
                <div className="py-1 border-t border-border">
                  <button onClick={() => { setShowProfile(false); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
