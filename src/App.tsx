import { useState, useEffect } from 'react'
import Header from './components/Header'
import PhaseToggle, { type AppPhase } from './components/PhaseToggle'
import SignToSpeak from './components/SignToSpeak'
import SpeakToSign from './components/SpeakToSign'

function App() {
  const [currentPhase, setCurrentPhase] = useState<AppPhase>('SIGN_TO_SPEAK')
  
  // Shared TTS State
  const [speechRate, setSpeechRate] = useState<number>(1.0)
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  // Populate Web Speech voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
        if (availableVoices.length > 0 && !selectedVoice) {
          const defaultVoice = availableVoices.find(v => v.lang.includes('en')) || availableVoices[0]
          setSelectedVoice(defaultVoice.name)
        }
      }
    }
    updateVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [selectedVoice])

  // Speech Helper
  const speakText = (textToSpeak: string) => {
    if (!textToSpeak) return
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      if (selectedVoice) {
        const voiceObj = voices.find(v => v.name === selectedVoice)
        if (voiceObj) utterance.voice = voiceObj
      }
      utterance.rate = speechRate
      window.speechSynthesis.speak(utterance)
    }
  }

  // Toggle phase switcher function
  const handlePhaseToggle = () => {
    setCurrentPhase(prev => prev === 'SIGN_TO_SPEAK' ? 'SPEAK_TO_SIGN' : 'SIGN_TO_SPEAK')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div>
        {/* Core Layout Header */}
        <Header />

        {/* Phase State Toggle Component */}
        <PhaseToggle currentPhase={currentPhase} onToggle={handlePhaseToggle} />

        {/* Core Content Container with Transition Effects */}
        <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
          <div className="transition-all duration-300 ease-in-out transform">
            {currentPhase === 'SIGN_TO_SPEAK' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SignToSpeak
                  voices={voices}
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  speechRate={speechRate}
                  setSpeechRate={setSpeechRate}
                  speakText={speakText}
                />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <SpeakToSign />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 bg-slate-950/20 backdrop-blur-sm">
        <div>
          <span>&copy; {new Date().getFullYear()} EchoHands Project. Designed for modern web accessibility.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
