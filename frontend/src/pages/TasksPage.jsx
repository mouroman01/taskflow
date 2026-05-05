import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskForm from '../components/TaskForm'
import { apiFetch, apiDownload, getStoredUser } from '../lib/api'

const DONE = ['CONCLUIDA', 'CANCELADA']
const today = new Date().toISOString().slice(0, 10)

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

function isOverdue(task) {
  return task.due_date && task.due_date < today && !DONE.includes(task.status)
}

function DueDate({ task }) {
  if (!task.due_date) return <span className="muted-val">—</span>
  if (isOverdue(task)) {
    return (
      <span className="due-overdue">
        <span className="overdue-dot" />
        {task.due_date}
        <span className="pill overdue-badge">Atrasada</span>
      </span>
    )
  }
  return <span>{task.due_date}</span>
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [responsibleFilter, setResponsibleFilter] = useState('')
  const [marcaFilter, setMarcaFilter] = useState('')
  const [users, setUsers] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [exporting, setExporting] = useState(null)
  const navigate = useNavigate()
  const currentUser = getStoredUser()
  const isGestor = currentUser?.role === 'GESTOR'

  useEffect(() => {
    if (isGestor) apiFetch('/api/users').then(setUsers).catch(() => {})
  }, [])

  async function handleExport(format) {
    setExporting(format)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (responsibleFilter) params.set('responsible_id', responsibleFilter)
      if (marcaFilter) params.set('marca', marcaFilter)
      const qs = params.toString() ? `?${params}` : ''
      await apiDownload(`/api/export/tasks/${format}${qs}`)
    } catch (e) {
      alert('Erro ao exportar: ' + e.message)
    } finally {
      setExporting(null)
    }
  }

  function loadTasks() {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (isGestor && responsibleFilter) params.set('responsible_id', responsibleFilter)
    const qs = params.toString() ? `?${params}` : ''
    apiFetch(`/api/tasks${qs}`).then(setTasks)
  }

  useEffect(() => {
    loadTasks()
  }, [statusFilter, responsibleFilter])

  const marcas = [...new Set(tasks.map((t) => t.marca).filter(Boolean))].sort()

  return (
    <div className="tasks-layout v2-layout">
      <TaskForm onSaved={loadTasks} />
      <div className="card">
        <div className="page-header compact">
          <div>
            <h3>Lista de demandas</h3>
            <p>Acompanhe status, prioridade, bloqueios e abra o detalhe completo.</p>
          </div>
          <div className="header-controls">
            {isGestor && (
              <select value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)}>
                <option value="">Todos os responsáveis</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
            <select value={marcaFilter} onChange={(e) => setMarcaFilter(e.target.value)}>
              <option value="">Todas as marcas</option>
              {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="NOVA">Nova</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANALISE">Em análise</option>
              <option value="EM_EXECUCAO">Em andamento</option>
              <option value="AGUARDANDO_TERCEIRO">Aguardando terceiro</option>
              <option value="BLOQUEADA">Bloqueada</option>
              <option value="EM_VALIDACAO">Em validação</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
            <button
              className="export-btn export-btn-excel"
              onClick={() => handleExport('excel')}
              disabled={exporting !== null}
              title="Exportar para Excel"
            >
              {exporting === 'excel' ? 'Exportando…' : 'Excel'}
            </button>
            <button
              className="export-btn export-btn-pdf"
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              title="Exportar para PDF"
            >
              {exporting === 'pdf' ? 'Exportando…' : 'PDF'}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Solicitante</th>
                <th>Marca</th>
                <th>Data solicitação</th>
                <th>Data entrega</th>
                <th>Status</th>
                <th>Motivo Status</th>
                <th>Obs</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.filter((t) => !marcaFilter || t.marca === marcaFilter).map((task) => (
                <tr key={task.id} className={isOverdue(task) ? 'row-overdue' : ''}>
                  <td>
                    {isOverdue(task) && <span className="overdue-dot" title="Prazo vencido" />}
                    <strong>{task.title}</strong>
                  </td>
                  <td>{task.requester || <span className="muted-val">—</span>}</td>
                  <td>{task.marca ? <span className="pill pill-marca">{task.marca}</span> : <span className="muted-val">—</span>}</td>
                  <td>{task.request_date || <span className="muted-val">—</span>}</td>
                  <td><DueDate task={task} /></td>
                  <td><span className={`pill status-${task.status.toLowerCase()}`}>{STATUS_LABELS[task.status] ?? task.status}</span></td>
                  <td className="col-motivo">{task.blocking_reason || <span className="muted-val">—</span>}</td>
                  <td className="col-obs">{task.observations || <span className="muted-val">—</span>}</td>
                  <td>
                    <div className="actions-inline">
                      <button className="ghost-btn" onClick={() => navigate(`/tasks/${task.id}`)}>Detalhe</button>
                      <button className="ghost-btn" onClick={() => setSelectedTask(task)}>Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <TaskForm mode="edit" task={selectedTask} onSaved={() => { setSelectedTask(null); loadTasks() }} onCancel={() => setSelectedTask(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
