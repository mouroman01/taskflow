import { useEffect, useMemo, useState } from 'react'
import { apiFetch, getStoredUser } from '../lib/api'

const initialState = {
  title: '',
  requester: '',
  marca: '',
  request_date: '',
  due_date: '',
  status: 'NOVA',
  blocking_reason: '',
  observations: '',
  // campos complementares
  description: '',
  task_type: 'BI',
  priority: 'MEDIA',
  responsible_id: '',
  department_id: '',
  blocking_department_id: '',
  waiting_since: '',
  comment: '',
}

const STATUS_OPTIONS = [
  'NOVA', 'PENDENTE', 'EM_ANALISE', 'EM_EXECUCAO', 'AGUARDANDO_TERCEIRO',
  'BLOQUEADA', 'EM_VALIDACAO', 'CONCLUIDA', 'CANCELADA',
]

const STATUS_LABELS = {
  NOVA: 'Nova',
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  EM_EXECUCAO: 'Em andamento',
  AGUARDANDO_TERCEIRO: 'Aguardando terceiro',
  BLOQUEADA: 'Bloqueada',
  EM_VALIDACAO: 'Em validação',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

export default function TaskForm({ mode = 'create', task = null, onSaved, onCancel }) {
  const [form, setForm] = useState(initialState)
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [error, setError] = useState('')
  const [showExtra, setShowExtra] = useState(false)
  const currentUser = getStoredUser()

  useEffect(() => {
    apiFetch('/api/users').then(setUsers)
    apiFetch('/api/departments').then(setDepartments)
  }, [])

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        requester: task.requester || '',
        marca: task.marca || '',
        request_date: task.request_date || '',
        due_date: task.due_date || '',
        status: task.status || 'NOVA',
        blocking_reason: task.blocking_reason || '',
        observations: task.observations || '',
        description: task.description || '',
        task_type: task.task_type || 'BI',
        priority: task.priority || 'MEDIA',
        responsible_id: task.responsible_id || '',
        department_id: task.department_id || '',
        blocking_department_id: task.blocking_department_id || '',
        waiting_since: task.waiting_since || '',
        comment: '',
      })
    } else {
      setForm(initialState)
    }
  }, [task])

  const formTitle = useMemo(() => mode === 'edit' ? 'Editar demanda' : 'Nova demanda', [mode])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      user_id: currentUser?.id || null,
      responsible_id: form.responsible_id ? Number(form.responsible_id) : null,
      department_id: form.department_id ? Number(form.department_id) : null,
      blocking_department_id: form.blocking_department_id ? Number(form.blocking_department_id) : null,
    }
    try {
      if (mode === 'edit' && task?.id) {
        await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(payload) })
      }
      setForm(initialState)
      onSaved?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="section-title-row">
        <h3>{formTitle}</h3>
        {mode === 'edit' && <button type="button" className="ghost-btn" onClick={onCancel}>Fechar</button>}
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* ── Campos principais (espelho da planilha) ── */}
      <input name="title" placeholder="Atividade" value={form.title} onChange={handleChange} required />

      <div className="inline-grid two-col">
        <input name="requester" placeholder="Solicitante" value={form.requester} onChange={handleChange} />
        <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} />
      </div>

      <div className="inline-grid two-col">
        <div className="field-wrap">
          <label className="field-label">Data solicitação</label>
          <input type="date" name="request_date" value={form.request_date} onChange={handleChange} />
        </div>
        <div className="field-wrap">
          <label className="field-label">Data entrega</label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
        </div>
      </div>

      <div className="field-wrap">
        <label className="field-label">Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <input name="blocking_reason" placeholder="Motivo do status" value={form.blocking_reason} onChange={handleChange} />

      <textarea name="observations" placeholder="Observações" value={form.observations} onChange={handleChange} rows="2" />

      {mode === 'edit' && (
        <textarea name="comment" placeholder="Comentário da atualização" value={form.comment} onChange={handleChange} rows="2" />
      )}

      {/* ── Campos complementares ── */}
      <button type="button" className="ghost-btn extra-toggle" onClick={() => setShowExtra((v) => !v)}>
        {showExtra ? '▲ Menos campos' : '▼ Mais campos'}
      </button>

      {showExtra && (
        <div className="extra-fields">
          <textarea name="description" placeholder="Descrição" value={form.description} onChange={handleChange} rows="2" />
          <div className="inline-grid two-col">
            <select name="task_type" value={form.task_type} onChange={handleChange}>
              <option>BI</option><option>SAP</option><option>PLANILHA</option>
              <option>BANCO_DE_DADOS</option><option>DASHBOARD</option><option>AUTOMACAO</option>
            </select>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option>BAIXA</option><option>MEDIA</option><option>ALTA</option><option>CRITICA</option>
            </select>
          </div>
          <select name="responsible_id" value={form.responsible_id} onChange={handleChange}>
            <option value="">Responsável</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select name="department_id" value={form.department_id} onChange={handleChange}>
            <option value="">Área da demanda</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select name="blocking_department_id" value={form.blocking_department_id} onChange={handleChange}>
            <option value="">Área bloqueadora</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <div className="field-wrap">
            <label className="field-label">Aguardando desde</label>
            <input type="date" name="waiting_since" value={form.waiting_since} onChange={handleChange} />
          </div>
        </div>
      )}

      <button type="submit">{mode === 'edit' ? 'Salvar alterações' : 'Salvar demanda'}</button>
    </form>
  )
}
