// src/pages/CreateProject.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { projectsAPI } from '../api/client'
import toast from 'react-hot-toast'
import { PlusCircle, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'DEV_WEB', label: '💻 Développement Web' },
  { value: 'DEV_MOBILE', label: '📱 Développement Mobile' },
  { value: 'DESIGN', label: '🎨 Design & Graphisme' },
  { value: 'MARKETING', label: '📣 Marketing Digital' },
  { value: 'REDACTION', label: '✍️ Rédaction & Traduction' },
  { value: 'VIDEO', label: '🎬 Vidéo & Animation' },
  { value: 'DATA', label: '📊 Data & IA' },
  { value: 'AUTRE', label: '🔧 Autre' },
]

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', budget: '', budget_type: 'FIXED',
    category: 'DEV_WEB', level: 'INTERMEDIATE', deadline: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])
  const [errors, setErrors] = useState({})

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Le titre est requis'
    if (!form.description.trim()) errs.description = 'La description est requise'
    if (!form.budget || Number(form.budget) <= 0) errs.budget = 'Budget invalide'
    return errs
  }

  const createMutation = useMutation({
    mutationFn: () => projectsAPI.create({ ...form, skills_needed: skills }),
    onSuccess: (res) => {
      toast.success('Projet publié avec succès !')
      navigate(`/projects/${res.data.id}`)
    },
    onError: (err) => {
      toast.error('Erreur lors de la publication.')
      console.error(err.response?.data)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    createMutation.mutate()
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Publier un projet</h1>
          <p style={{ color: 'var(--text-soft)' }}>Décrivez votre besoin pour recevoir des offres de freelances qualifiés.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Titre */}
            <div className="form-group">
              <label className="form-label">Titre du projet *</label>
              <input className="form-input" placeholder="Ex: Créer un site e-commerce avec React et Django"
                value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: '' }) }} />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description détaillée *</label>
              <textarea className="form-input" rows={6} placeholder="Décrivez précisément le travail attendu, les livrables, les contraintes..."
                value={form.description} onChange={e => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: '' }) }}
                style={{ resize: 'vertical' }} />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Catégorie + Niveau */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Niveau requis</label>
                <select className="form-input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  <option value="BEGINNER">Débutant</option>
                  <option value="INTERMEDIATE">Intermédiaire</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            {/* Budget */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Budget (XOF) *</label>
                <input className="form-input" type="number" placeholder="50000"
                  value={form.budget} onChange={e => { setForm({ ...form, budget: e.target.value }); setErrors({ ...errors, budget: '' }) }} />
                {errors.budget && <span className="form-error">{errors.budget}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Type de budget</label>
                <select className="form-input" value={form.budget_type} onChange={e => setForm({ ...form, budget_type: e.target.value })}>
                  <option value="FIXED">Fixe (projet entier)</option>
                  <option value="HOURLY">Horaire</option>
                </select>
              </div>
            </div>

            {/* Date limite */}
            <div className="form-group">
              <label className="form-label">Date limite <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>optionnel</span></label>
              <input className="form-input" type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>

            {/* Compétences */}
            <div className="form-group">
              <label className="form-label">Compétences requises</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input className="form-input" placeholder="Ex: React, Django, Figma..."
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button type="button" className="btn btn-outline" onClick={addSkill}>
                  <PlusCircle size={16} /> Ajouter
                </button>
              </div>
              {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {skills.map(s => (
                    <span key={s} className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Aperçu budget */}
            {form.budget && (
              <div style={{ background: 'var(--green-soft)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 4 }}>Récapitulatif</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Budget total</span>
                  <strong>{Number(form.budget).toLocaleString()} XOF</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-soft)', fontSize: 13 }}>
                  <span>Commission plateforme (10%)</span>
                  <span>-{(form.budget * 0.1).toLocaleString()} XOF</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)', fontWeight: 700, borderTop: '1px solid var(--sand-dark)', paddingTop: 8, marginTop: 8 }}>
                  <span>Reçu par le freelance</span>
                  <span>{(form.budget * 0.9).toLocaleString()} XOF</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publication...' : '🚀 Publier le projet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
