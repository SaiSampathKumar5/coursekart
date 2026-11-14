import {useState} from 'react'
import {Link} from 'react-router'
import {apiFetch, getErrorMessage, money} from '../../api'
import useFetch from '../../useFetch'
import InstructorOnly from '../InstructorOnly'
import Loader from '../Loader'
import Pager from '../Pager'

const Body = () => {
  const [typing, setTyping] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const {data, loading, reload} = useFetch(`/api/instructor/courses/?page=${page}&search=${encodeURIComponent(search)}`)

  const remove = async c => {
    if (!window.confirm(`Delete "${c.title}"?`)) return
    const response = await apiFetch(`/api/courses/${c.id}/`, {method: 'DELETE'}) // 204, no body
    if (response.status === 204) reload(); else setError(getErrorMessage(await response.json()))
  }

  return (
    <div className="stack">
      <div className="row between"><h1>My courses</h1><Link className="btn" to="/instructor/courses/new">Add Course</Link></div>
      <input className="search" placeholder="Search your courses, then press Enter" value={typing}
        onChange={e => setTyping(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setSearch(typing); setPage(1) } }} />
      {error && <p className="error">{error}</p>}
      {loading ? <Loader /> : !data?.results?.length ? <div className="empty"><h3>No courses yet</h3><p className="muted">Add your first course to start selling seats.</p></div> : (
        <>
          {data.results.map(c => (
            <div key={c.id} className="panel row between">
              <div className="row"><img className="thumb" src={c.image_url} alt="" />
                <div><strong>{c.title}</strong><p className="muted small">{c.category} · {c.level} · {money(c.price)} · {c.availability}{c.is_pro ? ' · Pro' : ''}</p></div></div>
              <div className="row"><Link className="btn ghost" to={`/instructor/courses/${c.id}/edit`}>Edit</Link>
                <button className="btn danger" onClick={() => remove(c)}>Delete</button></div>
            </div>))}
          <Pager page={page} totalPages={data.total_pages} onChange={setPage} />
        </>)}
    </div>
  )
}
const MyCourses = () => <InstructorOnly><Body /></InstructorOnly>
export default MyCourses
