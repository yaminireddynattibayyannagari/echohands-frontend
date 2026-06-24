import React, { useState, useEffect, useRef } from 'react'

// Interfaces for dictionary items
interface SignItem {
  label: string
  description: string
  videoUrl: string
  translations?: {
    hindi: string
    telugu: string
    tamil: string
  }
  transliterations?: string[]
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => unknown
  webkitSpeechRecognition?: new () => unknown
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
}

// Dictionary of known words/sentences mapped to custom ISL gestures
const defaultDictionary: Record<string, SignItem> = {
  'hello everyone': {
    label: 'HELLO EVERYONE',
    description: 'Indian Sign Language gesture for greeting everyone (Namaste).',
    videoUrl: '/videos/hello_everyone.mp4',
    translations: {
      hindi: 'सभी को नमस्कार',
      telugu: 'అందరికీ నమస్కారం',
      tamil: 'அனைவருக்கும் வணக்கம்'
    },
    transliterations: [
      'sabhi ko namaskar',
      'namaste sabhi ko',
      'sabhiko namaskar',
      'namaste sabhiko',
      'namaskar',
      'namaste',
      'andariki namaskaram',
      'andariki namaskaraalu',
      'anaivarukkum vanakkam'
    ]
  },
  'had your lunch': {
    label: 'HAD YOUR LUNCH',
    description: 'Indian Sign Language gesture for asking if someone has eaten lunch.',
    videoUrl: '/videos/had_your_lunch.mp4',
    translations: {
      hindi: 'क्या आपने दोपहर का भोजन किया?',
      telugu: 'మీరు భోజనం చేశారా?',
      tamil: 'மதிய உணவு சாப்பிட்டீர்களா?'
    },
    transliterations: [
      'kya aapne dopahar ka bhojan kiya',
      'khana kha liya',
      'khana khaliya',
      'bhojan ho gaya',
      'meeru bhojanam chesaara',
      'bhojanam chesaara',
      'bhojanam chesara',
      'meeru bhojanam chesara',
      'sappittirgala',
      'saapiteergala',
      'lunch thinnava',
      'lunch tinnaara',
      'had you lounch',
      'had you lunch',
      'had your lounch'
    ]
  },
  'thank you': {
    label: 'THANK YOU',
    description: 'Indian Sign Language gesture for expressing gratitude.',
    videoUrl: '/videos/thank_you.mp4',
    translations: {
      hindi: 'धन्यवाद',
      telugu: 'ధన్యవాదాలు',
      tamil: 'நன்றி'
    },
    transliterations: [
      'dhanyavaad',
      'dhanyavad',
      'shukriya',
      'dhanyavadalu',
      'nandri',
      'nandri hal',
      'thankyou'
    ]
  },
  'how are you': {
    label: 'HOW ARE YOU',
    description: 'Indian Sign Language gesture for asking how someone is.',
    videoUrl: '/videos/how_are_you.mp4',
    translations: {
      hindi: 'आप कैसे हैं?',
      telugu: 'మీరు ఎలా ఉన్నారు?',
      tamil: 'நீங்கள் எப்படி இருக்கிறீர்கள்?'
    },
    transliterations: [
      'aap kaise ho',
      'aap kaise hain',
      'kaise ho',
      'kaise hain',
      'meeru ela unnaaru',
      'meeru ela unnaru',
      'ela unnaaru',
      'ela unnaru',
      'neengal eppadi irukkireergal',
      'eppadi irukkireergal',
      'eppadi irukkingal',
      'how are you'
    ]
  },
  'what is your name': {
    label: 'WHAT IS YOUR NAME',
    description: "Indian Sign Language gesture for asking someone's name.",
    videoUrl: '/videos/what_is_your_name.mp4',
    translations: {
      hindi: 'आपका नाम क्या है?',
      telugu: 'మీ పేరు ఏమిటి?',
      tamil: 'உங்கள் பெயர் என்ன?'
    },
    transliterations: [
      'aapka naam kya hai',
      'aapka nam kya hai',
      'mee peru emiti',
      'mee peru enti',
      'me peru emiti',
      'ungal peyar enna'
    ]
  },
  'where are you going': {
    label: 'WHERE ARE YOU GOING',
    description: 'Indian Sign Language gesture for asking where someone is going.',
    videoUrl: '/videos/where_are_you_going.mp4',
    translations: {
      hindi: 'आप कहाँ जा रहे हैं?',
      telugu: 'మీరు ఎక్కడికి వెళ్తున్నారు?',
      tamil: 'நீங்கள் எங்கே போகிறீர்கள்?'
    },
    transliterations: [
      'आप कहाँ जा रहे हैं',
      'aap kaha ja rahe ho',
      'aap kahaan ja rahe hain',
      'meeru ekkadiki velthunnaaru',
      'ekkadiki velthunnaru',
      'neengal enge pogireergal',
      'enge pogiringal'
    ]
  },
  'hello': {
    label: 'HELLO',
    description: 'Waving open hand gesture with fingers spread out.',
    videoUrl: '/videos/hello.mp4',
    translations: {
      hindi: 'नमस्ते',
      telugu: 'హలో / నమస్కారం',
      tamil: 'வணக்கம்'
    },
    transliterations: [
      'namaste',
      'namaskar',
      'vanakkam',
      'namaskaram',
      'hello'
    ]
  },
  'yes': {
    label: 'YES',
    description: 'Closed fist tilting forward and backward, nodding.',
    videoUrl: '/videos/yes.mp4',
    translations: {
      hindi: 'हाँ',
      telugu: 'అవును',
      tamil: 'ஆம்'
    },
    transliterations: [
      'haan',
      'ha',
      'avunu',
      'ama',
      'am',
      'yes'
    ]
  },
  'no': {
    label: 'NO',
    description: 'Extended index and middle finger snap down onto the thumb.',
    videoUrl: '/videos/no.mp4',
    translations: {
      hindi: 'नहीं',
      telugu: 'వద్దు / కాదు',
      tamil: 'இல்லை'
    },
    transliterations: [
      'nahi',
      'nahi ho',
      'naa',
      'vaddu',
      'kaadu',
      'illai',
      'no'
    ]
  },
  'stop': {
    label: 'STOP',
    description: 'Flat open palm extended outward, fingers vertical.',
    videoUrl: '/videos/stop.mp4',
    translations: {
      hindi: 'रुकिए',
      telugu: 'ఆగండి',
      tamil: 'நில்லுங்கள்'
    },
    transliterations: [
      'ruko',
      'rukiye',
      'aagandi',
      'nillungal',
      'stop'
    ]
  }
}

export const SpeakToSign: React.FC = () => {
  const [micActive, setMicActive] = useState<boolean>(false)
  const [inputText, setInputText] = useState<string>('')
  const [recognizedText, setRecognizedText] = useState<string>('hello everyone')
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)

  // Playlist tracking
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0)
  const [spellingIndex, setSpellingIndex] = useState<number>(0)
  const [isListening, setIsListening] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  // Load custom videos state
  const [customVideos, setCustomVideos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('echohands_custom_videos')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Selected language state for translations
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'telugu' | 'tamil'>('english')

  // Customizer panel active state
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false)

  // Ref for the output video element
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null)

  // Helper helper to get active video source
  const getVideoUrl = (key: string) => {
    const rawUrl = customVideos[key] || defaultDictionary[key]?.videoUrl || ''
    if (rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
      const base = import.meta.env.BASE_URL || '/'
      return `${base.replace(/\/$/, '')}${rawUrl}`
    }
    return rawUrl
  }

  // Normalize string for dictionary key checking
  const getNormalizedKey = (text: string) => {
    return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ")
  }

  // Helper to detect language of input text and automatically update the UI language dropdown
  const detectLanguageAndSet = (text: string) => {
    const normalizedInput = getNormalizedKey(text)

    // 1. Direct match with English keys
    if (normalizedInput in defaultDictionary) {
      setSelectedLanguage('english')
      return
    }

    // 2. Scan translations & transliterations in dictionary
    for (const item of Object.values(defaultDictionary)) {
      if (item.translations) {
        if (getNormalizedKey(item.translations.hindi) === normalizedInput) {
          setSelectedLanguage('hindi')
          return
        }
        if (getNormalizedKey(item.translations.telugu) === normalizedInput) {
          setSelectedLanguage('telugu')
          return
        }
        if (getNormalizedKey(item.translations.tamil) === normalizedInput) {
          setSelectedLanguage('tamil')
          return
        }
      }

      if (item.transliterations) {
        if (item.transliterations.some(t => getNormalizedKey(t) === normalizedInput)) {
          const hindiWords = ['namaste', 'namaskar', 'sabhi', 'ko', 'kya', 'aapne', 'dopahar', 'bhojan', 'kiya', 'khana', 'kha', 'liya', 'khaliya', 'dhanyavaad', 'dhanyavad', 'shukriya', 'aapka', 'naam', 'kya', 'hai', 'aap', 'kaha', 'ja', 'rahe', 'ho', 'kahaan', 'hain', 'haan', 'ha', 'nahi', 'ruko', 'rukiye', 'kaise']
          const teluguWords = ['andariki', 'namaskaram', 'namaskaraalu', 'meeru', 'bhojanam', 'chesaara', 'chesara', 'thinnava', 'tinnaara', 'dhanyavadalu', 'peru', 'emiti', 'enti', 'ekkadiki', 'velthunnaaru', 'velthunnaru', 'avunu', 'naa', 'vaddu', 'kaadu', 'aagandi', 'ela', 'unnaru', 'unnaaru']
          const tamilWords = ['anaivarukkum', 'vanakkam', 'sappittirgala', 'saapiteergala', 'nandri', 'ungal', 'peyar', 'enna', 'neengal', 'enge', 'pogireergal', 'pogiringal', 'ama', 'am', 'illai', 'nillungal', 'eppadi', 'irukkireergal', 'irukkingal']
          
          const inputWords = normalizedInput.split(' ')
          const hiCount = inputWords.filter(w => hindiWords.includes(w)).length
          const teCount = inputWords.filter(w => teluguWords.includes(w)).length
          const taCount = inputWords.filter(w => tamilWords.includes(w)).length

          if (hiCount > teCount && hiCount > taCount) {
            setSelectedLanguage('hindi')
            return
          } else if (teCount > hiCount && teCount > taCount) {
            setSelectedLanguage('telugu')
            return
          } else if (taCount > hiCount && taCount > teCount) {
            setSelectedLanguage('tamil')
            return
          }

          if (teluguWords.some(w => normalizedInput.includes(w))) {
            setSelectedLanguage('telugu')
            return
          }
          if (tamilWords.some(w => normalizedInput.includes(w))) {
            setSelectedLanguage('tamil')
            return
          }
          if (hindiWords.some(w => normalizedInput.includes(w))) {
            setSelectedLanguage('hindi')
            return
          }
        }
      }
    }
  }

  // Determine playable list (prioritize full sentence matches, fallback to split words)
  const getPlayableList = () => {
    const normalizedInput = getNormalizedKey(recognizedText)
    
    // 1. Direct match with English keys
    if (normalizedInput in defaultDictionary) {
      return [normalizedInput]
    }
    
    // 2. Scan translations & transliterations to see if the input matches any Hindi, Telugu, or Tamil translations or transliterations
    for (const [englishKey, item] of Object.entries(defaultDictionary)) {
      if (item.translations) {
        for (const langText of Object.values(item.translations)) {
          if (getNormalizedKey(langText) === normalizedInput) {
            return [englishKey]
          }
        }
      }
      if (item.transliterations) {
        for (const transText of item.transliterations) {
          if (getNormalizedKey(transText) === normalizedInput) {
            return [englishKey]
          }
        }
      }
    }
    
    // 3. Fallback: split by space and translate word-by-word
    return recognizedText.trim().toLowerCase().split(/\s+/).filter(Boolean)
  }

  const playlist = getPlayableList()
  const activeItem = playlist[activeWordIndex]
  const isSpellingMode = !!(activeItem && !(activeItem in defaultDictionary))

  const updateCustomVideo = (key: string, value: string) => {
    const updated = { ...customVideos, [key]: value }
    setCustomVideos(updated)
    try {
      localStorage.setItem('echohands_custom_videos', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save custom video:', e)
    }
  }

  // Playback timer loop to step through spelling letters (video duration manages normal signs)
  useEffect(() => {
    if (!isPlaying || playlist.length === 0) return

    const itemToPlay = playlist[activeWordIndex]
    const hasItem = itemToPlay in defaultDictionary

    if (hasItem) {
      return
    }

    const stepInterval = 1000 / playbackSpeed
    const timer = setTimeout(() => {
      if (spellingIndex < itemToPlay.length - 1) {
        setSpellingIndex((prev) => prev + 1)
      } else {
        setSpellingIndex(0)
        if (activeWordIndex < playlist.length - 1) {
          setActiveWordIndex((prev) => prev + 1)
        } else {
          setIsPlaying(false)
        }
      }
    }, stepInterval)

    return () => clearTimeout(timer)
  }, [isPlaying, activeWordIndex, spellingIndex, playlist, playbackSpeed])

  // Sync video element speed and playback status
  useEffect(() => {
    const video = videoPlayerRef.current
    if (video) {
      video.playbackRate = playbackSpeed
      if (isPlaying) {
        video.play().catch(() => { })
      } else {
        video.pause()
      }
    }
  }, [isPlaying, playbackSpeed, activeWordIndex, spellingIndex])

  // Mic audio level peaks visualizer
  useEffect(() => {
    if (!micActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Clean slate background with nice look
      ctx.fillStyle = '#090d16'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      const numLines = 30
      const spacing = canvas.width / numLines
      const centerY = canvas.height / 2

      for (let i = 0; i < numLines; i++) {
        const x = i * spacing + spacing / 2
        const distanceToCenter = Math.abs(i - numLines / 2) / (numLines / 2)
        const multiplier = Math.max(0.1, 1 - distanceToCenter)
        const wave = Math.sin(frame * 0.15 + i * 0.25) + Math.cos(frame * 0.08 + i * 0.45)
        const amp = wave * 30 * multiplier * (0.3 + Math.random() * 0.7)
        const height = Math.max(5, Math.abs(amp))

        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height)
        gradient.addColorStop(0, '#a855f7')
        gradient.addColorStop(0.5, '#6366f1')
        gradient.addColorStop(1, '#a855f7')

        ctx.strokeStyle = gradient
        ctx.beginPath()
        ctx.moveTo(x, centerY - height)
        ctx.lineTo(x, centerY + height)
        ctx.stroke()
      }

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText('RECORDING AUDIO LIVE...', 20, 30)

      frame++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [micActive])

  // Voice speech synthesis recognition simulation
  const startVoiceListening = () => {
    if (isListening) return

    const customWindow = window as unknown as SpeechWindow
    const SpeechRecognition = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsListening(true)
      setMicActive(true)
      const demoPhrases = [
        'hello everyone',
        'सभी को नमस्कार',
        'అందరికీ నమస్కారం',
        'அனைவருக்கும் வணக்கம்',
        'had your lunch',
        'क्या आपने दोपहर का भोजन किया?',
        'మీరు భోజనం చేశారా?',
        'மதிய உணவு சாப்பிட்டீர்களா?',
        'thank you',
        'धन्यवाद',
        'ధన్యవాదాలు',
        'நன்றி',
        'what is your name',
        'where are you going',
        'hello',
        'yes',
        'no',
        'stop',
        'how are you',
        'आप कैसे हैं?',
        'మీరు ఎలా ఉన్నారు?',
        'நீங்கள் எப்படி இருக்கிறீர்கள்?'
      ]
      setTimeout(() => {
        const randomPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)]
        detectLanguageAndSet(randomPhrase)
        
        // Reset playback stats synchronously
        setActiveWordIndex(0)
        setSpellingIndex(0)
        setRecognizedText(randomPhrase)
        
        setIsListening(false)
        setMicActive(false)
        setIsPlaying(true)
      }, 2500)
      return
    }

    const SpeechRecognitionClass = SpeechRecognition as new () => {
      continuous: boolean
      interimResults: boolean
      lang: string
      onstart: () => void
      onerror: (event: SpeechRecognitionErrorEvent) => void
      onend: () => void
      onresult: (event: SpeechRecognitionEvent) => void
      start: () => void
    }

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = false
    recognition.interimResults = false

    if (selectedLanguage === 'hindi') {
      recognition.lang = 'hi-IN'
    } else if (selectedLanguage === 'telugu') {
      recognition.lang = 'te-IN'
    } else if (selectedLanguage === 'tamil') {
      recognition.lang = 'ta-IN'
    } else {
      recognition.lang = 'en-IN'
    }

    recognition.onstart = () => {
      setIsListening(true)
      setMicActive(true)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setMicActive(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setMicActive(false)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        detectLanguageAndSet(transcript)
        setActiveWordIndex(0)
        setSpellingIndex(0)
        setRecognizedText(transcript)
        setIsPlaying(true)
      }
    }

    recognition.start()
  }

  // Handle manual typing translation
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    detectLanguageAndSet(inputText)
    
    // Reset playback stats synchronously
    setActiveWordIndex(0)
    setSpellingIndex(0)
    setRecognizedText(inputText)
    setIsPlaying(true)
    setInputText('')
  }

  // Handle transition when a word's gesture video finishes playing
  const handleVideoEnded = () => {
    if (activeWordIndex < playlist.length - 1) {
      setActiveWordIndex((prev) => prev + 1)
    } else {
      setIsPlaying(false)
    }
  }

  // Determine what sign graphic/video to render currently
  const renderSignOutput = () => {
    if (playlist.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center select-none min-h-[220px]">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner group-hover/screen:border-purple-500/20 transition-all duration-300">
            <svg className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-slate-350 font-bold text-sm tracking-wide">No Speech Input Active</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Speak or type manual text to render matching Indian Sign Language (ISL) gestures.</p>
        </div>
      )
    }

    const itemToPlay = playlist[activeWordIndex]
    const match = defaultDictionary[itemToPlay]

    if (match && !isSpellingMode) {
      const currentVideoUrl = getVideoUrl(itemToPlay)
      return (
        <div className="flex flex-col items-center justify-center p-2 text-center w-full animate-in fade-in duration-300">
          <div className="relative aspect-video w-full max-w-[380px] bg-slate-955 rounded-2xl overflow-hidden border border-slate-850 shadow-lg">
            <video
              key={itemToPlay + "_" + activeWordIndex}
              ref={videoPlayerRef}
              src={currentVideoUrl}
              autoPlay={isPlaying}
              muted
              playsInline
              onEnded={handleVideoEnded}
              onError={handleVideoEnded}
              className="w-full h-full object-cover"
            />
            {/* Hologram raster line overlay for premium look */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40" />
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-purple-500/50" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-500/50" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-500/50" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-500/50" />
          </div>
          <h3 className="text-white font-extrabold text-base mt-4 uppercase tracking-wider">{match.label}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[320px] font-medium leading-relaxed">{match.description}</p>
        </div>
      )
    } else {
      const currentWord = playlist[activeWordIndex]
      const letter = currentWord?.[spellingIndex]?.toUpperCase()
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
          <div className="h-28 w-28 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center relative overflow-hidden group shadow-lg shadow-purple-550/5">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:100%_4px]" />
            <span className="text-5xl font-extrabold text-purple-400 font-mono tracking-tighter animate-pulse">
              {letter}
            </span>
          </div>
          <h3 className="text-white font-extrabold text-base mt-4 uppercase tracking-wider">SPELLING: "{currentWord?.toUpperCase()}"</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-[280px] leading-relaxed">
            Spelling letter <strong className="text-purple-400 font-mono text-sm font-bold">"{letter}"</strong> sequentially (word not in dictionary).
          </p>
        </div>
      )
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full font-sans">
      {/* Left panel: Mic listener & text inputs */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-850/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500 pointer-events-none"></div>

          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider z-10 relative">Speech Input Recording</h2>

          {/* Waveform / Mic Panel */}
          <div className="relative h-[200px] w-full bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-855/60 flex items-center justify-center shadow-inner group/mic">
            {micActive ? (
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6 select-none z-10">
                <div className="relative flex items-center justify-center">
                  {/* Glowing concentric ripple rings */}
                  <span className="absolute inline-flex h-20 w-20 rounded-full bg-purple-550/10 animate-ripple"></span>
                  <span className="absolute inline-flex h-24 w-24 rounded-full bg-indigo-500/5 animate-ripple" style={{ animationDelay: '-0.7s' }}></span>
                  <button
                    type="button"
                    onClick={startVoiceListening}
                    disabled={isListening}
                    className="h-16 w-16 rounded-full bg-gradient-to-tr from-slate-900 to-slate-850 border border-slate-800 flex items-center justify-center text-slate-400 shadow-xl hover:text-purple-400 hover:border-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer hover:shadow-purple-500/10 z-10"
                    title="Start voice record"
                  >
                    <svg className="h-7 w-7 text-purple-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h3 className="text-slate-300 font-bold text-sm tracking-wide">
                    {isListening ? 'Listening...' : 'Voice input Offline'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                    {isListening ? 'Speak a translation phrase now...' : 'Tap the microphone to convert spoken voice to sign language.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manual text form */}
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-3 z-10 relative">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or type manually to translate</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type words here (e.g. hello, what is your name)"
                className="flex-1 bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus:border-purple-500/50 focus:bg-slate-950 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-650 hover:scale-[1.01] hover:-translate-y-0.5 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-600/15 cursor-pointer"
              >
                Translate
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel: Dynamic Sign Language Output Visualizer */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="bg-slate-900/40 border border-slate-850/80 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between flex-1 min-h-[380px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors duration-500 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4 z-10 relative">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Indian Sign Language (ISL) Output</h2>
            {playlist.length > 0 && (
              <div className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 font-bold uppercase tracking-wider">
                {isSpellingMode ? 'FINGERSPELLING' : 'ISL SIGN'}
              </div>
            )}
          </div>

          {/* Render output screen container */}
          <div className="bg-slate-955/60 border border-slate-850/60 rounded-2xl p-6 flex flex-col items-center justify-center flex-1 min-h-[240px] relative overflow-hidden group/screen shadow-inner z-10">
            {/* Background grid dots for tech look */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

            {renderSignOutput()}

            {/* Subtitle translations */}
            {playlist.length > 0 && !isSpellingMode && (
              <div className="mt-4 px-4 py-2.5 bg-slate-900/50 border border-slate-850 rounded-2xl w-full max-w-[380px] text-center flex flex-col gap-1 items-center animate-in fade-in duration-200 shadow-sm">
                <span className="text-[9px] text-purple-400 uppercase tracking-widest font-bold font-mono">
                  {selectedLanguage === 'english' ? 'English Text' : `${selectedLanguage.toUpperCase()} Translation`}
                </span>
                <span className="text-sm font-bold text-white tracking-wide">
                  {playlist[activeWordIndex] && defaultDictionary[playlist[activeWordIndex]]?.translations
                    ? (selectedLanguage === 'english'
                      ? defaultDictionary[playlist[activeWordIndex]].label
                      : defaultDictionary[playlist[activeWordIndex]].translations?.[selectedLanguage] || defaultDictionary[playlist[activeWordIndex]].label)
                    : playlist[activeWordIndex]?.toUpperCase()
                  }
                </span>
              </div>
            )}
          </div>

          {/* Active Playlist visual tracker */}
          {playlist.length > 0 && (
            <div className="mt-4 bg-slate-950/60 border border-slate-850/60 p-3.5 rounded-2xl z-10 relative">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">Translation Pipeline Playlist</div>
              <div className="flex items-center gap-2 flex-wrap">
                {playlist.map((word, index) => {
                  const isActive = index === activeWordIndex;
                  const isFinished = index < activeWordIndex;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-650 text-white border-transparent shadow-md' 
                          : isFinished 
                            ? 'bg-slate-900/40 text-slate-500 border-slate-900' 
                            : 'bg-slate-900/20 text-slate-400 border-slate-900'
                      }`}
                    >
                      {isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      )}
                      {word.toUpperCase()}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Media Playback Controls */}
          <div className="border-t border-slate-900/60 pt-6 mt-6 flex flex-col gap-4 z-10 relative">
            <div className="flex items-center justify-between flex-wrap gap-4">

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={playlist.length === 0}
                  className="h-10 px-5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-855 disabled:opacity-50 disabled:hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:border-slate-700"
                >
                  {isPlaying && playlist.length > 0 ? (
                    <>
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-ping"></span>
                      Pause Playback
                    </>
                  ) : 'Start Playback'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWordIndex(0)
                    setSpellingIndex(0)
                  }}
                  disabled={playlist.length === 0}
                  className="h-10 w-10 bg-slate-900 hover:bg-slate-850 border border-slate-855 text-slate-400 hover:text-slate-200 disabled:opacity-50 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:border-slate-700"
                  title="Reset Playback"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </button>

                {/* Manage Videos Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className={`h-10 px-3.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${showCustomizer
                      ? 'bg-purple-600/20 text-purple-400 border-purple-500/40'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-855 hover:border-slate-700'
                    }`}
                  title="Manage ISL Videos"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Custom Videos
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Language translation Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as 'english' | 'hindi' | 'telugu' | 'tamil')}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-200 cursor-pointer"
                  >
                    <option value="english" className="bg-slate-900 text-slate-100">English</option>
                    <option value="hindi" className="bg-slate-900 text-slate-100">Hindi (हिंदी)</option>
                    <option value="telugu" className="bg-slate-900 text-slate-100">Telugu (తెలుగు)</option>
                    <option value="tamil" className="bg-slate-900 text-slate-100">Tamil (தமிழ்)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="bg-slate-955 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-200 cursor-pointer"
                  >
                    <option value="0.5" className="bg-slate-900 text-slate-100">0.5x</option>
                    <option value="1.0" className="bg-slate-900 text-slate-100">1.0x (Normal)</option>
                    <option value="1.5" className="bg-slate-900 text-slate-100">1.5x</option>
                    <option value="2.0" className="bg-slate-900 text-slate-100">2.0x</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Video customizer configuration panel */}
            {showCustomizer && (
              <div className="bg-slate-955/80 border border-slate-850 rounded-2xl p-4 mt-2 animate-in slide-in-from-top-4 duration-300 relative">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manage ISL Video Dictionary</h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomizer(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Close Settings
                  </button>
                </div>

                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {Object.entries(defaultDictionary).map(([key, item]) => {
                    const isCustom = !!customVideos[key]
                    return (
                      <div key={key} className="bg-slate-900/20 border border-slate-900 p-3 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">{key}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg ${isCustom ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-950 text-slate-500 border border-slate-900'}`}>
                            {isCustom ? 'Customized' : 'Default'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Upload local file:</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const url = URL.createObjectURL(file)
                                  updateCustomVideo(key, url)
                                }
                              }}
                              className="block w-full text-[9px] text-slate-455 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-purple-600/15 file:text-purple-400 hover:file:bg-purple-600/20 cursor-pointer"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Or paste video URL:</span>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Paste MP4 URL"
                                value={customVideos[key] && !customVideos[key].startsWith('blob:') ? customVideos[key] : ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCustomVideo(key, e.target.value)}
                                className="bg-slate-955 border border-slate-850 rounded-lg px-2.5 py-1 text-[9px] text-slate-305 focus:outline-none focus:border-purple-500 flex-1 min-w-0"
                              />
                              {isCustom && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...customVideos }
                                    delete updated[key]
                                    setCustomVideos(updated)
                                    localStorage.setItem('echohands_custom_videos', JSON.stringify(updated))
                                  }}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border border-rose-500/20 text-[9px] font-bold px-2 rounded-lg cursor-pointer"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[9px] text-slate-500 mt-2 text-center">
                  Note: Uploaded local files persist for the active session. Use URL settings for permanent remote assets.
                </p>
              </div>
            )}

            {/* Source text display details */}
            <div className="bg-slate-955/60 border border-slate-850/60 rounded-2xl p-4 text-xs text-slate-400 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Active Spoken Transcript</span>
                <strong>Transcript:</strong> <span className="text-slate-200 font-medium">"{recognizedText}"</span>
              </div>
              <button 
                onClick={() => {
                  detectLanguageAndSet(recognizedText)
                  setIsPlaying(true)
                }}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-purple-550/20 hover:bg-purple-500/5 transition-all cursor-pointer"
              >
                Replay Sign
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default SpeakToSign;
