const API_BASE = ''

export function getToken() {
  return localStorage.getItem('taskflow_token') || ''
}

export function setSession(session) {
  localStorage.setItem('taskflow_token', session.access_token)
  localStorage.setItem('taskflow_user', JSON.stringify(session.user))
}

export function clearSession() {
  localStorage.removeItem('taskflow_token')
  localStorage.removeItem('taskflow_user')
}

export function getStoredUser() {
  const raw = localStorage.getItem('taskflow_user')
  return raw ? JSON.parse(raw) : null
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    const error = await response.json().catch(() => ({ detail: 'Não autorizado' }))
    if (token) {
      clearSession()
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    throw new Error(error.detail || 'Credenciais inválidas')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro inesperado' }))
    throw new Error(typeof error.detail === 'string' ? error.detail : 'Erro na requisição')
  }

  if (response.status === 204) return null
  return response.json()
}

export async function apiDownload(path) {
  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { headers })

  if (!response.ok) {
    throw new Error('Erro ao exportar')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const disposition = response.headers.get('Content-Disposition')
  const match = disposition?.match(/filename=(.+)/)
  a.download = match ? match[1] : 'export'
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
