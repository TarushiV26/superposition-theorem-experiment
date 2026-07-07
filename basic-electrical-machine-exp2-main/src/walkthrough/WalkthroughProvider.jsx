import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import defaultWalkthroughConfig from './walkthroughConfig.json'
import { WalkthroughContext } from './WalkthroughContext.js'
import { loadWalkthroughConfig } from './walkthroughConfigLoader.js'
import WalkthroughOverlay from './components/WalkthroughOverlay.jsx'
import './walkthrough.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getElementRect = (element) => {
  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()

  if (rect.width === 0 && rect.height === 0) {
    return null
  }

  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  }
}

const WalkthroughProvider = ({
  autoPlayAudio = false,
  children,
  config = defaultWalkthroughConfig,
  locale,
  onComplete,
}) => {
  const walkthroughConfig = useMemo(
    () => loadWalkthroughConfig(config, locale ?? config?.defaultLocale),
    [config, locale],
  )
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPositioningTarget, setIsPositioningTarget] = useState(false)
  const [targetRect, setTargetRect] = useState(null)
  const audioRef = useRef(null)
const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const totalSteps = walkthroughConfig.steps.length
  const activeStep = isOpen ? walkthroughConfig.steps[currentStepIndex] : null
  const activeTargetSelector = activeStep?.target
  const currentStep = currentStepIndex + 1
  const canGoPrevious = currentStepIndex > 0
  const canGoNext = currentStepIndex < totalSteps - 1
  const autoPlayAudioForStep = Boolean(
    activeStep?.autoplayAudio
    ?? walkthroughConfig.audio?.autoplay
    ?? autoPlayAudio
  )

  const readActiveTarget = useCallback(() => {
    if (!activeTargetSelector) {
      setTargetRect(null)
      return null
    }
    
    const target = document.querySelector(activeTargetSelector)
    
    const nextRect = getElementRect(target)

    setTargetRect(nextRect)

    return target
  }, [activeTargetSelector])

  const moveToStep = useCallback((stepIndex) => {
    if (totalSteps === 0) {
      return
    }

    setTargetRect(null)
    setIsPositioningTarget(true)
    setCurrentStepIndex(clamp(stepIndex, 0, totalSteps - 1))
  }, [totalSteps])

  const start = useCallback((stepIndex = 0) => {
    moveToStep(stepIndex)
    setIsOpen(true)
  }, [moveToStep])
  const stopAudio = useCallback(() => {
  if (audioRef.current) {
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current = null
  }

  setIsAudioPlaying(false)
}, [])
useEffect(() => {
  const handleForceStop = () => {
    window.__SKIP_NEXT_WALKTHROUGH_AUDIO__ = true
    stopAudio()
  }

  window.addEventListener('force-stop-all-audio', handleForceStop)

  return () => {
    window.removeEventListener('force-stop-all-audio', handleForceStop)
  }
}, [stopAudio])
  const close = useCallback((completed = false) => {
  stopAudio()

  setIsOpen(false)
  setIsPositioningTarget(false)
  setTargetRect(null)

  if (completed) {
    window.dispatchEvent(new Event('walkthrough-complete'))
    onComplete?.()
  }
}, [onComplete, stopAudio])
  const next = useCallback(() => {
  stopAudio()

  if (currentStepIndex >= totalSteps - 1) {
    close(true)
    return
  }

  moveToStep(currentStepIndex + 1)
}, [
  close,
  currentStepIndex,
  moveToStep,
  stopAudio,
  totalSteps,
])
  const previous = useCallback(() => {
  stopAudio()
  moveToStep(currentStepIndex - 1)
}, [
  currentStepIndex,
  moveToStep,
  stopAudio,
])

 const goToStep = useCallback ((stepIndex) => {
    moveToStep(stepIndex)
  }, [moveToStep])
  


const playStepAudio = useCallback(() => {
  if (window.__SKIP_NEXT_WALKTHROUGH_AUDIO__) {
    window.__SKIP_NEXT_WALKTHROUGH_AUDIO__ = false
    setIsAudioPlaying(false)
    return
  }

  if (!activeStep?.audio) return

  stopAudio()

  const audio = new Audio(encodeURI(activeStep.audio))
  audioRef.current = audio

  audio.onended = () => {
    setIsAudioPlaying(false)
  }

  setIsAudioPlaying(true)

  audio.play().catch((err) => {
    console.error('Walkthrough audio failed:', err)
    setIsAudioPlaying(false)
  })
}, [activeStep, stopAudio])

const toggleStepAudio = useCallback(() => {
  if (!activeStep?.audio) return

  if (!audioRef.current) {
    playStepAudio()
    return
  }

  if (audioRef.current.paused) {
    setIsAudioPlaying(true)
    audioRef.current.play().catch(() => setIsAudioPlaying(false))
  } else {
    audioRef.current.pause()
    setIsAudioPlaying(false)
  }
}, [activeStep, playStepAudio])

const skipToLastStep = useCallback(() => {
  stopAudio()
  moveToStep(totalSteps - 1)
}, [moveToStep, stopAudio, totalSteps])
useEffect(() => {
  if (!isOpen || !activeTargetSelector) {
    return undefined
  }

  const target = document.querySelector(activeTargetSelector)

  target?.scrollIntoView({
    behavior: 'auto',
    block: 'center',
    inline: 'center',
  })

  let secondAnimationFrame = null

  const animationFrame = window.requestAnimationFrame(() => {
    secondAnimationFrame = window.requestAnimationFrame(() => {
      readActiveTarget()
      setIsPositioningTarget(false)
    })
  })

  return () => {
    window.cancelAnimationFrame(animationFrame)

    if (secondAnimationFrame) {
      window.cancelAnimationFrame(secondAnimationFrame)
    }
  }
}, [activeTargetSelector, isOpen, readActiveTarget])
useEffect(() => {
  if (!isOpen || isPositioningTarget) {
    return undefined
  }

  let animationFrame = null

  const scheduleRefresh = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame)
    }

    animationFrame = window.requestAnimationFrame(readActiveTarget)
  }

  window.addEventListener('resize', scheduleRefresh)
  window.visualViewport?.addEventListener('resize', scheduleRefresh)
  window.addEventListener('scroll', scheduleRefresh, true)

  return () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame)
    }

    window.removeEventListener('resize', scheduleRefresh)
    window.visualViewport?.removeEventListener('resize', scheduleRefresh)
    window.removeEventListener('scroll', scheduleRefresh, true)
  }
}, [isOpen, isPositioningTarget, readActiveTarget])
useEffect(() => {
  if (!isOpen || !activeTargetSelector) {
    return undefined
  }

  const target = document.querySelector(activeTargetSelector)

  if (!target) {
    return undefined
  }

  target.classList.add('walkthrough-active-target')

  return () => {
    target.classList.remove('walkthrough-active-target')
  }
}, [activeTargetSelector, isOpen])
 
useEffect(() => {
  if (!isOpen) {
    document.body.style.overflow = ''
    return undefined
  }

  document.body.style.overflow = 'hidden'

  return () => {
    document.body.style.overflow = ''
  }
}, [isOpen])
useEffect(() => {
  if (!isOpen || !activeStep?.audio) {
    stopAudio()
    return
  }

  playStepAudio()

  return () => {
    stopAudio()
  }
}, [activeStep, isOpen, playStepAudio, stopAudio])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
   
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key === 'ArrowRight' && canGoNext) {
        event.preventDefault()
        next()
        return
      }

      if (event.key === 'ArrowLeft' && canGoPrevious) {
        event.preventDefault()
        previous()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, close, isOpen, next, previous])

  const contextValue = useMemo(() => ({
    activeStep,
    autoPlayAudioForStep,
    canGoNext,
    canGoPrevious,
    close,
    config: walkthroughConfig,
    currentStep,
    currentStepIndex,
    experimentName: walkthroughConfig.experimentName,
    goToStep,
    isOpen,
    isPositioningTarget,
    locale: walkthroughConfig.locale,
    next,
    previous,
    start,
    targetRect,
    totalSteps,
   isAudioPlaying,
skipToLastStep,
toggleStepAudio,
  }), [
    activeStep,
    autoPlayAudioForStep,
    canGoNext,
    canGoPrevious,
    close,
    currentStep,
    currentStepIndex,
    goToStep,
    isOpen,
    isPositioningTarget,
    next,
    previous,
    start,
    targetRect,
    totalSteps,
    walkthroughConfig,
    isAudioPlaying,
skipToLastStep,
toggleStepAudio,
  ])

  return (
    <WalkthroughContext.Provider value={contextValue}>
      {children}
      <WalkthroughOverlay />
    </WalkthroughContext.Provider>
  )
}

export default WalkthroughProvider
