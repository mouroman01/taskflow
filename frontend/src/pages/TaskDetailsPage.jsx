import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskForm from '../components/TaskForm'
import { apiFetch } from '../lib/api'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-BR')
}

export default function TaskDetailsPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [editing, setEditing] = useState(false)

  async function loadTask() {
    const result = await apiFetch(`/api/tasks/${taskId}`)
    setData(result)
  }

  useEffect(() => {
    loadTask()
  }, [taskId])

  if (!data) return <div>Carregando demanda...</div>

  const { task, updates } = data

  return (
    <div className="details-layout">
      <div className="card detail-card">
        <div className="page-header compact">
          <div>
            <h2>{task.title}</h2>
            <p>Detalhes completos da demanda e histórico de movimentação.</p>
          </div>
          <div className="actions-inline">
            <button className="ghost-btn" onClick={() => navigate('/tasks')}>Voltar</button>
            <button onClick={() => setEditing((prev) => !prev)}>{editing ? 'Ocultar edição' : 'Editar demanda'}</button>
          </div>
        </div>
        <div className="details-grid">
          <div><strong>Tipo:</strong><span>{task.task_type}</span></div>
          <div><strong>Prioridade:</strong><span>{task.priority}</span></div>
          <div><strong>Status:</strong><span>{task.status}</span></div>
          <div><strong>Solicitante:</strong><span>{task.requester || '-'}</span></div>
          <div><strong>Responsável:</strong><span>{task.responsible_name || '-'}</span></div>
          <div><strong>Área:</strong><span>{task.department_name || '-'}</span></div>
          <div><strong>Prazo:</strong><span>{task.due_date || '-'}</span></div>
          <div><strong>Área bloqueadora:</strong><span>{task.blocking_department_name || '-'}</span></div>
        </div>
        <div className="detail-section">
          <h3>Descrição</h3>
          <p>{task.description || '-'}</p>
        </div>
        <div className="detail-section">
          <h3>Bloqueio</h3>
          <p><strong>Motivo:</strong> {task.blocking_reason || '-'}</p>
          <p><strong>Aguardando desde:</strong> {task.waiting_since || '-'}</p>
        </div>
        <div className="detail-section">
          <h3>Observações</h3>
          <p>{task.observations || '-'}</p>
        </div>
      </div>
      <div className="details-side">
        {editing && (
          <TaskForm mode="edit" task={task} onSaved={() => { setEditing(false); loadTask() }} onCancel={() => setEditing(false)} />
        )}
        <div className="card">
          <h3>Histórico visível</h3>
          <div className="history-list">
            {updates.length === 0 && <p>Nenhuma atualização registrada.</p>}
            {updates.map((item) => (
              <div className="history-item" key={item.id}>
                <div className="history-top">
                  <strong>{item.user_name || 'Sistema'}</strong>
                  <span>{formatDate(item.created_at)}</span>
                </div>
                <p>{item.comment}</p>
                <small>{item.old_status || '-'} → {item.new_status || '-'}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
