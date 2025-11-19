import Hero from './components/Hero'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Hero />
      <Dashboard />
      <footer className="py-10 text-center text-emerald-200/70 bg-slate-950 border-t border-emerald-500/10">
        Security Hub • Browse safely
      </footer>
    </div>
  )
}

export default App
