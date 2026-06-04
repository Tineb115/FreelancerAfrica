// src/pages/Messages.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Send, MessageSquare } from 'lucide-react'

export default function Messages() {
  const { id: contactId } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  // Liste des conversations
  const { data: inbox = [] } = useQuery({
    queryKey: ['inbox'],
    queryFn: () => messagesAPI.inbox().then(r => r.data),
    refetchInterval: 10000,
  })

  // Messages de la conversation active
  const { data: messages = [] } = useQuery({
    queryKey: ['conversation', contactId],
    queryFn: () => messagesAPI.conversation(contactId).then(r => r.data),
    enabled: !!contactId,
    refetchInterval: 5000,  // Polling toutes les 5 secondes (simple et fiable)
  })

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: () => messagesAPI.send({ receiver_id: contactId, content: text }),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries(['conversation', contactId])
      queryClient.invalidateQueries(['inbox'])
    },
  })

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    sendMutation.mutate()
  }

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      <div className="container" style={{ padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 68px)' }}>

          {/* ── Liste conversations ─────────────── */}
          <div style={{ borderRight: '1px solid var(--sand-dark)', background: 'white', overflowY: 'auto' }}>
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--sand-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={20} color="var(--green)" />
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Messages</h2>
            </div>
            {inbox.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-soft)', fontSize: 14 }}>
                Aucune conversation
              </div>
            ) : (
              inbox.map(msg => (
                <Link key={msg.id} to={`/messages/${msg.sender === user?.id ? msg.receiver : msg.sender}`}
                  style={{
                    display: 'block', padding: '14px 16px',
                    background: contactId === String(msg.sender === user?.id ? msg.receiver : msg.sender) ? 'var(--green-soft)' : 'transparent',
                    borderLeft: contactId === String(msg.sender === user?.id ? msg.receiver : msg.sender) ? '3px solid var(--green)' : '3px solid transparent',
                    transition: 'background 0.15s'
                  }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{msg.other_user_email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-soft)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {msg.content}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* ── Zone de chat ────────────────────── */}
          {contactId ? (
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--sand)' }}>
              {/* Header */}
              <div style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid var(--sand-dark)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>
                  {(inbox.find(m => String(m.sender === user?.id ? m.receiver : m.sender) === contactId)?.other_user_email?.[0] || '?').toUpperCase()}
                </div>
                <div style={{ fontWeight: 600 }}>
                  {inbox.find(m => String(m.sender === user?.id ? m.receiver : m.sender) === contactId)?.other_user_email || `Utilisateur #${contactId}`}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                {messages.map(msg => {
                  const isMine = msg.sender === user?.id
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                      <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>
                        <div style={{ fontSize: 15 }}>{msg.content}</div>
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input message */}
              <form onSubmit={handleSend} style={{ padding: '16px 24px', background: 'white', borderTop: '1px solid var(--sand-dark)', display: 'flex', gap: 12 }}>
                <input
                  className="form-input"
                  placeholder="Écrire un message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                />
                <button type="submit" className="btn btn-primary" disabled={!text.trim() || sendMutation.isPending}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-soft)' }}>
              <MessageSquare size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 16 }}>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
