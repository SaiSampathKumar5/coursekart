import Cookies from 'js-cookie'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL
export const apiUrl = path => `${BASE_URL}${path}`

const ACCESS_TOKEN_KEY = 'jwt_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const getAccessToken = () => Cookies.get(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY)

export const saveTokens = ({access, refresh}) => {
  Cookies.set(ACCESS_TOKEN_KEY, access, {expires: 30})
  Cookies.set(REFRESH_TOKEN_KEY, refresh, {expires: 30})
}

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

export const apiFetch = (path, options = {}) => {
  const token = getAccessToken()
  const headers = {'Content-Type': 'application/json', ...(options.headers || {})}
  // No token = no header at all (a visitor). "Bearer undefined" would be refused with 401.
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(apiUrl(path), {...options, headers})
}

// The access token carries the username and role; read them without a screen touching cookies.
export const getCurrentUser = () => {
  const token = getAccessToken()
  if (token === undefined) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return {username: payload.username, userType: payload.user_type}
  } catch {
    return null
  }
}

// One error reader for both shapes: {"detail": "..."} and {"username": ["..."]}
export const getErrorMessage = body => {
  if (!body || typeof body !== 'object') return 'Something went wrong. Please try again.'
  if (typeof body.detail === 'string') return body.detail
  const first = Object.entries(body)[0]
  if (!first) return 'Something went wrong. Please try again.'
  const [field, msg] = first
  const text = Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? getErrorMessage(msg) : msg
  return field === 'non_field_errors' || field === 'detail' ? text : `${field}: ${text}`
}

export const money = n => `₹${Number(n).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})}`
export const ACADEMIES = [
  'CodeCraft Academy', 'ByteBridge Institute', 'DevForge School', 'PixelForge Studio', 'Canvas & Co Academy',
  'Hue Labs', 'DataNest Institute', 'InsightWorks Academy', 'Vector Labs', 'BizSpring Academy',
  'Ledger & Lane School', 'Summit Business Institute',
]
export const CATEGORIES = ['Programming', 'Design', 'Data Science', 'Business', 'Music']
