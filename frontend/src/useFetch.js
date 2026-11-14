import {useEffect, useState} from 'react'
import {apiFetch} from './api'

// GET a path and report {data, status, loading}. Pass null to wait.
const useFetch = path => {
  const [state, setState] = useState({data: null, status: 0, loading: path !== null})
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (path === null) return undefined
    let live = true
    setState(s => ({...s, loading: true}))
    apiFetch(path)
      .then(async r => {
        const body = r.status === 204 ? null : await r.json().catch(() => null)
        if (live) setState({data: body, status: r.status, loading: false})
      })
      .catch(() => live && setState({data: null, status: 0, loading: false}))
    return () => { live = false }
  }, [path, tick])

  return {...state, reload: () => setTick(t => t + 1)}
}

export default useFetch
