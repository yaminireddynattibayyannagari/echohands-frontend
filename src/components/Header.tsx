import React from 'react'

interface HeaderProps {
  modelName?: string
  latency?: string
  status?: 'connected' | 'disconnected' | 'connecting'
}

export const Header: React.FC<HeaderProps> = ({
  modelName = 'Hand-Landmarks-v2',
  latency = '12ms',
  status = 'connected'
}) => {
  return (
    <header className="relative z-20 border-b border-slate-900/60 bg-slate-950/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-650 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 transition-all duration-300 group">
          <svg className="h-5 w-5 text-white transform group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-sans">
            EchoHands
          </h1>
          <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Sign Language Translator</p>
        </div>
      </div>

      {/* Global Status Info Badges */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm shadow-inner transition-all hover:border-slate-700">
          <span className={`h-2 w-2 rounded-full relative flex`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'connected' ? 'bg-emerald-450' : 
              status === 'connecting' ? 'bg-amber-450' : 'bg-rose-450'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'connected' ? 'bg-emerald-500' : 
              status === 'connecting' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></span>
          </span>
          <span className="text-[11px] text-slate-300 font-medium">
            System: <strong className="text-slate-100 font-bold capitalize">{status}</strong>
          </span>
        </div>

        {/* Model Info Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/30 border border-slate-900/60 text-xs">
          <span className="text-slate-500 font-medium">Model:</span>
          <span className="text-slate-350 font-bold tracking-wide">{modelName}</span>
        </div>

        {/* Latency Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/30 border border-slate-900/60 text-xs">
          <span className="text-slate-500 font-medium">Latency:</span>
          <span className="text-emerald-400 font-bold">{latency}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
