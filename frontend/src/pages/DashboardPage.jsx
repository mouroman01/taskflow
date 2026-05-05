import { useEffect, useState } from 'react'
import { BarChart, Bar, CartesianGrid, PieChart, Pie, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import KpiCard from '../components/KpiCard'
import { apiFetch, getStoredUser } from '../lib/api'

const piePalette = ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f59e0b', '#64748b']
const barPalette = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [workload, setWorkload] = useState([])
  const [pivot, setPivot] = useState(null)
  const [users, setUsers] = useState([])
  const [responsibleId, setResponsibleId] = useState('')
  const isGestor = getStoredUser()?.role === 'GESTOR'

  useEffect(() => {
    if (isGestor) apiFetch('/api/users').then(setUsers)
    apiFetch('/api/dashboard/workload').then(setWorkload)
    apiFetch('/api/dashboard/pivot').then(setPivot)
  }, [])

  useEffect(() => {
    const query = responsibleId ? `?responsible_id=${responsibleId}` : ''
    apiFetch(`/api/dashboard${query}`).then(setData)
  }, [responsibleId])

  const selectedUser = users.find((u) => String(u.id) === responsibleId)

  if (!data) return <div>Carregando dashboard...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{selectedUser ? `Dashboard — ${selectedUser.name}` : 'Dashboard gerencial'}</h2>
          <p>{selectedUser ? `Demandas atribuídas a ${selectedUser.name}.` : 'Visão rápida da operação da equipe.'}</p>
        </div>
        {isGestor && (
          <div className="dashboard-filter">
            <label className="filter-label">Responsável</label>
            <select
              className="filter-select"
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
            >
              <option value="">Toda a equipe</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="kpi-grid">
        <KpiCard title="Total de demandas" value={data.cards.total_tasks} />
        <KpiCard title="Bloqueadas" value={data.cards.blocked_tasks} />
        <KpiCard title="Concluídas" value={data.cards.completed_tasks} />
        <KpiCard title="Com prazo" value={data.cards.overdue_tasks} />
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <h3>Demandas por status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.by_status} dataKey="count" nameKey="status" outerRadius={90} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.by_status.map((entry, index) => (
                  <Cell key={entry.status} fill={piePalette[index % piePalette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Áreas que mais bloqueiam</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.by_blocking_department} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!responsibleId && (
        <div className="card chart-card">
          <h3>Demandas por responsável</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.by_responsible}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.by_responsible.map((_, i) => (
                  <Cell key={i} fill={barPalette[i % barPalette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {pivot && pivot.marcas.length > 0 && (
        <div className="card pivot-card">
          <h3>Demandas por Status × Marca</h3>
          <p className="pivot-subtitle">Distribuição consolidada de atividades por marca e status.</p>
          <table className="pivot-table">
            <thead>
              <tr>
                <th className="col-status">STATUS</th>
                {pivot.marcas.map((m) => <th key={m}>{m}</th>)}
                <th className="col-total">Total Geral</th>
              </tr>
            </thead>
            <tbody>
              {pivot.rows.map((row) => (
                <tr key={row.status}>
                  <td className="col-status">{row.status}</td>
                  {pivot.marcas.map((m) => (
                    <td key={m}>{row.counts[m] > 0 ? row.counts[m] : ''}</td>
                  ))}
                  <td className="col-total">{row.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="col-status"><strong>Total Geral</strong></td>
                {pivot.marcas.map((m) => (
                  <td key={m}><strong>{pivot.rows.reduce((s, r) => s + (r.counts[m] || 0), 0)}</strong></td>
                ))}
                <td className="col-total"><strong>{pivot.rows.reduce((s, r) => s + r.total, 0)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!responsibleId && workload.length > 0 && (
        <div className="card workload-card">
          <h3>Carga de trabalho por analista</h3>
          <p className="workload-subtitle">Visão consolidada de demandas abertas, bloqueios e atrasos por pessoa.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Analista</th>
                  <th>Em aberto</th>
                  <th>Bloqueadas</th>
                  <th>Atrasadas</th>
                  <th>Concluídas</th>
                  <th>Total</th>
                  <th>Progresso</th>
                </tr>
              </thead>
              <tbody>
                {workload.map((row) => {
                  const pct = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0
                  return (
                    <tr key={row.user_id}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.open}</td>
                      <td>
                        {row.blocked > 0
                          ? <span className="pill status-bloqueada">{row.blocked}</span>
                          : <span className="muted-val">—</span>}
                      </td>
                      <td>
                        {row.overdue > 0
                          ? <span className="pill status-bloqueada">{row.overdue} atrasada{row.overdue > 1 ? 's' : ''}</span>
                          : <span className="muted-val">—</span>}
                      </td>
                      <td><span className="pill status-concluida">{row.completed}</span></td>
                      <td><strong>{row.total}</strong></td>
                      <td>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                          <span className="progress-label">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
