// src/pages/Projects.jsx
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectsAPI } from '../api/client'
import { Search, Briefcase, Clock, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { id: '', label: 'Tous' },
  { id: 'DEV_WEB', label: '💻 Dev Web' },
  { id: 'DEV_MOBILE', label: '📱 Mobile' },
  { id: 'DESIGN', label: '🎨 Design' },
  { id: 'MARKETING', label: '📣 Marketing' },
  { id: 'REDACTION', label: '✍️ Rédaction' },
  { id: 'VIDEO', label: '🎬 Vidéo' },
  { id: 'DATA', label: '📊 Data & IA' },
]

export default function Projects() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minBudget, setMinBudget] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['projects', category, search, minBudget],
    queryFn: () => projectsAPI.list({
      status: 'OPEN',
      category: category || undefined,
      min_budget: minBudget || undefined,
    }).then(r => r.data.results || r.data),
  })

  // Filtrage côté client pour la recherche textuelle
  const filtered = (data || []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Projets disponibles</h1>
        <p className="section-sub">Trouvez votre prochain projet parmi {data?.length || 0} opportunités</p>

        {/* Barre de recherche */}
        <div className="search-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
            <input
              className="search-input"
              style={{ paddingLeft: 44 }}
              placeholder="Rechercher un projet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <input
            className="search-input"
            type="number"
            placeholder="Budget min (XOF)"
            style={{ width: 180 }}
            value={minBudget}
            onChange={e => setMinBudget(e.target.value)}
          />
        </div>

        {/* Filtres catégorie */}
        <div className="filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Liste des projets */}
        {isLoading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <p style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>Aucun projet trouvé</p>
            <p>Essayez d'autres filtres ou revenez plus tard.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  const daysAgo = Math.floor((Date.now() - new Date(project.created_at)) / 86400000)
  return (
    <Link to={`/projects/${project.id}`} className="card" style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="badge badge-green">{project.category?.replace('_', ' ')}</span>
        <span style={{ fontSize: 13, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={13} /> {daysAgo === 0 ? "Aujourd'hui" : `Il y a ${daysAgo}j`}
        </span>
      </div>
      <h3 style={{ fontSize: 17, marginBottom: 8 }}>{project.title}</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>
      {project.skills_needed?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {project.skills_needed.slice(0, 4).map(s => <span key={s} className="badge badge-gray">{s}</span>)}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 18 }}>
          {Number(project.budget).toLocaleString()} XOF
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
          Voir <ChevronRight size={16} />
        </div>
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-dark)', display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-soft)' }}>
        <span>📋 {project.proposals_count} offre(s)</span>
        <span>📊 {project.level}</span>
        {project.deadline && <span>⏰ {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>}
      </div>
    </Link>
  )
}
