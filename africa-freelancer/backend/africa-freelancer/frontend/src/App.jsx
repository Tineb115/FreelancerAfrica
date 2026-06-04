// src/App.jsx
// Routeur principal de l'application

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import Freelances from './pages/Freelances'
import FreelanceProfile from './pages/FreelanceProfile'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import MyProposals from './pages/MyProposals'

// Protège les routes qui nécessitent une connexion
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/projects"       element={<Projects />} />
        <Route path="/projects/:id"   element={<ProjectDetail />} />
        <Route path="/freelances"     element={<Freelances />} />
        <Route path="/freelances/:id" element={<FreelanceProfile />} />
        <Route path="/create-project" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/messages"       element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:id"   element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/proposals"      element={<PrivateRoute><MyProposals /></PrivateRoute>} />
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
