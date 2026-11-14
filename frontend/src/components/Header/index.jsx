import {useContext} from 'react'
import {Link, NavLink, useNavigate} from 'react-router'
import {FaShoppingCart} from 'react-icons/fa'
import AppContext from '../../context'

const Header = () => {
  const {user, logout, cartCount} = useContext(AppContext)
  const navigate = useNavigate()
  const onLogout = async () => { await logout(); navigate('/login') }
  return (
    <header className="header">
      <Link to="/" className="brand">CourseKart</Link>
      <nav>
        <NavLink to="/courses">Courses</NavLink>
        {user && <NavLink to="/orders">My orders</NavLink>}
        {user?.userType === 'instructor' && <NavLink to="/instructor">Instructor</NavLink>}
      </nav>
      <div className="row">
        {user ? (
          <>
            <Link to="/cart" className="cart-link" aria-label="Cart"><FaShoppingCart /> {cartCount}</Link>
            <span className="muted small">{user.username}</span>
            <button className="btn ghost" onClick={onLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">Log in</Link>
            <Link className="btn" to="/register">Create account</Link>
          </>
        )}
      </div>
    </header>
  )
}
export default Header
