import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

const BLOCKED = ['BLOQUEADA', 'AGUARDANDO_TERCEIRO']

const columns = [
  ['NOVA', 'Nova'],
  ['PENDENTE', 'Pendente'],
  ['EM_ANALISE', 'Em análise'],
  ['EM_EXECUCAO', 'Em andamento'],
  ['AGUARDANDO_TERCEIRO', 'Aguardando terceiro'],
  ['BLOQUEADA', 'Bloqueada'],
  ['EM_VALIDACAO', 'Em validação'],
  ['CONCLUIDA', 'Concluída'],
]

export default function KanbanPage() {
  const [tasks, setTasks] = useState([])
  const [dragOverCol, setDragOverCol] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const dragTaskId = useRef(null)
  const gridRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch('/api/tasks').then(setTasks)
  }, [])

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const onWheel = (e) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function handleDragStart(e, taskId) {
    dragTaskId.current = taskId
    setDraggingId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverCol(null)
  }

  function handleDragOver(e, colKey) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colKey)
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null)
  }

  async function handleDrop(e, targetStatus) {
    e.preventDefault()
    setDragOverCol(null)
    setDraggingId(null)

    const taskId = dragTaskId.current
    dragTaskId.current = null
    if (!taskId) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === targetStatus) return

    let blocking_reason = task.blocking_reason || null
    if (BLOCKED.includes(targetStatus) && !blocking_reason) {
      blocking_reason = window.prompt('Informe o motivo do bloqueio:')
      if (!blocking_reason?.trim()) return
      blocking_reason = blocking_reason.trim()
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: targetStatus, blocking_reason: BLOCKED.includes(targetStatus) ? blocking_reason : null }
          : t
      )
    )

    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: targetStatus,
          blocking_reason: BLOCKED.includes(targetStatus) ? blocking_reason : null,
          comment: `Status movido para "${targetStatus}" via Kanban`,
        }),
      })
    } catch {
      apiFetch('/api/tasks').then(setTasks)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Kanban</h2>
          <p>Visão visual das demandas por etapa.</p>
        </div>
      </div>
      <div className="kanban-grid" ref={gridRef}>
        {columns.map(([key, label]) => (
          <div
            key={key}
            className={`kanban-column${dragOverCol === key ? ' kanban-drop-active' : ''}`}
            onDragOver={(e) => handleDragOver(e, key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, key)}
          >
            <div className="kanban-title">{label}</div>
            {tasks
              .filter((t) => t.status === key)
              .map((task) => (
                <button
                  key={task.id}
                  className={`kanban-card card-button${draggingId === task.id ? ' kanban-card--dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <strong>{task.title}</strong>
                  <span>{task.task_type}</span>
                  <small>{task.priority}</small>
                  <small>{task.responsible_name || 'Sem responsável'}</small>
                  {task.blocking_reason && <p>{task.blocking_reason}</p>}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
