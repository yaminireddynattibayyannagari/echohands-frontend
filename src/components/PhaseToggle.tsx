import React from 'react'

export type AppPhase = 'SIGN_TO_SPEAK' | 'SPEAK_TO_SIGN' | 'PRACTICE_MODE'

interface PhaseToggleProps {
  currentPhase: AppPhase
  onToggle: (phase: AppPhase) => void
}

export const PhaseToggle: React.FC<PhaseToggleProps> = ({ currentPhase, onToggle }) => {
  return (
    <div className="flex justify-center items-center py-8 px-4 relative z-20">
      {/* Outer Pill Container */}
      <div className="relative flex items-center bg-slate-900/60 border border-slate-850 p-1.5 rounded-2xl shadow-xl backdrop-blur-md max-w-2xl w-full sm:w-auto">
        {/* Animated Sliding Background Slider */}
        <div 
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-purple-650 via-indigo-600 to-indigo-700 shadow-md shadow-purple-500/10 transition-all duration-500 ease-out pointer-events-none"
          style={{
            left: currentPhase === 'SIGN_TO_SPEAK' ? '0.375rem' : currentPhase === 'SPEAK_TO_SIGN' ? 'calc(33.333% + 0.125rem)' : 'calc(66.666% + 0.125rem)',
            width: 'calc(33.333% - 0.25rem)'
          }}
        />

        {/* Tab A Button: Sign to Speak */}
        <button
          type="button"
          onClick={() => onToggle('SIGN_TO_SPEAK')}
          className={`relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer ${
            currentPhase === 'SIGN_TO_SPEAK' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="whitespace-nowrap">Sign to Speak (Phase A)</span>
        </button>

        {/* Tab B Button: Speak to Sign */}
        <button
          type="button"
          onClick={() => onToggle('SPEAK_TO_SIGN')}
          className={`relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer ${
            currentPhase === 'SPEAK_TO_SIGN' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="whitespace-nowrap">Speak to Sign (Phase B)</span>
        </button>

        {/* Tab C Button: Practice & Learn */}
        <button
          type="button"
          onClick={() => onToggle('PRACTICE_MODE')}
          className={`relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer ${
            currentPhase === 'PRACTICE_MODE' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="whitespace-nowrap">Practice & Learn (Phase C)</span>
        </button>
      </div>
    </div>
  )
}

export default PhaseToggle
