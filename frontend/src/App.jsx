import { useEffect, useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import KanbanPage from './pages/KanbanPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'
import TaskDetailsPage from './pages/TaskDetailsPage'
import { apiFetch, clearSession, getStoredUser, setSession } from './lib/api'

function getInitials(name = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function SidebarItem({ to, icon, label, collapsed }) {
  return (
    <NavLink to={to} className="sidebar-link" title={collapsed ? label : ''}>
      <span className="sidebar-link-icon">{icon}</span>
      <span className="sidebar-link-label">{label}</span>
    </NavLink>
  )
}

function ProtectedLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const initials = useMemo(() => getInitials(user?.name), [user])
  const isGestor = user?.role === 'GESTOR'

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      
      <aside className="sidebar">

        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-mark">TF</div>
            {!collapsed && (
              <div>
                <h1>TaskFlow</h1>
                <p>BI & Tecnologia</p>
              </div>
            )}
          </div>

          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav>
          <SidebarItem to="/dashboard" icon="🏠" label="Dashboard" collapsed={collapsed}/>
          <SidebarItem to="/tasks" icon="📋" label="Demandas" collapsed={collapsed}/>
          <SidebarItem to="/kanban" icon="🗂️" label="Kanban" collapsed={collapsed}/>
          {isGestor && <SidebarItem to="/users" icon="👥" label="Usuários" collapsed={collapsed}/>}
        </nav>

        <button className="ghost-btn light logout-btn" onClick={onLogout} title="Sair">
          <span className="logout-icon">↩</span>
          {!collapsed && <span>Sair</span>}
        </button>
      </aside>

      <main className="content">

        <header className="topbar">
          <h2>Painel de Gestão</h2>
          <div className="topbar-user">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
        </header>

        <div className="page-body">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          {isGestor && <Route path="/users" element={<UsersPage />} />}
        </Routes>
        </div>

      </main>
    </div>
  )
}

function ChangePasswordModal({ user, onDone }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.new_password !== form.confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const updated = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
      })
      onDone(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <form className="card form-grid" onSubmit={handleSubmit}>
          <div className="change-pwd-header">
            <span className="brand-badge">Segurança</span>
            <h3>Troque sua senha</h3>
            <p>Olá, <strong>{user.name}</strong>. Por segurança, você precisa definir uma senha pessoal antes de continuar.</p>
          </div>
          {error && <div className="error-box">{error}</div>}
          <input type="password" placeholder="Senha atual" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required />
          <input type="password" placeholder="Nova senha (mín. 6 caracteres)" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required />
          <input type="password" placeholder="Confirmar nova senha" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Definir nova senha'}</button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(getStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validate() {
      try {
        const data = await apiFetch('/api/auth/me')
        setUser(data)
      } catch {
        clearSession()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    validate()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (!user) return <LoginPage onLogin={setUser} />

  if (user.must_change_password) {
    return <ChangePasswordModal user={user} onDone={(updated) => setUser(updated)} />
  }

  return <ProtectedLayout user={user} onLogout={() => {
    clearSession()
    setUser(null)
  }} />
}