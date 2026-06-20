import React from 'react'

export type AppPhase = 'SIGN_TO_SPEAK' | 'SPEAK_TO_SIGN'

interface PhaseToggleProps {
  currentPhase: AppPhase
  onToggle: () => void
}

export const PhaseToggle: React.FC<PhaseToggleProps> = ({ currentPhase, onToggle }) => {
  const isSignToSpeak = currentPhase === 'SIGN_TO_SPEAK'

  return (
    <div className="flex justify-center items-center py-6 px-4">
      <button
        type="button"
        onClick={onToggle}
        className="relative group flex items-center gap-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 px-5 py-3 rounded-2xl transition-all duration-300 shadow-xl cursor-pointer hover:shadow-purple-500/5 hover:-translate-y-0.5"
      >
        {/* Toggle visual switch dot */}
        <div className="relative h-6 w-11 bg-slate-950 rounded-full border border-slate-800 p-0.5 flex items-center transition-colors">
          <div
            className={`h-4 w-4 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-md transform transition-all duration-300 ease-out ${
              isSignToSpeak ? 'translate-x-0' : 'translate-x-5'
            }`}
          />
        </div>

        {/* Text descriptions */}
        <div className="text-left font-sans">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Active Mode
          </div>
          <div className="text-sm font-bold text-slate-200 transition-colors duration-300">
            {isSignToSpeak ? 'Sign to Speak (Phase A)' : 'Speak to Sign (Phase B)'}
          </div>
        </div>

        {/* Hover info helper */}
        <span className="text-xs text-slate-500 ml-4 border-l border-slate-800 pl-4 group-hover:text-purple-400 transition-colors hidden sm:inline-block">
          Switch Mode
        </span>
      </button>
    </div>
  )
}

export default PhaseToggle
