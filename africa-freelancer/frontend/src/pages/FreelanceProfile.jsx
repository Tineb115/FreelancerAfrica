// src/pages/FreelanceProfile.jsx
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileAPI, reviewsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { MapPin, Star, Clock, MessageSquare, Globe } from 'lucide-react'

export default function FreelanceProfile() {
  const { id } = useParams()
  const { user } = useAuth()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['freelance-profile', id],
    queryFn: () => profileAPI.getFreelance(id).then(r => r.data),
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['freelance-reviews', id],
    queryFn: () => reviewsAPI.forFreelance(id).then(r => r.data),
  })

  if (isLoading) return <div className="spinner" />
  if (!profile) return <div className="page"><div className="container"><p>Profil introuvable.</p></div></div>

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

          {/* ── Infos principales ─────────────── */}
          <div>
            {/* En-tête */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {profile.avatar
                  ? <img src={profile.avatar} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                      {profile.first_name?.[0]?.toUpperCase()}
                    </div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h1 style={{ fontSize: 26 }}>{profile.first_name} {profile.last_name}</h1>
                    {profile.is_available && <span className="badge badge-green">✓ Disponible</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-soft)', marginBottom: 8, fontSize: 14 }}>
                    <MapPin size={14} /> {profile.city ? `${profile.city}, ` : ''}{profile.country}
                  </div>
                  {profile.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={16} style={{ color: i <= Math.round(profile.rating) ? '#f59e0b' : '#d1d5db', fill: i <= Math.round(profile.rating) ? '#f59e0b' : 'none' }} />
                      ))}
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{profile.rating.toFixed(1)}</span>
                      <span style={{ color: 'var(--text-soft)', fontSize: 13 }}>({profile.total_reviews} avis)</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p style={{ color: 'var(--text-mid)', marginTop: 20, lineHeight: 1.7, fontSize: 15, borderTop: '1px solid var(--sand-dark)', paddingTop: 20 }}>
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Compétences */}
            {profile.skills?.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Compétences</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {profile.skills.map(s => <span key={s} className="badge badge-green" style={{ fontSize: 13, padding: '6px 14px' }}>{s}</span>)}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile.portfolio?.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Portfolio</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {profile.portfolio.map(item => (
                    <div key={item.id} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--sand-dark)' }}>
                      {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                        {item.description && <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{item.description}</div>}
                        {item.project_url && (
                          <a href={item.project_url} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            <Globe size={12} /> Voir le projet
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            {reviews.length > 0 && (
              <div className="card">
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Avis clients ({reviews.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--sand-dark)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={14} style={{ color: i <= r.rating ? '#f59e0b' : '#d1d5db', fill: i <= r.rating ? '#f59e0b' : 'none' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                          {new Date(r.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{r.comment}</p>
                      <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 6 }}>— {r.reviewer_email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
            <div className="card">
              {profile.hourly_rate && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{Number(profile.hourly_rate).toLocaleString()} XOF</div>
                  <div style={{ color: 'var(--text-soft)', fontSize: 13 }}>par heure</div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {profile.languages?.length > 0 && (
                  <div style={{ fontSize: 14 }}>
                    <span style={{ color: 'var(--text-soft)' }}>Langues : </span>
                    <span style={{ fontWeight: 600 }}>{profile.languages.join(', ')}</span>
                  </div>
                )}
              </div>

              {user && user.id !== Number(id) && (
                <Link to={`/messages/${id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <MessageSquare size={18} /> Contacter
                </Link>
              )}
              {!user && (
                <Link to="/register" className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }}>
                  Créer un compte pour contacter
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
