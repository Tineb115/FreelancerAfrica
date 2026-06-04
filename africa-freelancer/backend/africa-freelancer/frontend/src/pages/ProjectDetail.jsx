// src/pages/ProjectDetail.jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsAPI, proposalsAPI, paymentsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Send, CheckCircle, RotateCcw, DollarSign, Users, Calendar } from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'ORANGE_MONEY', label: '🟠 Orange Money' },
  { value: 'MPESA', label: '🟢 M-Pesa' },
  { value: 'AIRTEL_MONEY', label: '🔴 Airtel Money' },
  { value: 'FLUTTERWAVE', label: '💳 Flutterwave' },
  { value: 'CARD', label: '💳 Carte bancaire' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.get(id).then(r => r.data),
  })

  // Charger les offres si client propriétaire
  const { data: proposals } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalsAPI.list(id).then(r => r.data),
    enabled: !!user && user.role === 'CLIENT' && !!project && project.client === user?.id,
  })

  // ── Formulaire d'offre ─────────────────────
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposal, setProposal] = useState({ price: '', delivery_days: '', cover_letter: '' })

  const submitProposal = useMutation({
    mutationFn: () => proposalsAPI.submit(id, proposal),
    onSuccess: () => {
      toast.success('Offre envoyée !')
      setShowProposalForm(false)
      queryClient.invalidateQueries(['project', id])
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi.'),
  })

  // ── Paiement ───────────────────────────────
  const [showPayment, setShowPayment] = useState(false)
  const [payMethod, setPayMethod] = useState('ORANGE_MONEY')

  const initiatePayment = useMutation({
    mutationFn: () => paymentsAPI.pay(id, payMethod),
    onSuccess: () => {
      toast.success('Paiement effectué ! Fonds sécurisés.')
      setShowPayment(false)
      queryClient.invalidateQueries(['project', id])
    },
    onError: () => toast.error('Erreur de paiement.'),
  })

  // ── Actions livraison ──────────────────────
  const acceptDelivery = useMutation({
    mutationFn: () => projectsAPI.acceptDelivery(id),
    onSuccess: () => { toast.success('Livraison acceptée !'); queryClient.invalidateQueries(['project', id]) },
  })
  const requestRevision = useMutation({
    mutationFn: () => projectsAPI.requestRevision(id),
    onSuccess: () => { toast.success('Révision demandée.'); queryClient.invalidateQueries(['project', id]) },
  })

  // ── Accept/Reject proposal ─────────────────
  const acceptProposal = useMutation({
    mutationFn: (proposalId) => proposalsAPI.accept(proposalId),
    onSuccess: () => { toast.success('Offre acceptée ! Le freelance peut commencer.'); queryClient.invalidateQueries(['project', id]) },
  })
  const rejectProposal = useMutation({
    mutationFn: (proposalId) => proposalsAPI.reject(proposalId),
    onSuccess: () => { toast.success('Offre refusée.'); queryClient.invalidateQueries(['proposals', id]) },
  })

  if (isLoading) return <div className="spinner" />
  if (!project) return <div className="page"><div className="container"><p>Projet introuvable.</p></div></div>

  const isOwner = user?.id === project.client
  const isHiredFreelance = user?.id === project.hired_freelance
  const canPropose = user?.role === 'FREELANCE' && project.status === 'OPEN'

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

          {/* ── Colonne principale ─────────────── */}
          <div>
            <div style={{ marginBottom: 8, display: 'flex', gap: 10 }}>
              <span className="badge badge-green">{project.category?.replace('_', ' ')}</span>
              <StatusBadge status={project.status} />
            </div>
            <h1 style={{ fontSize: 28, marginBottom: 16, marginTop: 12 }}>{project.title}</h1>
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 24, fontSize: 16 }}>{project.description}</p>

            {project.skills_needed?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 10 }}>Compétences requises</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.skills_needed.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                </div>
              </div>
            )}

            {/* ── Offres reçues (client uniquement) ── */}
            {isOwner && proposals?.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={20} /> {proposals.length} offre(s) reçue(s)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {proposals.map(p => (
                    <div key={p.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 16 }}>{p.freelance_info?.name}</div>
                          <div style={{ color: 'var(--text-soft)', fontSize: 13 }}>⭐ {p.freelance_info?.rating?.toFixed(1) || '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 18 }}>{Number(p.price).toLocaleString()} XOF</div>
                          <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>⏱ {p.delivery_days} jours</div>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 16 }}>{p.cover_letter}</p>
                      {p.status === 'PENDING' && project.status === 'OPEN' && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => acceptProposal.mutate(p.id)}>✓ Accepter</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => rejectProposal.mutate(p.id)}>✗ Refuser</button>
                          <Link to={`/messages/${p.freelance}`} className="btn btn-outline btn-sm">💬 Discuter</Link>
                        </div>
                      )}
                      {p.status !== 'PENDING' && <span className="badge badge-gray">{p.status}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Formulaire d'offre (freelance) ── */}
            {canPropose && !showProposalForm && (
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setShowProposalForm(true)}>
                <Send size={18} /> Soumettre une offre
              </button>
            )}

            {showProposalForm && (
              <div className="card" style={{ marginTop: 24, borderLeft: '4px solid var(--green)' }}>
                <h3 style={{ marginBottom: 20 }}>Votre offre</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Prix proposé (XOF)</label>
                    <input className="form-input" type="number" placeholder="25000"
                      value={proposal.price} onChange={e => setProposal({ ...proposal, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Délai (jours)</label>
                    <input className="form-input" type="number" placeholder="7"
                      value={proposal.delivery_days} onChange={e => setProposal({ ...proposal, delivery_days: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message de présentation</label>
                  <textarea className="form-input" rows={4} placeholder="Expliquez pourquoi vous êtes le meilleur candidat..."
                    value={proposal.cover_letter} onChange={e => setProposal({ ...proposal, cover_letter: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => submitProposal.mutate()} disabled={submitProposal.isPending}>
                    {submitProposal.isPending ? 'Envoi...' : 'Envoyer mon offre'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowProposalForm(false)}>Annuler</button>
                </div>
              </div>
            )}

            {/* ── Actions livraison (client) ── */}
            {isOwner && project.status === 'DELIVERED' && (
              <div className="card" style={{ marginTop: 24, background: 'var(--green-soft)', borderLeft: '4px solid var(--green)' }}>
                <h3 style={{ marginBottom: 8 }}>📦 Le freelance a livré le projet</h3>
                <p style={{ color: 'var(--text-mid)', marginBottom: 16, fontSize: 14 }}>Vérifiez la livraison et acceptez ou demandez des modifications.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => acceptDelivery.mutate()} disabled={acceptDelivery.isPending}>
                    <CheckCircle size={16} /> Accepter la livraison
                  </button>
                  <button className="btn btn-outline" onClick={() => requestRevision.mutate()} disabled={requestRevision.isPending}>
                    <RotateCcw size={16} /> Demander une révision
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>
                {Number(project.budget).toLocaleString()} XOF
              </div>
              <div style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 20 }}>
                {project.budget_type === 'FIXED' ? 'Budget fixe' : 'Tarif horaire'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <InfoRow icon={<Users size={16} />} label="Offres reçues" value={`${project.proposals_count || 0}`} />
                <InfoRow icon={<Calendar size={16} />} label="Niveau requis" value={project.level} />
                {project.deadline && (
                  <InfoRow icon={<Calendar size={16} />} label="Date limite" value={new Date(project.deadline).toLocaleDateString('fr-FR')} />
                )}
              </div>

              {/* Bouton paiement (client, projet IN_PROGRESS) */}
              {isOwner && project.status === 'IN_PROGRESS' && (
                <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowPayment(true)}>
                  <DollarSign size={18} /> Effectuer le paiement
                </button>
              )}

              {showPayment && (
                <div style={{ marginTop: 16 }}>
                  <select className="form-input" value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ marginBottom: 12 }}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => initiatePayment.mutate()} disabled={initiatePayment.isPending}>
                    {initiatePayment.isPending ? 'Traitement...' : 'Confirmer le paiement'}
                  </button>
                </div>
              )}

              {/* Client : lien vers messages */}
              {user && !isOwner && project.hired_freelance && (
                <Link to={`/messages/${project.client}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  💬 Contacter le client
                </Link>
              )}
            </div>

            {/* Infos client */}
            <div className="card">
              <h4 style={{ marginBottom: 12, fontSize: 15 }}>À propos du client</h4>
              <div style={{ color: 'var(--text-mid)', fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>{project.client_info?.name}</div>
                {project.client_info?.company && <div style={{ color: 'var(--text-soft)' }}>{project.client_info.company}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
      <span style={{ color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    OPEN: { label: 'Ouvert', cls: 'badge-green' },
    IN_PROGRESS: { label: 'En cours', cls: 'badge-orange' },
    DELIVERED: { label: 'Livré', cls: 'badge-orange' },
    COMPLETED: { label: 'Terminé', cls: 'badge-gray' },
    CANCELLED: { label: 'Annulé', cls: 'badge-gray' },
  }
  const s = map[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}
