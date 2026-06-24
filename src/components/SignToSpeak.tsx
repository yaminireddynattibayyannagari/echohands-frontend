import React, { useState, useEffect, useRef, useCallback } from 'react'

interface SignToSpeakProps {
  voices: SpeechSynthesisVoice[]
  selectedVoice: string
  setSelectedVoice: (voiceName: string) => void
  speechRate: number
  setSpeechRate: (rate: number) => void
  speakText: (text: string, lang?: string, fallbackPhonetic?: string) => void
}

interface Results {
  multiHandLandmarks: Array<Array<{ x: number; y: number; z: number }>>
  multiHandedness: Array<{ index: number; score: number; label: 'Left' | 'Right' }>
  image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap
}

interface HistoryItem {
  gesture: string
  translated: string
  langCode: string
  timestamp: string
  phonetic?: string
}

interface MediaPipeHands {
  setOptions: (options: {
    maxNumHands?: number
    modelComplexity?: number
    minDetectionConfidence?: number
    minTrackingConfidence?: number
  }) => void
  onResults: (callback: (results: Results) => void) => void
  send: (data: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

interface MediaPipeCamera {
  start: () => Promise<void>
  stop: () => void
}

interface MediaPipeWindow extends Window {
  Hands?: new (config: { locateFile: (file: string) => string }) => MediaPipeHands
  Camera?: new (
    video: HTMLVideoElement,
    options: { onFrame: () => Promise<void>; width: number; height: number }
  ) => MediaPipeCamera
}

// Dictionary of gestures mapped to Indian languages
const gestureDictionary: Record<
  string,
  {
    label: string
    hindi: string
    hindiPhonetic: string
    telugu: string
    teluguPhonetic: string
    tamil: string
    tamilPhonetic: string
  }
> = {
  'Hello': {
    label: 'Hello',
    hindi: 'नमस्ते',
    hindiPhonetic: 'namaste',
    telugu: 'నమస్కారం',
    teluguPhonetic: 'namaskaaram',
    tamil: 'வணக்கம்',
    tamilPhonetic: 'vanakkam'
  },
  'Yes': {
    label: 'Yes',
    hindi: 'हाँ',
    hindiPhonetic: 'haan',
    telugu: 'అవును',
    teluguPhonetic: 'avunu',
    tamil: 'ஆம்',
    tamilPhonetic: 'aam'
  },
  'Thank You': {
    label: 'Thank You',
    hindi: 'धन्यवाद',
    hindiPhonetic: 'dhanyavaad',
    telugu: 'ధన్యవాదాలు',
    teluguPhonetic: 'dhanyavaadaalu',
    tamil: 'நன்றி',
    tamilPhonetic: 'nandri'
  },
  'Help': {
    label: 'Help',
    hindi: 'मदद',
    hindiPhonetic: 'madad',
    telugu: 'సహాయం',
    teluguPhonetic: 'sahaayam',
    tamil: 'உதவி',
    tamilPhonetic: 'udhavi'
  },
  'Stop': {
    label: 'Stop',
    hindi: 'रुकिए',
    hindiPhonetic: 'rukiye',
    telugu: 'ఆగండి',
    teluguPhonetic: 'aagandi',
    tamil: 'நில்லுங்கள்',
    tamilPhonetic: 'nillungal'
  },
  'Idle': {
    label: 'Idle',
    hindi: 'निष्क्रिय',
    hindiPhonetic: 'nishkriya',
    telugu: 'నిశ్చలంగా',
    teluguPhonetic: 'nishchalangaa',
    tamil: 'செயலற்றது',
    tamilPhonetic: 'seyalatradhu'
  }
}

// Gestures guide metadata for display assistant
const GUIDE_GESTURES = [
  {
    name: 'Hello',
    description: 'Open Palm',
    details: 'Hold all 5 fingers fully extended upwards.',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m0-6.5v-2a1.5 1.5 0 113 0V12m0-6.5V3a1.5 1.5 0 113 0V12m0-4.5V5a1.5 1.5 0 113 0V14a7 7 0 01-14 0V11.5a1.5 1.5 0 113 0z" />
      </svg>
    )
  },
  {
    name: 'Yes',
    description: 'V Sign',
    details: 'Extend index and middle fingers; fold others.',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10V5.5a1.5 1.5 0 013 0V10m0-4.5V4a1.5 1.5 0 013 0V10m3 1.5V11a1.5 1.5 0 00-3 0v1m-6-1.5V11a1.5 1.5 0 013 0v1m-6-1V14a6 6 0 0012 0v-4" />
      </svg>
    )
  },
  {
    name: 'Thank You',
    description: 'Pointer',
    details: 'Extend index finger only; fold remaining fingers.',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-purple-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10V4.5a1.5 1.5 0 013 0V12m0-6.5V11a1.5 1.5 0 003 0v1m0-3V11a1.5 1.5 0 003 0v1m-9 1v1a5 5 0 0010 0v-4" />
      </svg>
    )
  },
  {
    name: 'Help',
    description: 'Thumb & Pinky',
    details: 'Extend thumb and pinky; fold middle fingers.',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-amber-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5V8a1.5 1.5 0 013 0v4m0-4V11a1.5 1.5 0 003 0v1m0-2.5V11a1.5 1.5 0 003 0v1m3.5-3.5V10c0 4-3 7-7 7s-7-3-7-7V9.5a1.5 1.5 0 013 0" />
      </svg>
    )
  },
  {
    name: 'Stop',
    description: 'Fist',
    details: 'Fold all five fingers tightly into a fist.',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors duration-300 ${active ? 'text-rose-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c1.66 0 3-1.34 3-3V9.5a1.5 1.5 0 00-3 0v1.5m0-1.5V9.5a1.5 1.5 0 00-3 0v1.5m0-1.5V9.5a1.5 1.5 0 00-3 0v4.5c0 2.2 1.8 4 4 4h2c2.2 0 4-1.8 4-4V11" />
      </svg>
    )
  }
]

export const SignToSpeak: React.FC<SignToSpeakProps> = ({
  voices,
  selectedVoice,
  setSelectedVoice,
  speechRate,
  setSpeechRate,
  speakText
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [detectedText, setDetectedText] = useState<string>('Idle')
  const [confidence, setConfidence] = useState<number>(100.0)
  const [fps, setFps] = useState<number>(30)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  // Selected translation language
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'telugu' | 'tamil'>('english')

  // Helper to translate detected gesture
  const getTranslationInfo = useCallback((word: string) => {
    const dict = gestureDictionary[word] || {
      label: word,
      hindi: word,
      hindiPhonetic: word,
      telugu: word,
      teluguPhonetic: word,
      tamil: word,
      tamilPhonetic: word
    }
    
    if (selectedLanguage === 'english') {
      return { text: word, phonetic: '', langCode: 'en-US' }
    } else if (selectedLanguage === 'hindi') {
      return { text: dict.hindi, phonetic: dict.hindiPhonetic, langCode: 'hi-IN' }
    } else if (selectedLanguage === 'telugu') {
      return { text: dict.telugu, phonetic: dict.teluguPhonetic, langCode: 'te-IN' }
    } else if (selectedLanguage === 'tamil') {
      return { text: dict.tamil, phonetic: dict.tamilPhonetic, langCode: 'ta-IN' }
    }
    return { text: word, phonetic: '', langCode: 'en-US' }
  }, [selectedLanguage])

  const activeTranslation = getTranslationInfo(detectedText)

  // Script loading state
  const [scriptsLoaded, setScriptsLoaded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const customWindow = window as unknown as MediaPipeWindow
    return !!(customWindow.Hands && customWindow.Camera)
  })

  const [loadingStatus, setLoadingStatus] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Loading...'
    const customWindow = window as unknown as MediaPipeWindow
    return customWindow.Hands && customWindow.Camera ? '' : 'Initializing hand tracking models...'
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraRef = useRef<MediaPipeCamera | null>(null)
  const handsRef = useRef<MediaPipeHands | null>(null)
  const prevWordRef = useRef<string>('Idle')
  const frameCountRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(0)

  // Dynamic script loader for MediaPipe
  useEffect(() => {
    if (scriptsLoaded) {
      return
    }

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`)
        if (existingScript) {
          (existingScript as HTMLScriptElement).onload = () => resolve();
          return
        }
        const script = document.createElement('script')
        script.src = src
        script.crossOrigin = 'anonymous'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
    ])
      .then(() => {
        setTimeout(() => {
          const customWindow = window as unknown as MediaPipeWindow
          if (customWindow.Hands && customWindow.Camera) {
            setScriptsLoaded(true)
            setLoadingStatus('')
          } else {
            setLoadingStatus('Constructors not registered correctly. Retrying...')
          }
        }, 100)
      })
      .catch((err) => {
        console.error('Failed to load MediaPipe from CDN:', err)
        setLoadingStatus('Failed to load tracking assets. Please check your internet connection.')
      })
  }, [scriptsLoaded])

  // Trigger TTS voice announcement when the recognized word changes
  useEffect(() => {
    if (detectedText && detectedText !== 'Idle' && detectedText !== prevWordRef.current) {
      const translation = getTranslationInfo(detectedText)
      speakText(translation.text, translation.langCode, translation.phonetic)
      
      setHistory(prev => {
        if (prev.length > 0 && prev[0].gesture === detectedText) return prev
        
        const now = new Date()
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        
        const newItem: HistoryItem = {
          gesture: detectedText,
          translated: translation.text,
          langCode: translation.langCode,
          timestamp: timeString,
          phonetic: translation.phonetic
        }
        return [newItem, ...prev]
      })
      prevWordRef.current = detectedText
    }
  }, [detectedText, getTranslationInfo, speakText])

  // Simple hand gesture classification heuristic based on landmark distances
  const classifyGesture = (landmarks: Array<{ x: number; y: number; z: number }>): { word: string; conf: number } => {
    const isIndexExtended = landmarks[8].y < landmarks[6].y
    const isMiddleExtended = landmarks[12].y < landmarks[10].y
    const isRingExtended = landmarks[16].y < landmarks[14].y
    const isPinkyExtended = landmarks[20].y < landmarks[18].y
    const isThumbExtended = Math.abs(landmarks[4].x - landmarks[2].x) > 0.05

    // 1. Open Palm -> Hello
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return { word: 'Hello', conf: 99.2 }
    }
    
    // 2. Index and Middle Extended (V sign) -> Yes
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return { word: 'Yes', conf: 98.5 }
    }
    
    // 3. Only Index Extended -> Thank You
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return { word: 'Thank You', conf: 97.4 }
    }

    // 4. Thumb and Pinky Extended -> Help
    if (isThumbExtended && isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
      return { word: 'Help', conf: 96.8 }
    }

    // 5. All fingers folded -> Stop
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return { word: 'Stop', conf: 99.5 }
    }

    return { word: 'Idle', conf: 100.0 }
  }

  // Set up MediaPipe Hands and active camera utils
  useEffect(() => {
    if (!cameraActive || !scriptsLoaded) {
      return
    }

    const videoElement = videoRef.current
    const canvasElement = canvasRef.current
    if (!videoElement || !canvasElement) return

    const ctx = canvasElement.getContext('2d')
    if (!ctx) return

    setCameraError(null)

    const customWindow = window as unknown as MediaPipeWindow
    const HandsClass = customWindow.Hands
    const CameraClass = customWindow.Camera

    if (!HandsClass || !CameraClass) {
      setTimeout(() => {
        setCameraError('Tracking drivers failed to load. Please reload the page.')
        setCameraActive(false)
      }, 0)
      return
    }

    const hands = new HandsClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    })

    hands.onResults((results: Results) => {
      ctx.save()
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
      ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0]

        const gesture = classifyGesture(landmarks)
        setDetectedText(gesture.word)
        setConfidence(gesture.conf)

        // Draw connections
        ctx.strokeStyle = '#a855f7' // Purple-500
        ctx.lineWidth = 4
        ctx.shadowBlur = 12
        ctx.shadowColor = 'rgba(168, 85, 247, 0.6)'

        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [0, 9], [9, 10], [10, 11], [11, 12], // Middle
          [0, 13], [13, 14], [14, 15], [15, 16], // Ring
          [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [5, 9], [9, 13], [13, 17] // Palm
        ]

        connections.forEach(([p1, p2]) => {
          ctx.beginPath()
          ctx.moveTo(landmarks[p1].x * canvasElement.width, landmarks[p1].y * canvasElement.height)
          ctx.lineTo(landmarks[p2].x * canvasElement.width, landmarks[p2].y * canvasElement.height)
          ctx.stroke()
        })

        // Draw joints
        ctx.fillStyle = '#10b981' // Emerald-500
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(16, 185, 129, 0.8)'
        landmarks.forEach((landmark) => {
          ctx.beginPath()
          ctx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 6, 0, 2 * Math.PI)
          ctx.fill()
        })
      } else {
        setDetectedText('Idle')
      }

      ctx.restore()

      // Calculate FPS
      frameCountRef.current++
      const now = performance.now()
      if (lastFpsUpdateRef.current === 0) {
        lastFpsUpdateRef.current = now
      }
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)))
        frameCountRef.current = 0
        lastFpsUpdateRef.current = now
      }
    })

    handsRef.current = hands

    const camera = new CameraClass(videoElement, {
      onFrame: async () => {
        if (cameraActive && handsRef.current) {
          try {
            await handsRef.current.send({ image: videoElement })
          } catch (err) {
            console.warn('MediaPipe hands send failed:', err)
          }
        }
      },
      width: 640,
      height: 360
    })

    cameraRef.current = camera

    camera.start().catch((err: unknown) => {
      console.error('Camera stream access failed:', err)
      setTimeout(() => {
        setCameraError('Webcam access was denied or is unavailable. Please check system permissions.')
        setCameraActive(false)
      }, 0)
    })

    return () => {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop()
        } catch (e) {
          console.warn('Failed to stop camera:', e)
        }
        cameraRef.current = null
      }
      
      const handsInstance = handsRef.current
      handsRef.current = null

      if (handsInstance) {
        try {
          handsInstance.close()
        } catch (e) {
          console.warn('Failed to close hands tracker:', e)
        }
      }
    }
  }, [cameraActive, scriptsLoaded])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full font-sans">
      <video 
        ref={videoRef} 
        style={{ display: 'none' }} 
        playsInline 
        muted 
      />

      {/* Left panel: Active Webcam Stream Canvas */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-855/80 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[460px] relative overflow-hidden group">
          {/* Subtle Ambient Card Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors duration-500 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2.5 w-2.5`}>
                {cameraActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cameraActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
              </span>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Video Capture Stream</h2>
            </div>
            {cameraActive && (
              <div className="flex gap-4 text-[10px] text-slate-455 font-mono font-bold bg-slate-955/40 px-2.5 py-1 rounded-lg border border-slate-900">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> FPS: {fps}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span> CONF: {confidence}%
                </span>
              </div>
            )}
          </div>

          {/* Canvas Wrapper */}
          <div className="relative aspect-video w-full bg-slate-955/90 rounded-2xl overflow-hidden border border-slate-850/60 flex items-center justify-center group/screen shadow-inner">
            {!scriptsLoaded ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center select-none z-10">
                <div className="h-9 w-9 rounded-full border-3 border-slate-800 border-t-purple-500 animate-spin" />
                <span className="text-xs text-slate-400 font-mono tracking-wider font-bold animate-pulse">{loadingStatus}</span>
              </div>
            ) : cameraActive ? (
              <>
                <canvas 
                  ref={canvasRef} 
                  width={640} 
                  height={360} 
                  className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
                />
                
                {/* Hand Silhouette Guide when Idle/No hand detected */}
                {detectedText === 'Idle' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 animate-pulse transition-opacity duration-300">
                    <svg className="w-40 h-40 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path d="M12 14c2.21 0 4-1.79 4-4V5c0-2.21-1.79-4-4-4S8 2.79 8 5v5c0 2.21 1.79 4 4 4z" />
                      <path d="M19 10v1a7 7 0 01-14 0v-1M12 18.5V23" />
                      <path strokeLinecap="round" strokeDasharray="3 3" d="M9 19c-3.5 0-5-2-5-5V7.5c0-.83.67-1.5 1.5-1.5S7 6.67 7 7.5V11m2 0V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11m2 0V4.5c0-.83.67-1.5 1.5-1.5S15 3.67 15 4.5V11m2 0V6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V13c0 3.31-2.69 6-6 6h-3z" />
                    </svg>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6 select-none z-10">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-lg group-hover/screen:scale-105 group-hover/screen:border-purple-500/35 transition-all duration-300">
                  <svg className="h-8 w-8 text-purple-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-slate-350 font-bold text-sm tracking-wide">Camera Feed Offline</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">Enable your camera to start real-time landmark extraction and translation.</p>
                </div>
              </div>
            )}
            
            {cameraError && (
              <div className="absolute inset-0 bg-slate-955/95 flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="text-rose-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Camera Error
                </div>
                <div className="text-xs text-slate-400 max-w-[320px] leading-relaxed">{cameraError}</div>
                <button
                  type="button"
                  onClick={() => setCameraActive(false)}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex items-center gap-4 mt-6 z-10">
            <button
              type="button"
              onClick={() => setCameraActive(!cameraActive)}
              disabled={!scriptsLoaded}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50 ${
                cameraActive 
                  ? 'bg-rose-550/15 text-rose-455 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-650 text-white shadow-lg shadow-purple-655/15 hover:shadow-purple-500/30 hover:scale-[1.01] hover:-translate-y-0.5'
              }`}
            >
              {cameraActive ? (
                <>
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Stop Translation Feed
                </>
              ) : (
                <>
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Translation Feed
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gestures Guide Assistant Card */}
        <div className="bg-slate-900/40 border border-slate-855/80 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4 relative overflow-hidden group">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 mb-1 z-10 relative">
              <svg className="h-4.5 w-4.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gestures Guide Assistant</h3>
            </div>
            <p className="text-[10px] text-slate-450 leading-normal">Practice these hand shapes in front of your camera to trigger regional voice translation.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2 z-10 relative">
            {GUIDE_GESTURES.map((gesture) => {
              const isActive = detectedText === gesture.name;
              return (
                <div 
                  key={gesture.name}
                  className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-300 text-center relative ${
                    isActive 
                      ? 'bg-purple-650/15 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30 scale-[1.02]' 
                      : 'bg-slate-955/40 border-slate-855/40 hover:border-slate-800 hover:bg-slate-955/60'
                  }`}
                >
                  {/* Status Indicator */}
                  {isActive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-900/60 text-slate-550'
                  }`}>
                    {gesture.icon(isActive)}
                  </div>

                  {/* Info */}
                  <div className="mt-2.5 flex flex-col gap-0.5">
                    <span className={`text-[11px] font-bold tracking-wide uppercase ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}>{gesture.name}</span>
                    <span className="text-[9px] font-mono text-purple-450/80 font-bold">{gesture.description}</span>
                  </div>

                  {/* Instructions text */}
                  <span className="text-[8.5px] text-slate-500 mt-2 leading-relaxed">
                    {gesture.details}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: translation controls & metrics */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-850/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-6 relative overflow-hidden group">
          {/* Subtle Ambient Card Glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3 z-10 relative">
              <h2 className="text-xs font-bold text-slate-455 uppercase tracking-wider">Detected Phrase</h2>
              {/* Language Translate Selector */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-955/60 border border-slate-900">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Lang:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'english' | 'hindi' | 'telugu' | 'tamil')}
                  className="bg-transparent border-0 text-[10px] text-slate-350 font-bold focus:outline-none cursor-pointer hover:text-purple-400 transition-colors duration-200"
                >
                  <option value="english" className="bg-slate-900 text-slate-100">English</option>
                  <option value="hindi" className="bg-slate-900 text-slate-100">Hindi (हिंदी)</option>
                  <option value="telugu" className="bg-slate-900 text-slate-100">Telugu (తెలుగు)</option>
                  <option value="tamil" className="bg-slate-900 text-slate-100">Tamil (தமிழ்)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-955/80 border border-slate-850/60 rounded-2xl p-5 min-h-[110px] flex flex-col justify-between gap-3 relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-3xl font-extrabold tracking-tight text-white">{activeTranslation.text}</span>
                  {activeTranslation.phonetic && (
                    <span className="text-[11px] font-mono text-purple-450 font-bold">({activeTranslation.phonetic})</span>
                  )}
                </div>

                {detectedText && detectedText !== 'Idle' && (
                  <button
                    type="button"
                    onClick={() => speakText(activeTranslation.text, activeTranslation.langCode, activeTranslation.phonetic)}
                    className="h-12 w-12 rounded-2xl bg-purple-650/10 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-550/20 hover:border-transparent flex items-center justify-center transition-all duration-350 shadow-md cursor-pointer hover:scale-105 hover:shadow-purple-550/15"
                    title="Speak current translation"
                  >
                    <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Confidence Rating Pill-Bar */}
              {detectedText !== 'Idle' && (
                <div className="border-t border-slate-900/60 pt-3 mt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                    <span>Recognition Confidence</span>
                    <span className="text-slate-350 font-bold">{confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-emerald-450 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice configurations */}
          <div className="border-t border-slate-900/60 pt-6 flex flex-col gap-4 relative z-10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audio Output Controls</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1.5 font-bold uppercase">Voice Profile</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-855 rounded-xl px-3 py-2 text-xs text-slate-305 focus:outline-none focus:border-purple-500 hover:border-purple-500/50 hover:text-purple-400 transition-all cursor-pointer"
                >
                  {voices.length === 0 ? (
                    <option className="bg-slate-900 text-slate-100">System Default Voice</option>
                  ) : (
                    voices.map(voice => (
                      <option key={voice.name} value={voice.name} className="bg-slate-900 text-slate-100">
                        {voice.name.replace('Microsoft', '').trim()} ({voice.lang})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-bold uppercase">
                  <span>Speech Speed</span>
                  <span className="text-purple-400 font-bold">{speechRate}x</span>
                </div>
                <div className="flex items-center h-9">
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-slate-955 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Translation Logs list */}
        <div className="bg-slate-900/40 border border-slate-850/80 rounded-3xl p-5 backdrop-blur-md shadow-xl flex-1 flex flex-col justify-between gap-4 relative overflow-hidden group">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 z-10 relative">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Translation History</h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[10px] text-slate-550 hover:text-rose-455 font-bold uppercase tracking-wide cursor-pointer transition-colors"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div className="flex-1 max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-800 z-10 relative">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <svg className="h-8 w-8 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-xs text-slate-600 font-medium">No gestures translated in this session.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-850 ml-2.5 pl-5 flex flex-col gap-4">
                  {history.map((item, idx) => (
                    <div key={idx} className="relative flex items-center justify-between p-3.5 bg-slate-955/60 border border-slate-905 rounded-2xl hover:border-purple-500/20 hover:bg-slate-955 transition-all duration-300 group">
                      
                      <span className="absolute -left-[26px] top-[22px] h-2 w-2 rounded-full bg-slate-800 border-2 border-slate-955 group-hover:bg-purple-500 group-hover:border-purple-500/30 transition-all duration-300 ring-4 ring-slate-955"></span>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">{item.gesture}</span>
                          <span className="text-[9px] font-mono text-slate-550 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                            {item.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">{item.translated}</span>
                          <span className="text-[8px] font-bold text-purple-400/80 bg-purple-500/5 px-1 py-0.2 rounded border border-purple-500/10">
                            {item.langCode.split('-')[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.translated)
                          }}
                          className="text-slate-555 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                          title="Copy translation text"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 00-2 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => speakText(item.translated, item.langCode, item.phonetic)}
                          className="text-slate-555 hover:text-purple-400 p-1.5 rounded-lg hover:bg-purple-500/10 transition-all cursor-pointer"
                          title="Speak translation"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignToSpeak;
