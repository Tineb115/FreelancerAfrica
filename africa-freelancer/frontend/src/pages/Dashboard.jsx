// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsAPI, proposalsAPI, notificationsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Bell, Briefcase, Send, CheckCheck } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isFreelance = user?.role === 'FREELANCE'

  const { data: projects = [] } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsAPI.mine().then(r => r.data),
  })

  const { data: proposals = [] } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => proposalsAPI.mine().then(r => r.data),
    enabled: isFreelance,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list().then(r => r.data.results || r.data),
    refetchInterval: 20000,
  })

  const markAllRead = useMutation({
    mutationFn: notificationsAPI.markAllRead,
    onSuccess: () => { toast.success('Notifications lues'); queryClient.invalidateQueries(['notifications']) },
  })

  const unread = notifications.filter(n => !n.is_read)

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>
              Bonjour {user?.profile?.first_name || user?.email?.split('@')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-soft)' }}>
              {isFreelance ? 'Tableau de bord freelance' : 'Tableau de bord client'}
            </p>
          </div>
          {isFreelance ? (
            <Link to="/projects" className="btn btn-primary">🔍 Chercher des projets</Link>
          ) : (
            <Link to="/create-project" className="btn btn-orange">+ Nouveau projet</Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

          {/* ── Colonne principale ─────────────── */}
          <div>
            {/* Stats rapides */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatCard
                icon={<Briefcase size={24} color="var(--green)" />}
                label={isFreelance ? 'Projets en cours' : 'Projets publiés'}
                value={projects.filter(p => isFreelance ? p.status === 'IN_PROGRESS' : true).length}
                color="var(--green-soft)"
              />
              <StatCard
                icon={<Send size={24} color="var(--orange)" />}
                label={isFreelance ? 'Offres soumises' : 'Offres reçues'}
                value={isFreelance ? proposals.length : projects.reduce((a, p) => a + (p.proposals_count || 0), 0)}
                color="var(--orange-light)"
              />
              <StatCard
                icon={<CheckCheck size={24} color="#22c55e" />}
                label="Projets terminés"
                value={projects.filter(p => p.status === 'COMPLETED').length}
                color="#f0fdf4"
              />
            </div>

            {/* Projets */}
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>
              {isFreelance ? 'Mes projets en cours' : 'Mes projets'}
            </h2>
            {projects.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-soft)' }}>
                <Briefcase size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                {isFreelance
                  ? <><p style={{ fontWeight: 600 }}>Aucun projet en cours</p><Link to="/projects" className="btn btn-primary" style={{ marginTop: 16 }}>Chercher un projet</Link></>
                  : <><p style={{ fontWeight: 600 }}>Aucun projet publié</p><Link to="/create-project" className="btn btn-orange" style={{ marginTop: 16 }}>Publier votre premier projet</Link></>
                }
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {projects.map(p => <ProjectRow key={p.id} project={p} isFreelance={isFreelance} />)}
              </div>
            )}

            {/* Offres (freelance) */}
            {isFreelance && proposals.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 20, marginBottom: 16 }}>Mes offres envoyées</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {proposals.map(p => (
                    <Link key={p.id} to={`/projects/${p.project}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>Projet #{p.project}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{p.delivery_days} jours · {Number(p.price).toLocaleString()} XOF</div>
                      </div>
                      <ProposalStatusBadge status={p.status} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Notifications ───────────────────── */}
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={18} />
                Notifications
                {unread.length > 0 && <span className="notif-badge">{unread.length}</span>}
              </h3>
              {unread.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => markAllRead.mutate()} style={{ fontSize: 12 }}>
                  Tout lire
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-soft)' }}>
                <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>Aucune notification</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 500, overflowY: 'auto' }}>
                {notifications.slice(0, 15).map(n => (
                  <div key={n.id} style={{
                    padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                    background: n.is_read ? 'transparent' : 'var(--green-soft)',
                    borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--green)',
                    transition: 'background 0.2s'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ background: color, border: 'none', boxShadow: 'none' }}>
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function ProjectRow({ project, isFreelance }) {
  const STATUS_COLORS = {
    OPEN: '#22c55e', IN_PROGRESS: '#f59e0b', DELIVERED: '#3b82f6', COMPLETED: '#8b5cf6', CANCELLED: '#6b7280'
  }
  const STATUS_LABELS = {
    OPEN: 'Ouvert', IN_PROGRESS: 'En cours', DELIVERED: 'Livré', COMPLETED: 'Terminé', CANCELLED: 'Annulé'
  }
  return (
    <Link to={`/projects/${project.id}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          {Number(project.budget).toLocaleString()} XOF
          {!isFreelance && ` · ${project.proposals_count || 0} offre(s)`}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[project.status] || '#6b7280' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLORS[project.status] || '#6b7280' }}>
          {STATUS_LABELS[project.status] || project.status}
        </span>
      </div>
    </Link>
  )
}

function ProposalStatusBadge({ status }) {
  const map = { PENDING: ['badge-gray', 'En attente'], ACCEPTED: ['badge-green', 'Acceptée ✓'], REJECTED: ['', 'Refusée'], WITHDRAWN: ['badge-gray', 'Retirée'] }
  const [cls, label] = map[status] || ['badge-gray', status]
  return <span className={`badge ${cls}`}>{label}</span>
}
