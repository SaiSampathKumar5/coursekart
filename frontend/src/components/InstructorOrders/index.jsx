import {useState} from 'react'
import {apiFetch, getErrorMessage, money} from '../../api'
import useFetch from '../../useFetch'
import InstructorOnly from '../InstructorOnly'
import Loader from '../Loader'
import Pager from '../Pager'
import StatusBadge from '../StatusBadge'

const FORWARD = {placed: ['shipped', 'Grant access'], shipped: ['delivered', 'Issue certificate']}

const Body = () => {
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const {data, loading, reload} = useFetch(`/api/instructor/orders/?page=${page}`)

  const advance = async (item, next) => {
    const response = await apiFetch(`/api/instructor/orders/${item.id}/`, {method: 'PATCH', body: JSON.stringify({status: next})})
    if (response.ok) reload(); else setError(getErrorMessage(await response.json()))
  }
  if (loading) return <Loader />
  return (
    <div className="stack">
      <h1>Instructor orders</h1>
      {error && <p className="error">{error}</p>}
      {!data?.results?.length ? <div className="empty"><h3>No sales yet</h3><p className="muted">Orders containing your courses appear here.</p></div> : (
        <>
          {data.results.map(i => (
            <div key={i.id} className="panel row between">
              <div><strong>#{i.order_id} · {i.course_title}</strong>
                <p className="muted small">{i.learner} · {i.quantity} seats · {money(i.amount)}</p></div>
              <div className="row"><StatusBadge status={i.status} />
                {FORWARD[i.status] && <button className="btn" onClick={() => advance(i, FORWARD[i.status][0])}>{FORWARD[i.status][1]}</button>}</div>
            </div>))}
          <Pager page={page} totalPages={data.total_pages} onChange={setPage} />
        </>)}
    </div>
  )
}
const InstructorOrders = () => <InstructorOnly><Body /></InstructorOnly>
export default InstructorOrders
