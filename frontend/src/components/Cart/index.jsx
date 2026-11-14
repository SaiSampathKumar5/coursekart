import {useContext} from 'react'
import {Link, useNavigate} from 'react-router'
import {money} from '../../api'
import AppContext from '../../context'

const Cart = () => {
  const {cartItems, cartTotal, updateQuantity, removeFromCart} = useContext(AppContext)
  const navigate = useNavigate()
  if (cartItems.length === 0) {
    return <div className="empty"><h2>Your cart is empty</h2><Link className="btn" to="/courses">Browse courses</Link></div>
  }
  return (
    <div className="stack">
      <h1>Your cart</h1>
      {cartItems.map(i => (
        <div key={i.rowId} className="panel row between">
          <div><Link to={`/courses/${i.courseId}`}><strong>{i.title}</strong></Link>
            <p className="muted small">{i.level} · {money(i.price)} per seat</p></div>
          <div className="row">
            <button className="btn ghost" aria-label="Fewer seats" onClick={() => updateQuantity(i.rowId, i.quantity - 1)} disabled={i.quantity <= 1}>−</button>
            <span>{i.quantity}</span>
            <button className="btn ghost" aria-label="More seats" onClick={() => updateQuantity(i.rowId, i.quantity + 1)}>+</button>
            <strong>{money(i.price * i.quantity)}</strong>
            <button className="btn danger" onClick={() => removeFromCart(i.rowId)}>Remove</button>
          </div>
        </div>
      ))}
      <div className="row between">
        <h2>Total {money(cartTotal)}</h2>
        <button className="btn" onClick={() => navigate('/checkout')}>Checkout</button>
      </div>
    </div>
  )
}
export default Cart
