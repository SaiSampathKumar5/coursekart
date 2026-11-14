import {useCallback, useEffect, useState} from 'react'
import {Route, Routes} from 'react-router'
import {apiFetch, clearTokens, getCurrentUser, getRefreshToken} from './api'
import AppContext from './context'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import Login from './components/Login'
import RegisterForm from './components/RegisterForm'
import Courses from './components/Courses'
import CourseDetails from './components/CourseDetails'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import Orders from './components/Orders'
import OrderDetails from './components/OrderDetails'
import Dashboard from './components/Dashboard'
import MyCourses from './components/MyCourses'
import CourseForm from './components/CourseForm'
import InstructorOrders from './components/InstructorOrders'
import NotFound from './components/NotFound'

// The row id (needed by PATCH/DELETE) and the course id (needed by add) stay apart from here on.
const formatCartItem = row => ({
  rowId: row.id,
  courseId: row.course,
  title: row.course_title,
  level: row.course_level,
  price: Number(row.course_price), // money arrives as text; make it a number once
  quantity: row.quantity,
})

const App = () => {
  const [user, setUser] = useState(getCurrentUser())
  const [cartItems, setCartItems] = useState([])

  const getCart = useCallback(async () => {
    if (getCurrentUser() === null) return setCartItems([])
    const response = await apiFetch('/api/cart/')
    if (response.ok) setCartItems((await response.json()).items.map(formatCartItem))
  }, [])

  useEffect(() => { getCart() }, [user, getCart])

  // add, remove, update all do the same thing: tell the server, then ask for the cart again.
  const addToCart = async (courseId, quantity = 1) => {
    const response = await apiFetch('/api/cart/add/', {method: 'POST', body: JSON.stringify({course: courseId, quantity})})
    const body = await response.json()
    if (response.ok) await getCart()
    return {ok: response.ok, body}
  }
  const removeFromCart = async rowId => {
    await apiFetch(`/api/cart/items/${rowId}/`, {method: 'DELETE'}) // 204: no body to read
    await getCart()
  }
  const updateQuantity = async (rowId, quantity) => {
    if (quantity < 1) return
    await apiFetch(`/api/cart/items/${rowId}/`, {method: 'PATCH', body: JSON.stringify({quantity})}) // sets, not adds
    await getCart()
  }

  const onLogin = () => setUser(getCurrentUser())
  const logout = async () => {
    // Tell the server first; clear the cookies only after it answers.
    await apiFetch('/api/users/logout/', {method: 'POST', body: JSON.stringify({refresh: getRefreshToken()})})
    clearTokens()
    setUser(null)
    setCartItems([])
  }

  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0)
  const cartTotal = cartItems.reduce((n, i) => n + i.price * i.quantity, 0)

  return (
    <AppContext.Provider value={{user, onLogin, logout, cartItems, cartCount, cartTotal, getCart, addToCart, removeFromCart, updateQuantity}}>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/instructor" element={<Dashboard />} />
            <Route path="/instructor/courses" element={<MyCourses />} />
            <Route path="/instructor/courses/new" element={<CourseForm />} />
            <Route path="/instructor/courses/:id/edit" element={<CourseForm />} />
            <Route path="/instructor/orders" element={<InstructorOrders />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </AppContext.Provider>
  )
}

export default App
