import {Link} from 'react-router'
import {money} from '../../api'
import useFetch from '../../useFetch'
import InstructorOnly from '../InstructorOnly'
import Loader from '../Loader'
import StatusBadge from '../StatusBadge'

const Body = () => {
  const {data: d, loading, status} = useFetch('/api/instructor/dashboard/')
  if (loading) return <Loader />
  if (status !== 200) return <p className="error">Could not load the dashboard.</p>
  const max = Math.max(1, ...d.last_7_days.map(x => Number(x.revenue)))
  const cards = [['Courses', d.total_courses], ['Orders', d.total_orders], ['Seats sold', d.total_seats], ['Revenue', money(d.total_revenue)]]
  return (
    <div className="stack">
      <div className="row between"><h1>Dashboard</h1>
        <div className="row"><Link className="btn ghost" to="/instructor/courses">My courses</Link><Link className="btn ghost" to="/instructor/orders">Orders</Link></div></div>
      <div className="grid4">{cards.map(([k, v]) => <div key={k} className="panel stat"><p className="muted small">{k}</p><strong className="big">{v}</strong></div>)}</div>
      <div className="banner">{d.to_grant} {d.to_grant === 1 ? 'item is' : 'items are'} still waiting for you to grant access. <Link to="/instructor/orders">Open orders</Link></div>
      <div className="panel"><h3>Revenue, last 7 days</h3>
        <div className="chart">{d.last_7_days.map(x => (
          <div key={x.date} className="bar-col" title={`${x.date}: ${money(x.revenue)}`}>
            <div className="bar" style={{height: `${(Number(x.revenue) / max) * 100}%`}} data-testid="bar" /><span className="small muted">{x.label}</span>
          </div>))}</div></div>
      <div className="layout">
        <div className="panel grow"><h3>Top courses</h3>
          {d.top_courses.length === 0 ? <p className="muted">No sales yet.</p> : d.top_courses.map(t => (
            <div key={t.title} className="row between small"><span>{t.title}</span><span>{t.seats} seats · {money(t.revenue)}</span></div>))}</div>
        <div className="panel grow"><h3>Items by status</h3>
          {Object.entries(d.by_status).map(([s, n]) => <div key={s} className="row between"><StatusBadge status={s} /><strong>{n}</strong></div>)}</div>
      </div>
    </div>
  )
}
const Dashboard = () => <InstructorOnly><Body /></InstructorOnly>
export default Dashboard
