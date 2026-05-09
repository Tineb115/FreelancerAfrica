// src/pages/Freelances.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileAPI } from '../api/client'
import { Search, Star, MapPin } from 'lucide-react'

const COUNTRIES = ['Tous', "Côte d'Ivoire", 'Sénégal', 'Mali', 'Cameroun', 'Nigeria', 'Ghana', 'Kenya', 'Maroc', 'Tunisie']

export default function Freelances() {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [skill, setSkill] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const { data: freelances = [], isLoading } = useQuery({
    queryKey: ['freelances', country, skill, availableOnly],
    queryFn: () => profileAPI.listFreelances({
      country: country || undefined,
      skill: skill || undefined,
      available: availableOnly || undefined,
    }).then(r => r.data),
  })

  const filtered = freelances.filter(f =>
    !search || f.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Trouver un freelance</h1>
        <p className="section-sub">{freelances.length} talents disponibles sur la plateforme</p>

        {/* Recherche */}
        <div className="search-bar" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
            <input className="search-input" style={{ paddingLeft: 44 }} placeholder="Nom ou compétence..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input className="search-input" placeholder="Compétence (ex: React)" style={{ width: 180 }}
            value={skill} onChange={e => setSkill(e.target.value)} />
          <select className="search-input" style={{ width: 180 }} value={country} onChange={e => setCountry(e.target.value === 'Tous' ? '' : e.target.value)}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--green)' }} />
          Disponibles uniquement
        </label>

        {isLoading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <p style={{ fontSize: 18, fontWeight: 600, marginTop: 12 }}>Aucun freelance trouvé</p>
          </div>
        ) : (
          <div className="freelances-grid">
            {filtered.map(f => <FreelanceCard key={f.id} freelance={f} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function FreelanceCard({ freelance }) {
  return (
    <Link to={`/freelances/${freelance.user}`} className="card" style={{ display: 'block', textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
        {freelance.avatar
          ? <img src={freelance.avatar} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-soft)' }} />
          : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto' }}>
              {freelance.first_name?.[0]?.toUpperCase() || '?'}
            </div>
        }
        {freelance.is_available && (
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{freelance.first_name} {freelance.last_name}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
        <MapPin size={13} style={{ color: 'var(--text-soft)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{freelance.country}</span>
      </div>

      {freelance.rating > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
          <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{freelance.rating.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>({freelance.total_reviews})</span>
        </div>
      )}

      {freelance.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
          {freelance.skills.slice(0, 3).map(s => <span key={s} className="badge badge-gray" style={{ fontSize: 11 }}>{s}</span>)}
          {freelance.skills.length > 3 && <span className="badge badge-gray" style={{ fontSize: 11 }}>+{freelance.skills.length - 3}</span>}
        </div>
      )}

      {freelance.hourly_rate && (
        <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>
          {Number(freelance.hourly_rate).toLocaleString()} XOF/h
        </div>
      )}
    </Link>
  )
}
