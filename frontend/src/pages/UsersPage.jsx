import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const ROLES = ['ANALISTA', 'GESTOR', 'LEITOR']
const DEFAULT_PASSWORD = '123@impettus'

const emptyCreate = { name: '', email: '', password: '', role: 'ANALISTA' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [createError, setCreateError] = useState('')
  const [editError, setEditError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  function loadUsers() {
    apiFetch('/api/users').then(setUsers)
  }

  useEffect(() => { loadUsers() }, [])

  function flash(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    try {
      await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(createForm) })
      setCreateForm(emptyCreate)
      loadUsers()
      const usedDefault = !createForm.password
      flash(usedDefault
        ? `Usuário criado. Senha padrão: ${DEFAULT_PASSWORD}`
        : 'Usuário criado com sucesso.')
    } catch (err) {
      setCreateError(err.message)
    }
  }

  function openEdit(user) {
    setEditUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, active: user.active })
    setEditError('')
  }

  async function handleEdit(e) {
    e.preventDefault()
    setEditError('')
    try {
      await apiFetch(`/api/users/${editUser.id}`, { method: 'PUT', body: JSON.stringify(editForm) })
      setEditUser(null)
      loadUsers()
      flash('Usuário atualizado.')
    } catch (err) {
      setEditError(err.message)
    }
  }

  async function handleResetPassword(user) {
    try {
      await apiFetch(`/api/users/${user.id}/reset-password`, { method: 'POST' })
      loadUsers()
      flash(`Senha de ${user.name} redefinida para: ${DEFAULT_PASSWORD}`)
    } catch (err) {
      flash(`Erro: ${err.message}`)
    }
  }

  async function handleDelete(user) {
    try {
      await apiFetch(`/api/users/${user.id}`, { method: 'DELETE' })
      setConfirmDelete(null)
      loadUsers()
      flash(`${user.name} foi excluído.`)
    } catch (err) {
      flash(`Erro: ${err.message}`)
    }
  }

  return (
    <div className="users-layout">

      {/* Formulário de criação */}
      <form className="card form-grid" onSubmit={handleCreate}>
        <div className="section-title-row"><h3>Novo usuário</h3></div>
        {createError && <div className="error-box">{createError}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}
        <input placeholder="Nome completo" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
        <input placeholder="E-mail" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
        <input
          placeholder={`Senha (vazio = ${DEFAULT_PASSWORD})`}
          type="password"
          value={createForm.password}
          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
        />
        <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button type="submit">Criar usuário</button>
        <p className="form-hint">Se a senha for omitida, o usuário receberá a senha padrão e será obrigado a trocá-la no primeiro acesso.</p>
      </form>

      {/* Lista de usuários */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Equipe cadastrada</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.name}
                    {user.must_change_password && (
                      <span className="pill must-change-pwd" title="Deve trocar a senha no próximo acesso">🔑 Trocar senha</span>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`pill role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td>
                    <span className={`pill ${user.active ? 'status-concluida' : 'status-cancelada'}`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-inline">
                      <button className="ghost-btn" onClick={() => openEdit(user)}>Editar</button>
                      <button className="ghost-btn" onClick={() => handleResetPassword(user)} title="Redefinir para senha padrão">↺ Senha</button>
                      <button className="ghost-btn danger" onClick={() => setConfirmDelete(user)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edição */}
      {editUser && (
        <div className="modal-backdrop" onClick={() => setEditUser(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <form className="card form-grid" onSubmit={handleEdit}>
              <div className="section-title-row">
                <h3>Editar — {editUser.name}</h3>
                <button type="button" className="ghost-btn" onClick={() => setEditUser(null)}>Fechar</button>
              </div>
              {editError && <div className="error-box">{editError}</div>}
              <input
                placeholder="Nome"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <input
                placeholder="E-mail"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                />
                <span>Usuário ativo</span>
              </label>
              <button type="submit">Salvar alterações</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal-panel confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="card form-grid">
              <h3>Confirmar exclusão</h3>
              <p>Tem certeza que deseja excluir <strong>{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.</p>
              <div className="actions-inline" style={{ justifyContent: 'flex-end' }}>
                <button className="ghost-btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="ghost-btn danger" onClick={() => handleDelete(confirmDelete)}>Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
