import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 opacity-70">
        <Spline scene="https://prod.spline.design/DtQLjBkD1UpownGS/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-emerald-300 drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
          Security Hub
        </h1>
        <p className="mt-4 text-emerald-100/80 text-lg md:text-xl">
          Browse safely with phishing protection, smart ad blocking, download scanning, and behavior warnings.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a href="#dashboard" className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition">Open Dashboard</a>
          <a href="/security-hub-extension.zip" className="px-5 py-3 rounded-xl bg-slate-800 text-emerald-200 font-medium border border-emerald-500/30 hover:bg-slate-700 transition">Get Extension</a>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
    </section>
  )
}
