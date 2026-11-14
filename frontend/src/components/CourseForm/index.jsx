import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import {ACADEMIES, CATEGORIES, apiFetch, getErrorMessage} from '../../api'
import InstructorOnly from '../InstructorOnly'
import Loader from '../Loader'

const EMPTY = {title: '', academy: ACADEMIES[0], level: 'Beginner', duration_hours: 1, category: 'Programming',
  price: '', imageUrl: '', availability: 'Open', description: '', is_pro: false}

const Body = () => {
  const {id} = useParams()
  const editing = Boolean(id)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!editing) return
    apiFetch(`/api/courses/${id}/`).then(async r => {
      if (r.ok) { const c = await r.json(); setForm(Object.fromEntries(Object.keys(EMPTY).map(k => [k, c[k]]))) }
      else setError('Could not load this course.')
      setLoading(false)
    })
  }, [id, editing])

  const set = k => e => setForm({...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value})

  const save = async e => {
    e.preventDefault()
    setError('')
    const response = await apiFetch(editing ? `/api/courses/${id}/` : '/api/courses/', {
      method: editing ? 'PATCH' : 'POST', body: JSON.stringify(form), // the owner comes from the token, never from here
    })
    const body = await response.json()
    if (response.ok) navigate('/instructor/courses'); else setError(getErrorMessage(body))
  }

  if (loading) return <Loader />
  return (
    <form className="panel narrow stack" onSubmit={save}>
      <h1>{editing ? 'Edit course' : 'Add course'}</h1>
      <label>Title<input value={form.title} onChange={set('title')} required /></label>
      <label>Academy<select value={form.academy} onChange={set('academy')}>{ACADEMIES.map(a => <option key={a}>{a}</option>)}</select></label>
      <label>Level<select value={form.level} onChange={set('level')}>{['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}</select></label>
      <label>Hours of video<input type="number" min="1" value={form.duration_hours} onChange={set('duration_hours')} required /></label>
      <label>Subject<select value={form.category} onChange={set('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Price of one seat (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required /></label>
      <label>Image address<input type="url" value={form.imageUrl} onChange={set('imageUrl')} /></label>
      <label>Availability<select value={form.availability} onChange={set('availability')}><option>Open</option><option>Closed</option></select></label>
      <label>Description<textarea rows="4" value={form.description} onChange={set('description')} /></label>
      <label className="radio"><input type="checkbox" checked={form.is_pro} onChange={set('is_pro')} />Pro bundle (members only)</label>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">Save</button>
    </form>
  )
}
const CourseForm = () => <InstructorOnly><Body /></InstructorOnly>
export default CourseForm
