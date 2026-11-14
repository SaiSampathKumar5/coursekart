import {Link} from 'react-router'

const Home = () => (
  <section className="hero">
    <h1>Learn the skill. Pay for the seats you need.</h1>
    <p className="muted">
      CourseKart is a course marketplace: browse by subject, academy and rating, buy seats for yourself or your
      team, and let instructors grant access.
    </p>
    <div className="row">
      <Link className="btn" to="/courses">Browse courses</Link>
      <Link className="btn ghost" to="/register">Create an account</Link>
    </div>
  </section>
)
export default Home
