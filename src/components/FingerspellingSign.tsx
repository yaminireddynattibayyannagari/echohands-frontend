import React from 'react'

interface FingerspellingSignProps {
  letter: string
  className?: string
}

export const FingerspellingSign: React.FC<FingerspellingSignProps> = ({ letter, className = 'h-16 w-16' }) => {
  const cleanLetter = letter.toUpperCase().trim()

  // High-fidelity stylized SVGs representing the hand shapes of fingerspelling alphabet A-Z
  const renderSVG = () => {
    switch (cleanLetter) {
      case 'A':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Fist outline with thumb on side */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c0 1.5-1.5 2-3 2s-3-.5-3-2V9.5a1.5 1.5 0 013 0v1.5m0-1.5V9.5a1.5 1.5 0 013 0v1.5m0-1.5V9.5a1.5 1.5 0 013 0v4.5M6 14V9.5a1.5 1.5 0 013 0" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.5v3c0 2-1 3.5-3 3.5H9c-2 0-3-1.5-3-3.5" />
            {/* Thumb on the side, extended slightly up */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 14.5c1.5 0 2.5-.5 2.5-1.8V9.5c0-.8-.6-1.5-1.4-1.5s-1.1.4-1.1 1.2v3.6" />
          </svg>
        )
      case 'B':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Flat hand with thumb folded in front of palm */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14V4.5a1.2 1.2 0 012.4 0V11m0-6.5V4.5a1.2 1.2 0 012.4 0V11m0-6.5V4.5a1.2 1.2 0 012.4 0V11m0-6.5V5.5a1.2 1.2 0 012.4 0v7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v.5c0 2.5 1.5 3.5 3.5 3.5h2.5c2 0 3.5-1 3.5-3.5v-3.5" />
            {/* Folded thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5c1 .5 2 1 3 0s1.5-2 .5-2" />
          </svg>
        )
      case 'C':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Curved fingers forming a C shape */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 6.5C14.5 4.5 11 4.5 9 6.5s-2 5 0 7 5.5 2 7 0" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6c-1-1.5-3-1.8-4.5-1s-2 3-1.5 4.5 2.5 2.5 4 1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12c-1.5-.5-2.5-2-2.5-3.5s1-3 2.5-3.5" />
            {/* Curved thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 15.5c2 0 4-1 5-2.5" />
          </svg>
        )
      case 'D':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index finger pointing straight up, others closed in a circle with thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11V3.5a1.2 1.2 0 012.4 0V11" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.9 11v-1.5a1.2 1.2 0 012.4 0v2m0-2v.5a1.2 1.2 0 012.4 0v2.5m0-2.5v1a1.2 1.2 0 012.4 0V14c0 2-1 3.5-3 3.5h-3c-2 0-3.5-1.5-3.5-3.5v-3" />
            {/* Thumb touching middle finger */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.8 13.5c1.5-.5 3-1 4.2-1" />
          </svg>
        )
      case 'E':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* All fingers folded tightly, tips curled to touch thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V9a1 1 0 012 0v2m0-2V9a1 1 0 012 0v2m0-2V9a1 1 0 012 0v2m0-2v-.5a1 1 0 012 0v4.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11v2c0 2 1.5 3 3.5 3h2c2 0 3.5-1 3.5-3v-2.5" />
            {/* Thumb tucked under finger tips */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 13.5c2 0 4-1 6.5-.5" />
          </svg>
        )
      case 'F':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and thumb form a circle, other three fingers extended straight up */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V4.5a1.2 1.2 0 012.4 0V11m0-6.5V4.5a1.2 1.2 0 012.4 0V11m0-6.5V5.5a1.2 1.2 0 012.4 0v6.5" />
            {/* Circle for index and thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12a2 2 0 10-4 0 2 2 0 004 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14v1c0 2 1.5 3 3.5 3h3.5c2 0 3.5-1 3.5-3v-3.5" />
          </svg>
        )
      case 'G':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and thumb extended horizontally pointing side, others folded */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9.5h8.5a1.2 1.2 0 010 2.4H8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 13.5h5.5a1.2 1.2 0 010 2.4H8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9.5v6.5c0 1.5-1 2.5-2.5 2.5S3 17.5 3 16V9.5" />
          </svg>
        )
      case 'H':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and middle extended horizontally, others folded */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9.5h9a1.2 1.2 0 010 2.4H8m0-2.4h8a1.2 1.2 0 010 2.4H8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5v2.5a1.5 1.5 0 003 0v-2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9.5v5.5c0 1.5-1 2.5-2.5 2.5S3 16.5 3 15V9.5" />
          </svg>
        )
      case 'I':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Pinky finger extended straight up, others closed with thumb over them */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 11V7.5a1.2 1.2 0 012.4 0V11" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14c0 1-1 2-2 2s-2-.5-2-2v-3.5a1.2 1.2 0 012.4 0v1.5m0-1.5V10.5a1.2 1.2 0 012.4 0v1.5m0-1.5V10.5a1.2 1.2 0 012.4 0v2.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v1c0 2 1.5 3 3.5 3h3.5c2 0 3.5-1 3.5-3v-3.5" />
            {/* Thumb crossing over */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.5c2 0 4-.5 5.5-1.5" />
          </svg>
        )
      case 'J':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Pinky swooping down and up like a J curve */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 9v3.5c0 2-1 3.5-3 3.5s-2.5-1-2.5-2.5m5.5-4.5c0-1.2-.8-2-1.8-2s-1.8.8-1.8 2v3.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 14c0 1.5 1 2.5 2.5 2.5h3.5c2 0 3.5-1 3.5-3.5V9.5" />
            {/* Motion swoosh lines for J gesture */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" d="M17.5 12.5C18 14 18.5 15.5 17 17.5s-3 1.5-4.5 1.5" />
          </svg>
        )
      case 'K':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and middle extended, thumb pointing up between them */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 11V3.5a1.2 1.2 0 012.4 0V11" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.9 11V5.5a1.2 1.2 0 012.4 0V11" />
            {/* Closed ring and pinky */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.3 12.5v1a1.2 1.2 0 012.4 0v1.5m0-1.5v1a1.2 1.2 0 012.4 0V15c0 2-1.5 3-3.5 3h-3.5c-2 0-3.5-1.5-3.5-3v-3.5" />
            {/* Thumb pointing upwards between index and middle */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14c1.5-.5 3-1 4.5-3" />
          </svg>
        )
      case 'L':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index pointing up, thumb extended horizontally at 90 deg */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12V3.5a1.2 1.2 0 012.4 0V12" />
            {/* Closed other fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.9 12v1.5a1.2 1.2 0 012.4 0v2m0-2v.5a1.2 1.2 0 012.4 0v2.5m0-2.5v1a1.2 1.2 0 012.4 0V15c0 2-1 3.5-3 3.5h-3c-2 0-3.5-1.5-3.5-3.5v-3" />
            {/* Thumb sticking out horizontally */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12c-1.5 0-3.5.5-4.5 1.5S4 15.5 5 16.5h4.5" />
          </svg>
        )
      case 'M':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Fist with thumb tucked under index, middle, and ring finger */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14V9.5a1.2 1.2 0 012.4 0v2.5m0-2.5V9.5a1.2 1.2 0 012.4 0v2.5m0-2.5V9.5a1.2 1.2 0 012.4 0v3.5m0-3.5v1a1.2 1.2 0 012.4 0v3.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v1c0 2 1.5 3 3.5 3h3.5c2 0 3.5-1 3.5-3v-3.5" />
            {/* Thumb tucked under three fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5H9" />
          </svg>
        )
      case 'N':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Fist with thumb tucked under index and middle finger */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14V9.5a1.2 1.2 0 012.4 0v2.5m0-2.5V9.5a1.2 1.2 0 012.4 0v3.5m0-3.5v1c1.2 0 2.4 0 2.4 2.5v3.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v1c0 2 1.5 3 3.5 3h3.5c2 0 3.5-1 3.5-3v-3.5" />
            {/* Thumb tucked under two fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 13.5H9" />
          </svg>
        )
      case 'O':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Fingers curved and touching thumb to form an O circle */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        )
      case 'P':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Similar to K but pointing down (Index forward, middle down, thumb between) */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 10H17a1.2 1.2 0 010 2.4H9.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11v6.5a1.2 1.2 0 01-2.4 0V11" />
            {/* Thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5c1 .5 2 1.5 2 3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 10c-1.5 0-3 .5-3.5 2s0 3.5 1.5 3.5H9.5" />
          </svg>
        )
      case 'Q':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Similar to G but pointing down (Index and thumb down) */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8v8.5a1.2 1.2 0 01-2.4 0V8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 8v5.5a1.2 1.2 0 01-2.4 0V8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8h4.5c1.5 0 2.5 1 2.5 2.5S15.5 13 14 13V8" />
          </svg>
        )
      case 'R':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and middle fingers crossed over each other */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11c1-2.5 2.2-7.5.5-7.5s-2 5-1.5 7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 11c-1-2.5-2.2-7.5-.5-7.5s2 5 1.5 7.5" />
            {/* Folded other fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 12.5v1a1.2 1.2 0 012.4 0v1.5m0-1.5v1a1.2 1.2 0 012.4 0V15c0 2-1 3.5-3 3.5h-3c-2 0-3.5-1.5-3.5-3.5v-3.5" />
            {/* Thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14c1 .5 2 1.2 3.5.8" />
          </svg>
        )
      case 'S':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* A tight fist with thumb wrapped across the front of all fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 14c0 1.5-1.2 2-2.5 2s-2.5-.5-2.5-2V9.5a1.2 1.2 0 012.4 0v1.5m0-1.5V9.5a1.2 1.2 0 012.4 0v1.5m0-1.5V9.5a1.2 1.2 0 012.4 0v1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.4 14V9.5a1.2 1.2 0 012.4 0" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.4 14v1c0 2 1 3 3 3h3.5c2 0 3-1 3-3V11.5" />
            {/* Thumb wrapped horizontally over the front */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.5c2 .5 5 1 8 0" />
          </svg>
        )
      case 'T':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Fist with thumb tucked inside under the index finger */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14V9.5a1.2 1.2 0 012.4 0v2.5m0-2.5V9.5a1.2 1.2 0 012.4 0v3.5m0-3.5v1a1.2 1.2 0 012.4 0v3.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v1c0 2 1.5 3 3.5 3h3.5c2 0 3.5-1 3.5-3v-3.5" />
            {/* Thumb tucked under index only */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 13.5H9" />
          </svg>
        )
      case 'U':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and middle finger extended straight up, pressed together */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11V3.5a1.2 1.2 0 012.4 0V11m0-7.5V3.5a1.2 1.2 0 012.4 0V11" />
            {/* Closed remaining fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.3 12.5v1a1.2 1.2 0 012.4 0v1.5m0-1.5v1a1.2 1.2 0 012.4 0V15c0 2-1.5 3.5-3.5 3.5H9.7c-2 0-3.5-1.5-3.5-3.5v-3" />
            {/* Thumb crossing over */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 13.5c1.5 0 3-.5 4-1.2" />
          </svg>
        )
      case 'V':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index and middle fingers extended up, spread apart in a V shape */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 11L7 3.5a1.2 1.2 0 012.4-.5l1.1 8m0-8l1.1-7.5a1.2 1.2 0 012.4.5L12.5 11" />
            {/* Closed remaining fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.9 12.5v1a1.2 1.2 0 012.4 0v1.5m0-1.5v1a1.2 1.2 0 012.4 0V15c0 2-1 3.5-3 3.5h-3c-2 0-3.5-1.5-3.5-3.5v-3.5" />
            {/* Thumb crossing */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 13.5c1.5 0 3-.5 4-1.2" />
          </svg>
        )
      case 'W':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index, middle and ring fingers extended up, spread apart */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 11L7 3.5a1.1 1.1 0 012.2-.5l1.1 8m0-8l.5-7.5a1.1 1.1 0 012.2.3L12.5 11m0-8l1.1-7.5a1.1 1.1 0 012.2.5L14.7 11" />
            {/* Pinky closed, thumb holding pinky tip */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 12.5v1c0 2-.8 3-2.5 3H9.7c-2 0-3.5-1-3.5-3v-3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 13.5c1.5 0 2.5-1 3.5-2" />
          </svg>
        )
      case 'X':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index finger curved like a hook/question mark, others closed */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11V6.5a1.5 1.5 0 013 0c0 .8-.5 1.2-1 1.8l-1.5 2.2V11" />
            {/* Closed remaining fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.9 12v1.5a1.2 1.2 0 012.4 0v2m0-2v.5a1.2 1.2 0 012.4 0v2.5m0-2.5v1a1.2 1.2 0 012.4 0V15c0 2-1 3.5-3 3.5h-3c-2 0-3.5-1.5-3.5-3.5v-3" />
            {/* Thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.8 13.5c1.5-.5 3-1 4.2-1" />
          </svg>
        )
      case 'Y':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Thumb and pinky extended, middle three fingers closed */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 11v-2.5c0-.8.6-1.5 1.4-1.5s1.4.7 1.4 1.5V11" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 11V8.5c0-.8.6-1.5 1.4-1.5s1.4.7 1.4 1.5V11" />
            {/* Closed middle fingers */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.3 12v1.5a1.2 1.2 0 002.4 0v-1.5m0 1.5V13a1.2 1.2 0 002.4 0v-1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 11v4c0 2 1.5 3 3.5 3h3.5c2 0 3.5-1 3.5-3v-4" />
          </svg>
        )
      case 'Z':
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Index finger tracing Z shape in air */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11V3.5a1.2 1.2 0 012.4 0V11" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.9 11v-1.5a1.2 1.2 0 012.4 0v2m0-2v.5a1.2 1.2 0 012.4 0v2.5m0-2.5v1a1.2 1.2 0 012.4 0V14c0 2-1 3.5-3 3.5h-3c-2 0-3.5-1.5-3.5-3.5v-3" />
            {/* Thumb */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.8 13.5c1.5-.5 3-1 4.2-1" />
            {/* Tracing lines Z */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M16 4.5h3.5l-3.5 4.5h3.5" />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {/* Standard hand icon outline */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V4.5a1.5 1.5 0 013 0V11m0-3.5a1.5 1.5 0 013 0V11m-9 .5V8.5a1.5 1.5 0 013 0V12m-3-1v3a6 6 0 0012 0v-3.5a1.5 1.5 0 00-3 0V11" />
          </svg>
        )
    }
  }

  return (
    <div className={`text-purple-400 group-hover:text-purple-300 transition-colors duration-300 ${className}`}>
      {renderSVG()}
    </div>
  )
}
