import {useState} from 'react'
import {Link} from 'react-router'
import {money} from '../../api'
import useFetch from '../../useFetch'
import Loader from '../Loader'
import Pager from '../Pager'
import StatusBadge from '../StatusBadge'

const Orders = () => {
  const [page, setPage] = useState(1)
  const {data, loading} = useFetch(`/api/orders/?page=${page}`)
  if (loading) return <Loader />
  if (!data?.results?.length) return <div className="empty"><h2>No orders yet</h2><Link className="btn" to="/courses">Browse courses</Link></div>
  return (
    <div className="stack">
      <h1>My orders</h1>
      {data.results.map(o => (
        <div key={o.id} className="panel row between">
          <div>
            <strong>Order #{o.id}</strong> <StatusBadge status={o.status} />
            <p className="muted small">{new Date(o.created_at).toLocaleDateString()} · {o.total_items} seats</p>
          </div>
          <div className="row"><strong>{money(o.total_price)}</strong><Link className="btn ghost" to={`/orders/${o.id}`}>View Details</Link></div>
        </div>
      ))}
      <Pager page={page} totalPages={data.total_pages} onChange={setPage} />
    </div>
  )
}
export default Orders
