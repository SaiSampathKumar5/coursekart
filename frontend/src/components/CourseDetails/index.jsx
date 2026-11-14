import {useContext, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router'
import {getErrorMessage, money} from '../../api'
import AppContext from '../../context'
import useFetch from '../../useFetch'
import CourseCard from '../CourseCard'
import Loader from '../Loader'

const CourseDetails = () => {
  const {id} = useParams()
  const {user, addToCart} = useContext(AppContext)
  const navigate = useNavigate()
  const [seats, setSeats] = useState(1)
  const [message, setMessage] = useState('')
  const {data: c, status, loading} = useFetch(`/api/courses/${id}/`)
  const similar = useFetch(c ? `/api/courses/?category=${encodeURIComponent(c.category)}&page_size=5` : null)

  if (loading) return <Loader />
  if (status === 401) return <div className="banner">This is a Pro Bundle. <Link to="/login">Log in</Link> to open it.</div>
  if (status === 404 || !c) return <div className="empty"><h3>Course not found</h3><Link to="/courses">Back to courses</Link></div>

  const add = async () => {
    if (!user) return navigate('/login')
    const {ok, body} = await addToCart(c.id, seats)
    setMessage(ok ? 'Added to your cart.' : getErrorMessage(body))
  }

  return (
    <>
      <article className="details">
        <img src={c.imageUrl} alt="" />
        <div className="stack">
          {c.is_pro && <span className="pro-tag">Pro Bundle</span>}
          <h1>{c.title}</h1>
          <p className="muted">{c.academy} · {c.level} · {c.duration_hours} hours of video</p>
          <p><strong className="big">{money(c.price)}</strong> <span className="muted">per seat</span></p>
          <p>★ {c.rating} <span className="muted">({c.total_reviews} reviews)</span> · {c.availability}</p>
          <p>{c.description}</p>
          <div className="row">
            <label className="row">Seats
              <input type="number" min="1" max="99" value={seats} className="seats"
                onChange={e => setSeats(Math.max(1, Number(e.target.value) || 1))} />
            </label>
            <button className="btn" disabled={c.availability !== 'Open'} onClick={add}>ADD TO CART</button>
          </div>
          {message && <p className={message.startsWith('Added') ? 'ok' : 'error'}>{message}</p>}
        </div>
      </article>
      <h2>Similar courses</h2>
      <div className="grid">
        {similar.data?.results?.filter(s => s.id !== c.id).slice(0, 4).map(s => <CourseCard key={s.id} course={s} />)}
      </div>
    </>
  )
}
export default CourseDetails
