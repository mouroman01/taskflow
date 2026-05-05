import { useState } from 'react'
import { apiFetch, setSession } from '../lib/api'

const REMEMBER_KEY = 'taskflow_remembered_email'

export default function LoginPage({ onLogin }) {
  const savedEmail = localStorage.getItem(REMEMBER_KEY) || ''
  const [form, setForm] = useState({ email: savedEmail, password: '' })
  const [rememberMe, setRememberMe] = useState(!!savedEmail)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const session = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, form.email)
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      setSession(session)
      onLogin?.(session.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-badge">TaskFlow V2</span>
          <h1>BI & Tecnologia</h1>
          <p>Entre para acompanhar demandas, bloqueios, responsáveis e histórico da operação.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <label className="remember-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Lembrar e-mail</span>
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <div className="login-hint">
          <strong>Acesso inicial:</strong>
          <span>admin@taskflow.local / Admin@123</span>
        </div>
      </div>
    </div>
  )
}
