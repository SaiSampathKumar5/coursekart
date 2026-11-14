import {useState} from 'react'
import {Link, useNavigate} from 'react-router'
import {apiFetch, getErrorMessage} from '../../api'

const RegisterForm = () => {
  const [form, setForm] = useState({username: '', email: '', password: '', confirmPassword: '', user_type: 'learner'})
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const set = k => e => setForm({...form, [k]: e.target.value})

  const submit = async e => {
    e.preventDefault()
    setError('')
    // The one rule that never reaches the server: both passwords must match.
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    const {username, email, password, user_type} = form // confirmPassword is not sent
    const response = await apiFetch('/api/users/register/', {
      method: 'POST', body: JSON.stringify({username, email, password, user_type}),
    })
    const body = await response.json()
    if (response.ok) navigate('/login') // 201 gives a message, not tokens
    else setError(getErrorMessage(body)) // register errors arrive as {field: [..]}
  }

  return (
    <form className="panel narrow stack" onSubmit={submit}>
      <h1>Create your account</h1>
      <label>Username<input value={form.username} onChange={set('username')} required /></label>
      <label>Email (optional)<input type="email" value={form.email} onChange={set('email')} /></label>
      <label>Password<input type="password" value={form.password} onChange={set('password')} required minLength={6} /></label>
      <label>Confirm password<input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required /></label>
      <label>I want to
        <select value={form.user_type} onChange={set('user_type')}>
          <option value="learner">Learn (buy courses)</option>
          <option value="instructor">Teach (sell courses)</option>
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">Create account</button>
      <p className="muted small">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  )
}
export default RegisterForm
