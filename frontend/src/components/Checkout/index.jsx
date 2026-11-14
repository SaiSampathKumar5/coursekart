import {useContext, useState} from 'react'
import {Link, useNavigate} from 'react-router'
import {apiFetch, getErrorMessage, money} from '../../api'
import AppContext from '../../context'

const FIELDS = [['full_name', 'Full name'], ['phone', 'Phone (10 digits)'], ['address', 'Address'],
  ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode (6 digits)']]

const Checkout = () => {
  const {cartItems, cartTotal, getCart} = useContext(AppContext)
  const [address, setAddress] = useState(Object.fromEntries(FIELDS.map(([k]) => [k, ''])))
  const [payment, setPayment] = useState('COD')
  const [invoice, setInvoice] = useState('PERSONAL')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (cartItems.length === 0) return <div className="empty"><h2>Nothing to check out</h2><Link className="btn" to="/courses">Browse courses</Link></div>

  const place = async e => {
    e.preventDefault()
    setError('')
    // Only three things go to the server: payment, invoice type, address. Never the cart or total.
    const response = await apiFetch('/api/orders/', {
      method: 'POST', body: JSON.stringify({payment_method: payment, invoice_type: invoice, address}),
    })
    const body = await response.json()
    if (response.status === 201) { await getCart(); navigate(`/orders/${body.id}`) }
    else setError(getErrorMessage(body))
  }

  return (
    <form className="layout" onSubmit={place}>
      <div className="panel stack grow">
        <h1>Checkout</h1>
        {FIELDS.map(([k, label]) => (
          <label key={k}>{label}<input value={address[k]} required onChange={e => setAddress({...address, [k]: e.target.value})} /></label>
        ))}
        <h3>Payment</h3>
        <label className="radio"><input type="radio" checked={payment === 'COD'} onChange={() => setPayment('COD')} />Pay Later</label>
        <label className="radio"><input type="radio" checked={payment === 'ONLINE'} onChange={() => setPayment('ONLINE')} />Pay Now</label>
        <h3>Invoice</h3>
        <label className="radio"><input type="radio" checked={invoice === 'PERSONAL'} onChange={() => setInvoice('PERSONAL')} />Personal</label>
        <label className="radio"><input type="radio" checked={invoice === 'COMPANY'} onChange={() => setInvoice('COMPANY')} />Company</label>
      </div>
      <aside className="panel stack summary">
        <h3>Your order</h3>
        {cartItems.map(i => <div key={i.rowId} className="row between small"><span>{i.title} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>)}
        <h2>Total {money(cartTotal)}</h2>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Place Order</button>
      </aside>
    </form>
  )
}
export default Checkout
