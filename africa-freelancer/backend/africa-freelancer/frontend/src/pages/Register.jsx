// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, profileAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'

// Étape 1 : Choisir son rôle + infos de base
// Étape 2 : Compléter son profil
export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userTokens, setUserTokens] = useState(null)
  const [userRole, setUserRole] = useState(null)

  // ── ÉTAPE 1 : Compte ───────────────────────
  const [account, setAccount] = useState({ email: '', password: '', password_confirm: '', role: 'FREELANCE' })
  const [errors, setErrors] = useState({})

  const handleAccountChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!account.email) errs.email = 'Email requis'
    if (account.password.length < 8) errs.password = 'Minimum 8 caractères'
    if (account.password !== account.password_confirm) errs.password_confirm = 'Les mots de passe ne correspondent pas'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await authAPI.register(account)
      setUserId(res.data.user.id)
      setUserTokens(res.data.tokens)
      setUserRole(account.role)
      // Stocker les tokens pour les appels suivants
      localStorage.setItem('access_token', res.data.tokens.access)
      localStorage.setItem('refresh_token', res.data.tokens.refresh)
      setStep(2)
      toast.success('Compte créé ! Complétez votre profil.')
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.error || 'Erreur lors de l\'inscription.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── ÉTAPE 2 : Profil ───────────────────────
  const [profile, setProfile] = useState({ first_name: '', last_name: '', country: '', bio: '', skills: '', hourly_rate: '' })

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        country: profile.country,
        bio: profile.bio,
      }
      if (userRole === 'FREELANCE') {
        data.skills = profile.skills.split(',').map(s => s.trim()).filter(Boolean)
        data.hourly_rate = profile.hourly_rate || null
        await profileAPI.createFreelance(data)
      } else {
        data.company_name = profile.company_name || ''
        await profileAPI.createClient(data)
      }

      // Récupérer les infos complètes de l'utilisateur
      const meRes = await authAPI.me().then ? await import('../api/client').then(m => m.authAPI.me()) : null
      login({ id: userId, role: userRole, email: account.email }, userTokens)
      toast.success('Profil créé ! Bienvenue 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Erreur lors de la création du profil.')
      console.error(err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 500 }}>
        {/* Indicateur d'étapes */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: step >= s ? 'var(--green)' : 'var(--sand-dark)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {step === 1 ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌍</div>
              <h1 style={{ fontSize: 24, marginBottom: 6 }}>Créer un compte</h1>
              <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Étape 1 sur 2 — Informations de connexion</p>
            </div>

            {/* Sélection du rôle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { value: 'FREELANCE', label: 'Je suis Freelance', emoji: '💼' },
                { value: 'CLIENT', label: 'Je cherche des talents', emoji: '🏢' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccount({ ...account, role: opt.value })}
                  style={{
                    padding: '16px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    border: `2px solid ${account.role === opt.value ? 'var(--green)' : 'var(--sand-dark)'}`,
                    background: account.role === opt.value ? 'var(--green-soft)' : 'white',
                    textAlign: 'center', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{opt.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: account.role === opt.value ? 'var(--green)' : 'var(--text-mid)' }}>
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>

            <form onSubmit={handleAccountSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" placeholder="votre@email.com"
                  value={account.email} onChange={handleAccountChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input className="form-input" type="password" name="password" placeholder="Minimum 8 caractères"
                  value={account.password} onChange={handleAccountChange} />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe</label>
                <input className="form-input" type="password" name="password_confirm" placeholder="••••••••"
                  value={account.password_confirm} onChange={handleAccountChange} />
                {errors.password_confirm && <span className="form-error">{errors.password_confirm}</span>}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                <UserPlus size={18} />
                {loading ? 'Création...' : 'Continuer'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-soft)' }}>
              Déjà un compte ? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Se connecter</Link>
            </p>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{userRole === 'FREELANCE' ? '💼' : '🏢'}</div>
              <h1 style={{ fontSize: 24, marginBottom: 6 }}>Votre profil</h1>
              <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Étape 2 sur 2 — Informations personnelles</p>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input className="form-input" name="first_name" placeholder="Jean" value={profile.first_name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input className="form-input" name="last_name" placeholder="Dupont" value={profile.last_name} onChange={handleProfileChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pays</label>
                <input className="form-input" name="country" placeholder="Côte d'Ivoire" value={profile.country} onChange={handleProfileChange} required />
              </div>
              {userRole === 'FREELANCE' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Compétences <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>(séparées par des virgules)</span></label>
                    <input className="form-input" name="skills" placeholder="React, Django, Figma" value={profile.skills} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tarif horaire (XOF) <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>optionnel</span></label>
                    <input className="form-input" type="number" name="hourly_rate" placeholder="5000" value={profile.hourly_rate} onChange={handleProfileChange} />
                  </div>
                </>
              )}
              {userRole === 'CLIENT' && (
                <div className="form-group">
                  <label className="form-label">Entreprise <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>optionnel</span></label>
                  <input className="form-input" name="company_name" placeholder="Ma Startup SAS" value={profile.company_name || ''} onChange={handleProfileChange} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Bio <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>optionnel</span></label>
                <textarea className="form-input" name="bio" rows={3} placeholder="Parlez-nous de vous..."
                  value={profile.bio} onChange={handleProfileChange} style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Finalisation...' : 'Terminer mon inscription 🎉'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
