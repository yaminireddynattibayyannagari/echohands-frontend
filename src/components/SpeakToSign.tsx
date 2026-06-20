import React, { useState, useEffect, useRef } from 'react'

export const SpeakToSign: React.FC = () => {
  const [micActive, setMicActive] = useState<boolean>(false)
  const [inputText, setInputText] = useState<string>('')
  const [recognizedText, setRecognizedText] = useState<string>('Welcome to EchoHands')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0)
  const [isListening, setIsListening] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  // Simulated sign video/frames for the playback
  // These represent the sign letters/words being outputted visually
  const signFrames = [
    { label: 'W', desc: 'Raise index, middle, and ring fingers spread wide' },
    { label: 'E', desc: 'Curl all fingers against the palm thumb pressed across' },
    { label: 'L', desc: 'Extend thumb and index finger forming an L-shape' },
    { label: 'C', desc: 'Curve all fingers and thumb to form a C shape' },
    { label: 'O', desc: 'Form a circle by touching all fingertips to the thumb' },
    { label: 'M', desc: 'Fold three fingers over the thumb tucked between pinky' },
    { label: 'E', desc: 'Curl all fingers against the palm thumb pressed across' }
  ]

  // Playback logic simulation
  useEffect(() => {
    if (!isPlaying) return

    const intervalTime = 1000 / playbackSpeed
    const interval = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % signFrames.length)
    }, intervalTime)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, signFrames.length])

  // Mic waveform animation
  useEffect(() => {
    if (!micActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Clean dark background
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw standard mic wave lines
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      
      const numLines = 25
      const spacing = canvas.width / numLines
      const centerY = canvas.height / 2

      for (let i = 0; i < numLines; i++) {
        const x = i * spacing + spacing / 2
        // Generate pseudo-random audio peak based on sine waves
        const distanceToCenter = Math.abs(i - numLines / 2) / (numLines / 2)
        const multiplier = Math.max(0, 1 - distanceToCenter)
        const wave1 = Math.sin(frame * 0.1 + i * 0.3)
        const wave2 = Math.cos(frame * 0.07 + i * 0.5)
        const amp = (wave1 + wave2) * 20 * multiplier * (0.4 + Math.random() * 0.6)
        
        const height = Math.max(4, Math.abs(amp))

        // Create gradient
        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height)
        gradient.addColorStop(0, '#6366f1') // Indigo-500
        gradient.addColorStop(0.5, '#a855f7') // Purple-500
        gradient.addColorStop(1, '#6366f1')

        ctx.strokeStyle = gradient
        ctx.beginPath()
        ctx.moveTo(x, centerY - height)
        ctx.lineTo(x, centerY + height)
        ctx.stroke()
      }

      ctx.fillStyle = '#6366f1'
      ctx.font = 'bold 11px monospace'
      ctx.fillText('LISTENING FOR AUDIO INPUT...', 15, 25)

      frame++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [micActive])

  // Trigger speech recognition simulation
  const startVoiceListening = () => {
    if (isListening) return
    setIsListening(true)
    setMicActive(true)

    // Simulate speech detection
    setTimeout(() => {
      setRecognizedText('Welcome to EchoHands')
      setIsListening(false)
      setMicActive(false)
      setCurrentFrameIndex(0)
      setIsPlaying(true) // Automatically start playing the sign animations
    }, 3000)
  }

  // Handle manual text conversion
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    setRecognizedText(inputText)
    setInputText('')
    setCurrentFrameIndex(0)
    setIsPlaying(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      
      {/* Left panel: Mic listener & text inputs */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-6">
          <h2 className="text-sm font-semibold text-slate-200">Speech input</h2>

          {/* Waveform / Mic Panel */}
          <div className="relative h-[180px] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-900 flex items-center justify-center group">
            {micActive ? (
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={180} 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center p-6 select-none">
                <button
                  type="button"
                  onClick={startVoiceListening}
                  disabled={isListening}
                  className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner hover:text-purple-400 hover:border-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <div>
                  <h3 className="text-slate-300 font-medium text-sm">
                    {isListening ? 'Listening...' : 'Microphone Offline'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                    {isListening ? 'Say something...' : 'Tap the microphone to convert spoken voice to sign language.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manual text form */}
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
            <label className="text-xs text-slate-400 font-medium">Or type manually to translate</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type words here (e.g. Welcome)"
                className="flex-1 bg-slate-950 border border-slate-900 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-purple-600/10 cursor-pointer"
              >
                Translate
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel: Sign output visualizer & controls */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between flex-1 min-h-[380px]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Sign Language Output</h2>
            <div className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Active: {signFrames[currentFrameIndex]?.label}
            </div>
          </div>

          {/* Sign visualizer card (Phase B View Container) */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-8 flex flex-col items-center justify-center flex-1 min-h-[220px] text-center select-none relative overflow-hidden group">
            {/* Hologram aesthetic lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>

            <div className="h-20 w-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
              <span className="text-4xl font-extrabold text-white font-mono bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {signFrames[currentFrameIndex]?.label}
              </span>
            </div>
            
            <h3 className="text-slate-200 font-semibold text-base mb-1">
              Sign Character: "{signFrames[currentFrameIndex]?.label}"
            </h3>
            <p className="text-xs text-slate-400 max-w-[280px]">
              {signFrames[currentFrameIndex]?.desc}
            </p>
          </div>

          {/* Media Playback Controls */}
          <div className="border-t border-slate-900 pt-6 mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              
              {/* Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-ping"></span>
                      Pause Playback
                    </>
                  ) : 'Start Playback'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrentFrameIndex(0)}
                  className="h-10 w-10 bg-slate-850 hover:bg-slate-800 border border-slate-900 text-slate-400 hover:text-slate-200 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="Reset"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </button>
              </div>

              {/* Playback Speed Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Speed:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-slate-950 border border-slate-900 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1.0">1.0x (Normal)</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>
            </div>

            {/* Current Text details */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-[11px] text-slate-500">
              <strong>Source text:</strong> <span className="text-slate-300 font-medium">"{recognizedText}"</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default SpeakToSign
