import {useContext} from 'react'
import {Link} from 'react-router'
import AppContext from '../../context'

// Politeness only: the real lock is the 403 from Django.
const InstructorOnly = ({children}) => {
  const {user} = useContext(AppContext)
  if (user?.userType === 'instructor') return children
  return <div className="empty"><h2>Instructors only</h2><p className="muted">Log in with an instructor account to use this page.</p><Link className="btn" to="/courses">Back to courses</Link></div>
}
export default InstructorOnly
