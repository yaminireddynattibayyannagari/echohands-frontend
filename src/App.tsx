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
  const speakText = (textToSpeak: string, lang?: string, fallbackPhonetic?: string) => {
    if (!textToSpeak) return
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      
      let text = textToSpeak
      let matchedVoice: SpeechSynthesisVoice | undefined = undefined

      // Voice matching logic
      if (voices.length > 0) {
        if (lang) {
          // If a specific language is requested, try to find a voice matching it
          const requestedLangPrefix = lang.split('-')[0].toLowerCase()
          
          // First check if the active selectedVoice matches the requested language
          if (selectedVoice) {
            const activeVoice = voices.find(v => v.name === selectedVoice)
            if (activeVoice && activeVoice.lang.toLowerCase().startsWith(requestedLangPrefix)) {
              matchedVoice = activeVoice
            }
          }

          // If active voice doesn't match, find any voice in the system for this language
          if (!matchedVoice) {
            matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(requestedLangPrefix))
          }

          // If STILL no matched voice for this regional language, use fallback phonetic text
          // and switch to an English voice (if available) to read the transliteration
          if (!matchedVoice && fallbackPhonetic) {
            console.warn(`Speech synthesis voice for "${lang}" not found on this system. Falling back to English phonetic spelling: "${fallbackPhonetic}"`);
            text = fallbackPhonetic
            matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'))
          }
        } else {
          // No language requested, fall back to selectedVoice
          if (selectedVoice) {
            matchedVoice = voices.find(v => v.name === selectedVoice)
          }
        }
      }

      const utterance = new SpeechSynthesisUtterance(text)

      // Apply voice if found
      if (matchedVoice) {
        utterance.voice = matchedVoice
        utterance.lang = matchedVoice.lang
      } else if (lang) {
        utterance.lang = lang
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Decorative Premium Ambient Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '-2s' }}></div>
      <div className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] rounded-full bg-emerald-600/5 blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '-4s' }}></div>

      <div>
        {/* Core Layout Header */}
        <Header />

        {/* Phase State Toggle Component */}
        <PhaseToggle currentPhase={currentPhase} onToggle={handlePhaseToggle} />

        {/* Core Content Container with Transition Effects */}
        <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="transition-all duration-300 ease-in-out transform">
            {currentPhase === 'SIGN_TO_SPEAK' ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
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
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                <SpeakToSign />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/60 py-6 px-6 text-center text-xs text-slate-500 bg-slate-950/40 backdrop-blur-md">
        <div>
          <span>&copy; {new Date().getFullYear()} EchoHands Project. Designed for premium web accessibility.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
