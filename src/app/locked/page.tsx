'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LockedPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/unlock', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError(true)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '360px', padding: '0 1.5rem' }}>
        {/* Logo mark */}
        <svg width="40" height="40" viewBox="0 0 34 34" fill="none" style={{ marginBottom: '2rem' }}>
          <rect x="1" y="1" width="32" height="32" rx="1.5" stroke="#B08D57" strokeWidth="0.8" fill="none"/>
          <rect x="9.2" y="9.2" width="15.6" height="15.6" rx="0.5" stroke="#B08D57" strokeWidth="0.7" fill="none" transform="rotate(45 17 17)"/>
          <path d="M11.5 23.5 L11.5 16.5 Q11.5 10.5 17 10.5 Q22.5 10.5 22.5 16.5 L22.5 23.5" stroke="#B08D57" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
          <circle cx="17" cy="10.5" r="1" fill="#B08D57"/>
          <line x1="9" y1="23.5" x2="25" y2="23.5" stroke="#B08D57" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="10" cy="23.5" r="0.8" fill="#B08D57"/>
          <circle cx="24" cy="23.5" r="0.8" fill="#B08D57"/>
        </svg>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#B08D57', marginBottom: '1rem' }}>
          Serai
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 400, color: '#1C1C1A', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Private preview
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#8A8880', marginBottom: '2rem', lineHeight: 1.7 }}>
          Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              border: error ? '1.5px solid #C0392B' : '1.5px solid #E8E4D9',
              borderRadius: '2px',
              background: '#fff',
              color: '#1C1C1A',
              outline: 'none',
              marginBottom: '0.75rem',
              boxSizing: 'border-box',
            }}
            autoFocus
          />
          {error && (
            <p style={{ color: '#C0392B', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Incorrect password.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#B08D57',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              fontFamily: 'Georgia, serif',
              fontSize: '0.9rem',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
