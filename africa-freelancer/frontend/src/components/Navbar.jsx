// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { notificationsAPI } from '../api/client'
import { Bell, MessageSquare, LogOut, User, PlusCircle, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: unreadNotifs } = useQuery({
    queryKey: ['notif-unread'],
    queryFn: () => notificationsAPI.unread().then(r => r.data.count),
    enabled: !!user,
    refetchInterval: 30000,  // Rafraîchir toutes les 30 secondes
  })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-dot" />
          Africa Freelancer
        </Link>

        {/* Navigation */}
        <div className="navbar-links">
          <Link to="/projects" className={isActive('/projects')}>
            <span>Projets</span>
          </Link>
          <Link to="/freelances" className={isActive('/freelances')}>
            <span>Freelances</span>
          </Link>

          {user ? (
            <>
              {user.role === 'CLIENT' && (
                <Link to="/create-project" className="btn btn-orange btn-sm">
                  <PlusCircle size={16} /> Publier un projet
                </Link>
              )}
              <Link to="/messages" className={isActive('/messages')} style={{ position: 'relative' }}>
                <MessageSquare size={18} />
              </Link>
              <Link to="/dashboard" className={isActive('/dashboard')} style={{ position: 'relative' }}>
                <Bell size={18} />
                {unreadNotifs > 0 && <span className="notif-badge">{unreadNotifs}</span>}
              </Link>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/register" className="btn btn-orange btn-sm">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
