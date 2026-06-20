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
    <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            EchoHands
          </h1>
          <p className="text-xs text-slate-400 font-medium">Sign Language to Speech System</p>
        </div>
      </div>

      {/* Global Status Info */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${
            status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
            status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
          }`}></span>
          <span className="text-slate-400 text-xs font-medium">
            Model: <strong className="text-slate-200 font-medium">{modelName}</strong>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-6">
          <span className="text-slate-400 text-xs font-medium">
            Latency: <strong className="text-slate-200 font-medium">{latency}</strong>
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
