import {Link} from 'react-router'

const NotFound = () => (
  <div className="center stack">
    <h1>Page not found</h1>
    <p className="muted">That address does not lead anywhere in CourseKart.</p>
    <Link className="btn" to="/courses">Browse courses</Link>
  </div>
)
export default NotFound
