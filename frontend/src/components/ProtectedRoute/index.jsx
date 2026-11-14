import {useContext} from 'react'
import {Navigate, Outlet} from 'react-router'
import AppContext from '../../context'

const ProtectedRoute = () => {
  const {user} = useContext(AppContext)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
export default ProtectedRoute
