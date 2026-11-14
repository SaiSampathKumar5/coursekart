import {useContext, useState} from 'react'
import {Link, useNavigate} from 'react-router'
import {apiFetch, getErrorMessage, saveTokens} from '../../api'
import AppContext from '../../context'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const {onLogin} = useContext(AppContext)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError('')
    const response = await apiFetch('/api/users/login/', {method: 'POST', body: JSON.stringify({username, password})})
    const body = await response.json()
    if (response.ok) {
      saveTokens(body)
      onLogin()
      navigate('/courses')
    } else {
      setError(getErrorMessage(body)) // login errors arrive as {detail}
    }
  }

  return (
    <form className="panel narrow stack" onSubmit={submit}>
      <h1>Log in</h1>
      <label>Username<input value={username} onChange={e => setUsername(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">Log in</button>
      <p className="muted small">New here? <Link to="/register">Create an account</Link></p>
    </form>
  )
}
export default Login
