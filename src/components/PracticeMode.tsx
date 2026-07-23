import React, { useState, useEffect, useRef } from 'react'

interface PracticeModeProps {
  speakText: (text: string, lang?: string, fallbackPhonetic?: string) => void
}

interface Results {
  multiHandLandmarks: Array<Array<{ x: number; y: number; z: number }>>
  multiHandedness: Array<{ index: number; score: number; label: 'Left' | 'Right' }>
  image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap
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

interface Challenge {
  word: string
  gestureDescription: string
  instructions: string
  hint: string
}

const PRACTICE_CHALLENGES: Challenge[] = [
  {
    word: 'Hello',
    gestureDescription: 'Open Palm',
    instructions: 'Extend all 5 fingers fully upwards, palm facing the camera.',
    hint: 'Wave hello with a fully open hand!'
  },
  {
    word: 'Yes',
    gestureDescription: 'V Sign',
    instructions: 'Extend index and middle fingers fully; fold ring, pinky, and thumb.',
    hint: 'Make a peace sign or "V" gesture.'
  },
  {
    word: 'Thank You',
    gestureDescription: 'Pointer Sign',
    instructions: 'Extend index finger only straight up; fold other fingers tightly.',
    hint: 'Point your index finger upwards.'
  },
  {
    word: 'Help',
    gestureDescription: 'Thumb & Pinky',
    instructions: 'Extend thumb and pinky outwards; fold middle three fingers down.',
    hint: 'Make a "hang loose" or phone gesture.'
  },
  {
    word: 'Stop',
    gestureDescription: 'Fist Sign',
    instructions: 'Fold all five fingers tightly into a fist configuration.',
    hint: 'Make a standard solid fist.'
  }
]

export const PracticeMode: React.FC<PracticeModeProps> = ({ speakText }) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState<number>(0)
  const [detectedText, setDetectedText] = useState<string>('Idle')
  const [fps, setFps] = useState<number>(30)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  // Game states
  const [score, setScore] = useState<number>(0)
  const [holdProgress, setHoldProgress] = useState<number>(0) // 0 to 100
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [streak, setStreak] = useState<number>(0)
  const [achievements, setAchievements] = useState<string[]>([])
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<boolean>(false)

  // Script loading state
  const [scriptsLoaded, setScriptsLoaded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const customWindow = window as unknown as MediaPipeWindow
    return !!(customWindow.Hands && customWindow.Camera)
  })

  const [loadingStatus, setLoadingStatus] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Loading...'
    const customWindow = window as unknown as MediaPipeWindow
    return customWindow.Hands && customWindow.Camera ? '' : 'Initializing game tracking drivers...'
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraRef = useRef<MediaPipeCamera | null>(null)
  const handsRef = useRef<MediaPipeHands | null>(null)
  const frameCountRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(0)
  
  // Hold progress tracking ref
  const holdStartTimeRef = useRef<number | null>(null)
  const lastDetectionRef = useRef<string>('Idle')

  const activeChallenge = PRACTICE_CHALLENGES[currentChallengeIdx]

  // Dynamic script loader for MediaPipe
  useEffect(() => {
    if (scriptsLoaded) return

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
            setLoadingStatus('Constructors failed registration. Retrying...')
          }
        }, 100)
      })
      .catch((err) => {
        console.error('Failed to load MediaPipe for Practice Mode:', err)
        setLoadingStatus('Failed to load tracking assets. Please check your network.')
      })
  }, [scriptsLoaded])

  // Classification logic (same classification logic for consistency)
  const classifyGesture = (landmarks: Array<{ x: number; y: number; z: number }>): string => {
    const getDistance = (p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }) => {
      return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
      )
    }

    const wrist = landmarks[0]
    const middleMCP = landmarks[9]
    const handSize = getDistance(wrist, middleMCP) || 0.1

    const indexTipDist = getDistance(wrist, landmarks[8]) / handSize
    const middleTipDist = getDistance(wrist, landmarks[12]) / handSize
    const ringTipDist = getDistance(wrist, landmarks[16]) / handSize
    const pinkyTipDist = getDistance(wrist, landmarks[20]) / handSize
    const thumbTipDist = getDistance(landmarks[4], middleMCP) / handSize

    const isIndexExtended = indexTipDist > 1.25
    const isMiddleExtended = middleTipDist > 1.25
    const isRingExtended = ringTipDist > 1.25
    const isPinkyExtended = pinkyTipDist > 1.05
    const isThumbExtended = thumbTipDist > 0.78

    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return 'Hello'
    }
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'Yes'
    }
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'Thank You'
    }
    if (isThumbExtended && isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
      return 'Help'
    }
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'Stop'
    }

    return 'Idle'
  }

  // Handle game score, holding times and challenge progression
  const handleHoldProgress = (detected: string) => {
    if (gameCompleted) return

    const targetWord = activeChallenge?.word
    
    if (detected === targetWord) {
      if (holdStartTimeRef.current === null) {
        holdStartTimeRef.current = performance.now()
      }
      
      const elapsed = performance.now() - holdStartTimeRef.current
      const progress = Math.min(100, Math.round((elapsed / 1500) * 100))
      setHoldProgress(progress)

      if (progress >= 100) {
        // Correct Sign Registered!
        triggerSuccess(targetWord)
      }
    } else {
      holdStartTimeRef.current = null
      setHoldProgress(0)
    }
  }

  const triggerSuccess = (word: string) => {
    holdStartTimeRef.current = null
    setHoldProgress(0)
    setScore(prev => prev + 10)
    setStreak(prev => {
      const nextStreak = prev + 1
      if (nextStreak === 3 && !achievements.includes('Sharp Student')) {
        setAchievements(prevA => [...prevA, 'Sharp Student'])
      }
      return nextStreak
    })

    // Confetti / Sound trigger
    setShowSuccessOverlay(true)
    speakText(`Correct ${word}!`, 'en-US')
    
    setTimeout(() => {
      setShowSuccessOverlay(false)
      if (currentChallengeIdx < PRACTICE_CHALLENGES.length - 1) {
        setCurrentChallengeIdx(prev => prev + 1)
      } else {
        setGameCompleted(true)
        if (!achievements.includes('Sign Master')) {
          setAchievements(prevA => [...prevA, 'Sign Master'])
        }
        speakText('Congratulations! You completed all sign challenges!', 'en-US')
      }
    }, 1200)
  }

  const handleSkip = () => {
    if (currentChallengeIdx < PRACTICE_CHALLENGES.length - 1) {
      setCurrentChallengeIdx(prev => prev + 1)
      setStreak(0)
      setHoldProgress(0)
      holdStartTimeRef.current = null
    } else {
      setGameCompleted(true)
    }
  }

  const handleResetGame = () => {
    setCurrentChallengeIdx(0)
    setScore(0)
    setStreak(0)
    setHoldProgress(0)
    setGameCompleted(false)
    setShowSuccessOverlay(false)
    holdStartTimeRef.current = null
  }

  // Set up MediaPipe camera tracking loop
  useEffect(() => {
    if (!cameraActive || !scriptsLoaded || gameCompleted) {
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
        setCameraError('Tracking drivers failed registration. Please reload.')
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

      // Draw focus HUD overlay brackets
      const pad = 24
      const len = 20
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)' // Emerald focus ring for practice
      ctx.lineWidth = 3
      ctx.shadowBlur = 0

      // Top-Left
      ctx.beginPath()
      ctx.moveTo(pad, pad + len)
      ctx.lineTo(pad, pad)
      ctx.lineTo(pad + len, pad)
      ctx.stroke()

      // Top-Right
      ctx.beginPath()
      ctx.moveTo(canvasElement.width - pad, pad + len)
      ctx.lineTo(canvasElement.width - pad, pad)
      ctx.lineTo(canvasElement.width - pad - len, pad)
      ctx.stroke()

      // Bottom-Left
      ctx.beginPath()
      ctx.moveTo(pad, canvasElement.height - pad - len)
      ctx.lineTo(pad, canvasElement.height - pad)
      ctx.lineTo(pad + len, canvasElement.height - pad)
      ctx.stroke()

      // Bottom-Right
      ctx.beginPath()
      ctx.moveTo(canvasElement.width - pad, canvasElement.height - pad - len)
      ctx.lineTo(canvasElement.width - pad, canvasElement.height - pad)
      ctx.lineTo(canvasElement.width - pad - len, canvasElement.height - pad)
      ctx.stroke()

      // Scanline
      const scanlineY = (performance.now() / 12) % canvasElement.height
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, scanlineY)
      ctx.lineTo(canvasElement.width, scanlineY)
      ctx.stroke()

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0]
        const gesture = classifyGesture(landmarks)
        setDetectedText(gesture)
        lastDetectionRef.current = gesture
        
        // Progress hold logic
        handleHoldProgress(gesture)

        // Draw glowing connections
        const connGradient = ctx.createLinearGradient(0, 0, canvasElement.width, canvasElement.height)
        connGradient.addColorStop(0, '#34d399') // Emerald
        connGradient.addColorStop(0.5, '#60a5fa') // Blue
        connGradient.addColorStop(1, '#a78bfa') // Purple
        
        ctx.strokeStyle = connGradient
        ctx.lineWidth = 4
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)'

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

        // Draw glowing joints
        landmarks.forEach((landmark) => {
          const cx = landmark.x * canvasElement.width
          const cy = landmark.y * canvasElement.height

          ctx.beginPath()
          ctx.arc(cx, cy, 8, 0, 2 * Math.PI)
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'
          ctx.fill()

          ctx.beginPath()
          ctx.arc(cx, cy, 4, 0, 2 * Math.PI)
          ctx.fillStyle = '#10b981'
          ctx.fill()
        })
      } else {
        setDetectedText('Idle')
        handleHoldProgress('Idle')
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
        if (cameraActive && handsRef.current && !gameCompleted) {
          try {
            await handsRef.current.send({ image: videoElement })
          } catch (err) {
            console.warn('MediaPipe send failed in Game Loop:', err)
          }
        }
      },
      width: 640,
      height: 360
    })

    cameraRef.current = camera

    camera.start().catch((err: unknown) => {
      console.error('Camera stream access failed in Game:', err)
      setTimeout(() => {
        setCameraError('Webcam access was denied or is unavailable. Please verify device permissions.')
        setCameraActive(false)
      }, 0)
    })

    return () => {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop()
        } catch (e) {
          console.warn('Failed to stop camera in Game:', e)
        }
        cameraRef.current = null
      }
      
      const handsInstance = handsRef.current
      handsRef.current = null

      if (handsInstance) {
        try {
          handsInstance.close()
        } catch (e) {
          console.warn('Failed to close hands tracker in Game:', e)
        }
      }
    }
  }, [cameraActive, scriptsLoaded, currentChallengeIdx, gameCompleted])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full font-sans">
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />

      {/* Left Column: Live camera feedback */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-855/80 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[460px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {cameraActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cameraActive ? 'bg-emerald-500' : 'bg-slate-650'}`}></span>
              </span>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Practice Camera Stream</h2>
            </div>
            {cameraActive && (
              <span className="text-[10px] text-slate-450 font-mono font-bold bg-slate-955/40 px-2.5 py-1 rounded-lg border border-slate-900">
                FPS: {fps}
              </span>
            )}
          </div>

          {/* Canvas box */}
          <div className="relative aspect-video w-full bg-slate-955/90 rounded-2xl overflow-hidden border border-slate-850/60 flex items-center justify-center shadow-inner">
            {!scriptsLoaded ? (
              <div className="flex flex-col items-center gap-3 p-6 text-center select-none z-10">
                <div className="h-9 w-9 rounded-full border-3 border-slate-800 border-t-emerald-450 animate-spin" />
                <span className="text-xs text-slate-400 font-mono tracking-wider font-bold animate-pulse">{loadingStatus}</span>
              </div>
            ) : cameraActive && !gameCompleted ? (
              <>
                <canvas 
                  ref={canvasRef} 
                  width={640} 
                  height={360} 
                  className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]"
                />

                {/* Progress ring/overlay when detecting target sign */}
                {holdProgress > 0 && (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center gap-3 transition-all duration-300">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-400 transition-all duration-300" strokeDasharray={`${holdProgress}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="text-xs font-mono font-bold text-emerald-400">{holdProgress}%</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-100 tracking-widest animate-pulse">Locking Sign... Hold Still</span>
                  </div>
                )}

                {showSuccessOverlay && (
                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs flex flex-col items-center justify-center gap-2 animate-success-confetti z-10">
                    <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-400 uppercase tracking-widest mt-2">Sign Success!</span>
                    <span className="text-xs font-mono text-slate-300">+10 Score Awarded</span>
                  </div>
                )}
              </>
            ) : gameCompleted ? (
              <div className="flex flex-col items-center gap-4 text-center p-8 select-none z-10 animate-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/20">
                  <svg className="h-10 w-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a3 3 0 00-3-3H6a3 3 0 00-3 3v7a3 3 0 003 3h3a3 3 0 003-3V8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h9m-9 4h6m-6 4h3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-slate-100 font-extrabold text-base tracking-wide uppercase">Challenge Completed!</h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
                    You successfully demonstrated all vocabulary gestures in our Indian Sign Language database!
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex gap-6 text-left mt-2 shadow-inner">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Final Score</span>
                    <span className="text-xl font-black text-amber-400 font-mono">{score} Pts</span>
                  </div>
                  <div className="border-l border-slate-800 pl-6">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Streaks Met</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{streak} Wins</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetGame}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-650 hover:scale-[1.02] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg cursor-pointer mt-4"
                >
                  Restart Training Challenge
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6 select-none z-10">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-lg group-hover:scale-105 transition-all duration-300">
                  <svg className="h-8 w-8 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-slate-350 font-bold text-sm tracking-wide">Webcam Offline</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px]">Enable your camera to begin the interactive sign language training game.</p>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-955/95 flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="text-rose-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Camera Access Error
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

          {/* Action buttons */}
          {!gameCompleted && (
            <div className="flex items-center gap-3 mt-6 z-10 w-full">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                disabled={!scriptsLoaded}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50 ${
                  cameraActive 
                    ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/35' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-650 text-white shadow-lg shadow-emerald-600/15 hover:shadow-emerald-500/25 hover:scale-[1.01]'
                }`}
              >
                {cameraActive ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disable Camera
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Enable Camera Feed
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Game HUD dashboard & Achievements */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Game status display */}
        <div className="bg-slate-900/40 border border-slate-850/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3 z-10 relative">
              <h2 className="text-xs font-bold text-slate-455 uppercase tracking-wider">Practice Challenge Dashboard</h2>
              <span className="text-[10px] text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-bold uppercase tracking-wider">
                {currentChallengeIdx + 1} / {PRACTICE_CHALLENGES.length} Sign
              </span>
            </div>

            {/* Score & streak row */}
            <div className="grid grid-cols-2 gap-4 mb-4 z-10 relative">
              <div className="bg-slate-955/80 border border-slate-850/60 rounded-xl p-3 shadow-inner">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Total Score</span>
                <div className="text-2xl font-black text-amber-450 font-mono mt-0.5">{score} Pts</div>
              </div>
              <div className="bg-slate-955/80 border border-slate-850/60 rounded-xl p-3 shadow-inner">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Combo Streak</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">x{streak} Combo</div>
              </div>
            </div>

            {!gameCompleted ? (
              <div className="bg-slate-955/80 border border-slate-850/60 rounded-2xl p-5 min-h-[140px] flex flex-col justify-between gap-4 relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-purple-400 uppercase tracking-widest font-bold font-mono">Current Objective</span>
                  <span className="text-2xl font-black tracking-tight text-white uppercase">{activeChallenge?.word}</span>
                  <span className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">
                    {activeChallenge?.instructions}
                  </span>
                </div>

                <div className="border-t border-slate-900/60 pt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span className="text-purple-400">💡 Hint:</span>
                    <span>{activeChallenge?.hint}</span>
                  </div>
                  
                  {cameraActive && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 border-t border-slate-900/30 pt-2">
                      <span>Live Feedback: We detect</span>
                      <strong className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider ${
                        detectedText === activeChallenge?.word
                          ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 border border-slate-850'
                      }`}>
                        {detectedText === 'Idle' ? 'No Hand Visible' : detectedText}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-955/80 border border-slate-850/60 rounded-2xl p-5 text-center min-h-[140px] flex flex-col items-center justify-center relative z-10">
                <h4 className="text-slate-100 font-bold text-sm uppercase">Challenge Mastered</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">All gesture lessons completed. Practice again to beat your streak record!</p>
              </div>
            )}
          </div>

          {/* Practice utilities */}
          {!gameCompleted && (
            <div className="border-t border-slate-900/60 pt-6 flex gap-3 relative z-10">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 h-11 bg-slate-955 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-slate-100 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-inner"
              >
                Skip Gesture
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleResetGame}
                className="h-11 px-4.5 bg-slate-955 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-500 hover:text-slate-350 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-inner"
                title="Restart training from first gesture"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Achievements dashboard card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex-1 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <svg className="h-4.5 w-4.5 text-amber-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Unlocked Game Achievements
            </h3>

            <div className="flex flex-col gap-3">
              {/* Achievement A */}
              <div className={`flex items-center gap-3 p-3.5 border rounded-2xl transition-all duration-300 ${
                achievements.includes('Sharp Student')
                  ? 'bg-purple-650/10 border-purple-500/30'
                  : 'bg-slate-950/20 border-slate-900 opacity-40'
              }`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  achievements.includes('Sharp Student') ? 'bg-purple-500/25 text-purple-400' : 'bg-slate-900 text-slate-600'
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${achievements.includes('Sharp Student') ? 'text-white' : 'text-slate-450'}`}>Sharp Student</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Achieve a streak of x3 combos without skipping.</p>
                </div>
              </div>

              {/* Achievement B */}
              <div className={`flex items-center gap-3 p-3.5 border rounded-2xl transition-all duration-300 ${
                achievements.includes('Sign Master')
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-950/20 border-slate-900 opacity-40'
              }`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  achievements.includes('Sign Master') ? 'bg-amber-500/25 text-amber-400' : 'bg-slate-900 text-slate-600'
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${achievements.includes('Sign Master') ? 'text-white' : 'text-slate-450'}`}>Sign Master</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Complete all Indian Sign Language vocabulary challenges.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeMode
