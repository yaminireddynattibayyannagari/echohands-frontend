import React from 'react'

export type AppPhase = 'SIGN_TO_SPEAK' | 'SPEAK_TO_SIGN'

interface PhaseToggleProps {
  currentPhase: AppPhase
  onToggle: () => void
}

export const PhaseToggle: React.FC<PhaseToggleProps> = ({ currentPhase, onToggle }) => {
  const isSignToSpeak = currentPhase === 'SIGN_TO_SPEAK'

  return (
    <div className="flex justify-center items-center py-8 px-4 relative z-20">
      {/* Outer Pill Container */}
      <div className="relative flex items-center bg-slate-900/60 border border-slate-850 p-1.5 rounded-2xl shadow-xl backdrop-blur-md max-w-lg w-full sm:w-auto">
        {/* Animated Sliding Background Slider */}
        <div 
          className={`absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 shadow-md shadow-purple-500/10 transition-all duration-500 ease-out pointer-events-none ${
            isSignToSpeak 
              ? 'left-1.5 w-[calc(50%-0.375rem)]' 
              : 'left-[calc(50%+0.1875rem)] w-[calc(50%-0.375rem)]'
          }`}
        />

        {/* Tab A Button */}
        <button
          type="button"
          onClick={() => { if (!isSignToSpeak) onToggle() }}
          className={`relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer ${
            isSignToSpeak ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="whitespace-nowrap">Sign to Speak (Phase A)</span>
        </button>

        {/* Tab B Button */}
        <button
          type="button"
          onClick={() => { if (isSignToSpeak) onToggle() }}
          className={`relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-colors duration-300 cursor-pointer ${
            !isSignToSpeak ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="whitespace-nowrap">Speak to Sign (Phase B)</span>
        </button>
      </div>
    </div>
  )
}

export default PhaseToggle
