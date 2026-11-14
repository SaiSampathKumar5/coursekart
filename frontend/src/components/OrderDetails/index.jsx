import {useState} from 'react'
import {Link, useParams} from 'react-router'
import {apiFetch, getErrorMessage, money} from '../../api'
import useFetch from '../../useFetch'
import Loader from '../Loader'
import StatusBadge from '../StatusBadge'

const OrderDetails = () => {
  const {id} = useParams()
  const {data: o, status, loading, reload} = useFetch(`/api/orders/${id}/`)
  const [error, setError] = useState('')
  if (loading) return <Loader />
  if (status === 404 || !o) return <div className="empty"><h2>Order not found</h2><Link to="/orders">Back to orders</Link></div>

  const cancel = async () => {
    const response = await apiFetch(`/api/orders/${id}/cancel/`, {method: 'POST'})
    if (response.ok) reload(); else setError(getErrorMessage(await response.json()))
  }
  const a = o.address
  return (
    <div className="stack">
      <div className="row between"><h1>Order #{o.id}</h1><StatusBadge status={o.status} /></div>
      {o.items.map(i => (
        <div key={i.id} className="panel row between">
          <div><strong>{i.title}</strong><p className="muted small">{i.academy} · {i.level} · {i.quantity} × {money(i.price)}</p></div>
          <div className="row"><strong>{money(i.subtotal)}</strong><StatusBadge status={i.status} /></div>
        </div>
      ))}
      <div className="layout">
        <div className="panel grow"><h3>Billing address</h3><p>{a.full_name}<br />{a.address}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p></div>
        <div className="panel grow"><h3>Payment</h3>
          <p>{o.payment_method === 'COD' ? 'Pay Later' : 'Pay Now'} · {o.is_paid ? 'Paid' : 'Not paid yet'}<br />
            Invoice: {o.invoice_type === 'COMPANY' ? 'Company' : 'Personal'}<br /><strong>Total {money(o.total_price)}</strong></p></div>
      </div>
      {error && <p className="error">{error}</p>}
      {o.can_cancel && o.status !== 'cancelled' && <button className="btn danger" onClick={cancel}>Cancel order</button>}
    </div>
  )
}
export default OrderDetails
