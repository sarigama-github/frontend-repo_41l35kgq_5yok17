import { useEffect, useState } from 'react'

const defaultSettings = {
  ad_blocker_enabled: true,
  phishing_protection_enabled: true,
  download_scanner_enabled: true,
  behavior_detector_enabled: true,
}

export default function Dashboard() {
  const [userId, setUserId] = useState('demo-user')
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const load = async () => {
    setLoading(true)
    try {
      const s = await fetch(`${baseUrl}/api/settings?user_id=${userId}`).then(r => r.json())
      setSettings({ ...defaultSettings, ...s })
      const l = await fetch(`${baseUrl}/api/logs?user_id=${userId}&limit=50`).then(r => r.json())
      setLogs(l.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = async (key) => {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...next })
    })
  }

  const score = 25 * [
    settings.ad_blocker_enabled,
    settings.phishing_protection_enabled,
    settings.download_scanner_enabled,
    settings.behavior_detector_enabled,
  ].filter(Boolean).length

  return (
    <section id="dashboard" className="relative py-12 bg-slate-900 text-emerald-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Dashboard</h2>
          <div className="text-sm text-emerald-300/80">Weekly safety score: <span className="font-bold text-emerald-400">{score}</span></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-lg font-semibold mb-4">Protection toggles</h3>
            {Object.entries({
              ad_blocker_enabled: 'Ad blocker',
              phishing_protection_enabled: 'Phishing protection',
              download_scanner_enabled: 'Download scanner',
              behavior_detector_enabled: 'Behavior detector',
            }).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between py-3">
                <span>{label}</span>
                <button onClick={() => toggle(k)} className={`px-3 py-1 rounded-full text-sm border transition ${settings[k] ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-700 text-emerald-200 border-slate-600'}`}>
                  {settings[k] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-lg font-semibold mb-4">Password exposure check</h3>
            <BreachChecker baseUrl={baseUrl} />
          </div>
        </div>

        <div className="mt-6 bg-slate-800/60 rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-lg font-semibold mb-4">Recent activity</h3>
          {loading ? (
            <div className="text-emerald-200/70">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-emerald-200/70">No logs yet.</div>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-auto pr-1">
              {logs.map((log, idx) => (
                <li key={idx} className="text-sm bg-slate-900/60 rounded-lg p-3 border border-slate-700/60">
                  <div className="font-medium text-emerald-300">{log.type}</div>
                  <div className="text-emerald-200/80">{log.message}</div>
                  {log.data && <pre className="mt-2 text-xs text-emerald-200/70 overflow-auto">{JSON.stringify(log.data, null, 2)}</pre>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function BreachChecker({ baseUrl }) {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${baseUrl}/api/breach-check?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-emerald-50 placeholder-emerald-200/50" />
        <button onClick={check} disabled={!email || loading} className="px-4 py-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50">Check</button>
      </div>
      <div className="mt-3 text-sm">
        {loading && <div className="text-emerald-200/70">Checking...</div>}
        {result && !loading && (
          result.error ? (
            <div className="text-red-300">Error: {result.error}</div>
          ) : (
            <div className="text-emerald-200">{result.exposed ? 'This email appears in known breaches.' : 'No exposure found.'}</div>
          )
        )}
      </div>
    </div>
  )
}
