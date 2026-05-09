// src/pages/MyProposals.jsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { proposalsAPI } from '../api/client'
import { Send, Clock } from 'lucide-react'

const STATUS_MAP = {
  PENDING:   { label: 'En attente', cls: 'badge-gray' },
  ACCEPTED:  { label: '✓ Acceptée', cls: 'badge-green' },
  REJECTED:  { label: '✗ Refusée', cls: 'badge-orange' },
  WITHDRAWN: { label: 'Retirée', cls: 'badge-gray' },
}

export default function MyProposals() {
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => proposalsAPI.mine().then(r => r.data),
  })

  const stats = {
    total: proposals.length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    pending: proposals.filter(p => p.status === 'PENDING').length,
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Mes offres envoyées</h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: 32 }}>Suivez l'état de vos candidatures</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--sand-dark)' },
            { label: 'Acceptées', value: stats.accepted, color: 'var(--green-soft)' },
            { label: 'En attente', value: stats.pending, color: 'var(--orange-light)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ background: s.color, border: 'none', boxShadow: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {isLoading ? <div className="spinner" /> : proposals.length === 0 ? (
          <div className="empty-state">
            <Send size={48} />
            <p style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>Aucune offre envoyée</p>
            <Link to="/projects" className="btn btn-primary" style={{ marginTop: 16 }}>Parcourir les projets</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {proposals.map(p => {
              const s = STATUS_MAP[p.status] || { label: p.status, cls: 'badge-gray' }
              return (
                <Link key={p.id} to={`/projects/${p.project}`} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Projet #{p.project}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-soft)' }}>
                      <span>💰 {Number(p.price).toLocaleString()} XOF</span>
                      <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {p.delivery_days} jours</span>
                      <span>{new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.cover_letter}
                    </p>
                  </div>
                  <span className={`badge ${s.cls}`} style={{ whiteSpace: 'nowrap' }}>{s.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
