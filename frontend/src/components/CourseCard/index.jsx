import {Link} from 'react-router'
import {money} from '../../api'

const CourseCard = ({course}) => (
  <Link to={`/courses/${course.id}`} className="card course-card">
    <img src={course.imageUrl} alt="" loading="lazy" />
    <div className="card-body">
      {course.is_pro && <span className="pro-tag">Pro Bundle</span>}
      <h3>{course.title}</h3>
      <p className="muted">{course.academy}</p>
      <p className="muted small">{course.level} · {course.duration_hours}h of video</p>
      <div className="row between">
        <strong>{money(course.price)}</strong>
        <span className="rating">★ {course.rating}</span>
      </div>
    </div>
  </Link>
)
export default CourseCard
