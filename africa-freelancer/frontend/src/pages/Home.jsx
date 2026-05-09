// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectsAPI, profileAPI } from '../api/client'
import { ArrowRight, Shield, Smartphone, Star } from 'lucide-react'

const CATEGORIES = [
  { id: 'DEV_WEB', label: 'Dev Web', emoji: '💻' },
  { id: 'DESIGN', label: 'Design', emoji: '🎨' },
  { id: 'MARKETING', label: 'Marketing', emoji: '📱' },
  { id: 'REDACTION', label: 'Rédaction', emoji: '✍️' },
  { id: 'VIDEO', label: 'Vidéo', emoji: '🎬' },
  { id: 'DATA', label: 'Data & IA', emoji: '📊' },
]

export default function Home() {
  const { data: projects } = useQuery({
    queryKey: ['projects-home'],
    queryFn: () => projectsAPI.list({ status: 'OPEN' }).then(r => r.data.results || r.data),
  })

  const { data: freelances } = useQuery({
    queryKey: ['freelances-home'],
    queryFn: () => profileAPI.listFreelances({ available: true }).then(r => r.data),
  })

  return (
    <div>
      {/* ── HERO ────────────────────────────── */}
      <section className="hero">
        <div className="hero-title">
          La plateforme freelance<br />
          <span style={{ color: '#f5d76e' }}>made in Africa 🌍</span>
        </div>
        <p className="hero-sub">
          Connectez-vous avec les meilleurs talents africains.<br />
          Paiements via Mobile Money, Orange Money, M-Pesa et plus.
        </p>
        <div className="hero-actions">
          <Link to="/projects" className="btn btn-orange btn-lg">
            Trouver un projet <ArrowRight size={20} />
          </Link>
          <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
            Devenir freelance
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-value">{freelances?.length || '500'}+</div>
            <div className="hero-stat-label">Freelances actifs</div>
          </div>
          <div>
            <div className="hero-stat-value">{projects?.length || '1K'}+</div>
            <div className="hero-stat-label">Projets publiés</div>
          </div>
          <div>
            <div className="hero-stat-value">40+</div>
            <div className="hero-stat-label">Pays d'Afrique</div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────── */}
      <section style={{ background: 'white', padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Explorer par catégorie</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Trouvez le talent qu'il vous faut</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginTop: 32 }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/projects?category=${cat.id}`}
                className="card"
                style={{ textAlign: 'center', padding: '24px 16px', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJETS RÉCENTS ───────────────────── */}
      {projects?.length > 0 && (
        <section className="page">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="section-title">Projets récents</h2>
              <Link to="/projects" className="btn btn-outline btn-sm">Voir tout <ArrowRight size={14} /></Link>
            </div>
            <div className="projects-grid">
              {projects.slice(0, 6).map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── POURQUOI AFRICA FREELANCER ───────── */}
      <section style={{ background: 'white', padding: '80px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>Pourquoi Africa Freelancer ?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {[
              { icon: <Smartphone size={32} color="var(--green)" />, title: 'Paiements Mobile Money', desc: 'Orange Money, M-Pesa, Airtel Money. Recevez votre argent où vous êtes.' },
              { icon: <Shield size={32} color="var(--green)" />, title: 'Paiement sécurisé (Escrow)', desc: 'Les fonds sont bloqués et libérés seulement après validation de votre travail.' },
              { icon: <Star size={32} color="var(--green)" />, title: 'Talents africains', desc: 'Des professionnels certifiés dans toute l\'Afrique, pour tous les budgets.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ marginBottom: 10, fontSize: 18 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: 15 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectCard({ project }) {
  const STATUS_LABELS = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', COMPLETED: 'Terminé' }
  return (
    <Link to={`/projects/${project.id}`} className="card" style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span className="badge badge-green">{project.category}</span>
        <span className="badge badge-gray">{STATUS_LABELS[project.status] || project.status}</span>
      </div>
      <h3 style={{ fontSize: 17, marginBottom: 8, lineHeight: 1.3 }}>{project.title}</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 18 }}>{Number(project.budget).toLocaleString()} XOF</span>
        <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{project.proposals_count} offre(s)</span>
      </div>
      {project.skills_needed?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {project.skills_needed.slice(0, 3).map(s => (
            <span key={s} className="badge badge-gray">{s}</span>
          ))}
        </div>
      )}
    </Link>
  )
}
