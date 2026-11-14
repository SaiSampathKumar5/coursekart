import {useState} from 'react'
import {Link} from 'react-router'
import {ACADEMIES, CATEGORIES} from '../../api'
import useFetch from '../../useFetch'
import CourseCard from '../CourseCard'
import Loader from '../Loader'
import Pager from '../Pager'

const Courses = () => {
  const [filters, setFilters] = useState({category: '', academy: '', rating: '', ordering: ''})
  const [typing, setTyping] = useState('')   // what is being typed
  const [search, setSearch] = useState('')   // what was submitted (Enter)
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({page, ...(search && {search}),
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v))})
  const list = useFetch(`/api/courses/?${params}`)
  const pro = useFetch('/api/courses/?is_pro=true&page_size=6')

  const change = (key, value) => { setFilters({...filters, [key]: value}); setPage(1) }
  const submitSearch = e => { if (e.key === 'Enter') { setSearch(typing); setPage(1) } }

  return (
    <>
      <section className="pro-strip">
        <h2>Pro Bundles</h2>
        {pro.loading ? <Loader /> : pro.status === 401 ? (
          <div className="banner">Pro Bundles are for members. <Link to="/login">Log in</Link> to see them.</div>
        ) : (
          <div className="strip">{pro.data?.results?.map(c => <CourseCard key={c.id} course={c} />)}</div>
        )}
      </section>

      <div className="layout">
        <aside className="panel stack filters">
          <h3>Subject</h3>
          {['', ...CATEGORIES].map(c => (
            <label key={c} className="radio"><input type="radio" checked={filters.category === c} onChange={() => change('category', c)} />{c || 'All subjects'}</label>
          ))}
          <h3>Academy</h3>
          <select value={filters.academy} onChange={e => change('academy', e.target.value)}>
            <option value="">All academies</option>
            {ACADEMIES.map(a => <option key={a}>{a}</option>)}
          </select>
          <h3>Rating</h3>
          <select value={filters.rating} onChange={e => change('rating', e.target.value)}>
            <option value="">Any rating</option>
            {[4, 3, 2, 1].map(r => <option key={r} value={r}>{r} and up</option>)}
          </select>
        </aside>

        <section className="grow">
          <div className="row between toolbar">
            <input className="search" placeholder="Search title or academy, then press Enter" value={typing}
              onChange={e => setTyping(e.target.value)} onKeyDown={submitSearch} />
            <select value={filters.ordering} onChange={e => change('ordering', e.target.value)}>
              <option value="">Sort: Featured</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Rating: High to Low</option>
            </select>
          </div>
          {list.loading ? <Loader /> : list.status !== 200 ? (
            <p className="error">Could not load courses.</p>
          ) : list.data.results.length === 0 ? (
            <div className="empty"><h3>No courses found</h3><p className="muted">Try another subject, or clear the search.</p></div>
          ) : (
            <>
              <p className="muted small">{list.data.count} courses</p>
              <div className="grid">{list.data.results.map(c => <CourseCard key={c.id} course={c} />)}</div>
              <Pager page={page} totalPages={list.data.total_pages} onChange={setPage} />
            </>
          )}
        </section>
      </div>
    </>
  )
}
export default Courses
