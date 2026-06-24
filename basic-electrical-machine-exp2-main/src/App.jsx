import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ConnectionEndpoints.css'
import ConnectionLab from './components/ConnectionLab.jsx'
import ActionButtons from './components/ActionButtons.jsx'
import ControlPanel from './components/ControlPanel.jsx'
//import GraphPanel from './components/GraphPanel.jsx'
import HeaderBoard from './components/HeaderBoard.jsx'
import CalculationPanel from './components/CalculationPanel.jsx'
import ReportControls from './components/ReportControls.jsx'
import WalkthroughStartButton from './walkthrough/components/WalkthroughStartButton.jsx'
import { EXPERIMENT_ALERTS } from './alerts/experimentStepAlerts.js'
import { useLabAlerts } from './alerts/useLabAlerts.js'
// import StatusBar from './components/StatusBar.jsx'
 
import { calculateReadings } from './utils/circuitMath.js'
import { generateSuperpositionReport } from './utils/reportGenerator.js'
import {
  AI_GUIDE_MESSAGES,
  AI_GUIDE_STEP_MESSAGES,
  speakGuideMessage,
} from './utils/aiGuide.js'
 
const BASE_WIDTH = 1440
const BASE_HEIGHT = 960
const GRAPH_SECTION_GAP = 28
const GRAPH_SECTION_HEIGHT = 1100
const CONTENT_HEIGHT = BASE_HEIGHT + GRAPH_SECTION_GAP + GRAPH_SECTION_HEIGHT
const PANEL_MAX_SCALE = 0.9
const PANEL_VIEWPORT_MARGIN = 24
const MIN_GRAPH_READINGS = 1
const MAX_OBSERVATIONS = 10
const VOLTAGE_SAFETY_LIMIT = 8.5
const VOLTAGE_SAFETY_RESET = 7.5

const getObservationSignature = ({ i1, i2, i3, voltage }) => (
  [
    Number(voltage).toFixed(1),
    Number(i1).toFixed(3),
    Number(i2).toFixed(3),
    Number(i3).toFixed(3),
  ].join('|')
)

const getScale = () => {
  if (typeof window === 'undefined') {
    return 1
  }

  const widthScale = (window.innerWidth - PANEL_VIEWPORT_MARGIN) / BASE_WIDTH
  const heightScale = (window.innerHeight - PANEL_VIEWPORT_MARGIN) / BASE_HEIGHT

  return Math.max(Math.min(widthScale, heightScale, PANEL_MAX_SCALE), 0.1)
}

const App = () => {
  const { confirmAlert, showStepAlert } = useLabAlerts()
  const [scale, setScale] = useState(getScale)
  const [r1, setR1] = useState(1)
  const [r2, setR2] = useState(1)
  const [r3, setR3] = useState(1)
  const [resistanceSet, setResistanceSet] = useState(false)
  const [voltage, setVoltage] = useState(0)
  const [powerOn, setPowerOn] = useState(false)
  const [current, setCurrent] = useState(0)
  const [autoFillTrigger, setAutoFillTrigger] = useState(0)
const [currentSourceOn, setCurrentSourceOn] = useState(false)
const [lockedCurrent, setLockedCurrent] = useState(null)
const [calculationResetTrigger, setCalculationResetTrigger] = useState(0)
const [showFormulaPanel, setShowFormulaPanel] = useState(false)
const [aiGuideEnabled, setAiGuideEnabled] = useState(false)
const lastGuideMessageRef = useRef('')
const resistanceGuideTimerRef = useRef(null)
const case1IntroSpokenRef = useRef(false)
const touchedResistorsRef = useRef(new Set())
const lastInstructionAudioRef = useRef('')
const aiGuideJustEnabledRef = useRef(false)
const notifyConnectionChange = () => {
  const connections =
    typeof instance.getAllConnections === 'function'
      ? instance.getAllConnections()
      : instance.getConnections?.()

  onConnectionChange?.(connections?.length ?? 0)
}
const [lockedVoltage, setLockedVoltage] = useState(null)
  const [observations, setObservations] = useState({
  currentSourceOnly: null,
  voltageSourceOnly: null,
  bothSources: null,
})
const observationsRef = useRef(observations)

useEffect(() => {
  observationsRef.current = observations
}, [observations])

  /*const [pendingObservation, setPendingObservation] = useState({
  i1Cs: null,
  i1Vs: null,
  i1Total: null,
  voltageVs: null,
  currentCs: null,
})*/
  const [graphGenerated, setGraphGenerated] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [status, setStatus] = useState('Make the connections, click CHECK, then set the resistance values.')

  const [autoConnectRequest, setAutoConnectRequest] = useState(0)
  const [checkRequest, setCheckRequest] = useState(0)
  const [resetRequest, setResetRequest] = useState(0)
  const [pendingReportData, setPendingReportData] = useState(null)
  const [connectionsVerified, setConnectionsVerified] = useState(false)
  const [instructionStep, setInstructionStep] = useState('resistance')
  const instructionStepRef = useRef('resistance')

useEffect(() => {
  instructionStepRef.current = instructionStep
}, [instructionStep])
  const [sessionStart, setSessionStart] = useState(() => Date.now())
  const removedAfterCase1Ref = useRef(new Set())
  const voltageLimitWarningShownRef = useRef(false)

  useEffect(() => {
    const handleResize = () => setScale(getScale())

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])
 const handleResistanceChange = (key, setter, value) => {
  setter(value)
  setResistanceSet(true)
  touchedResistorsRef.current.add(key)

  window.clearTimeout(resistanceGuideTimerRef.current)

  if (touchedResistorsRef.current.size < 3) {
    setInstructionStep('resistance')
    return
  }

  resistanceGuideTimerRef.current = window.setTimeout(() => {
    if (case1IntroSpokenRef.current) return

    case1IntroSpokenRef.current = true
    instructionStepRef.current = 'case1-connections'
    setInstructionStep('case1-connections')
  }, 1200)
}
const normalizePair = (a, b) => [a, b].sort().join('|')

const requiredCase1Removals = new Set([
  normalizePair('1-endpoint', '9-endpoint'),
  normalizePair('2-endpoint', '10-endpoint'),
  normalizePair('17-endpoint', '18-endpoint'),
])
const addedCase2VoltageRef = useRef(new Set())
const requiredCase2VoltageAdds = new Set([
  normalizePair('17-endpoint', '19-endpoint'),
  normalizePair('18-endpoint', '20-endpoint'),
])

  const readings = useMemo(
  () => calculateReadings({
    voltage,
    current,
    voltageSourceOn: powerOn,
    currentSourceOn,
    r1,
    r2,
    r3,
  }),
  [current, currentSourceOn, powerOn, r1, r2, r3, voltage],
)

  const normalizedVoltage = Number(voltage.toFixed(1))
  const currentReadingSignature = getObservationSignature({
    i1: readings.i1,
    i2: readings.i2,
    i3: readings.i3,
    voltage: normalizedVoltage,
  })
  /*const hasDuplicateReading = observations.some((row) => (
    row.voltage === normalizedVoltage
      || getObservationSignature(row) === currentReadingSignature
  ))*/
 const readingCount = [
  observations.currentSourceOnly,
  observations.voltageSourceOnly,
  observations.bothSources,
].filter(Boolean).length
const playGuideAudio = useCallback((key, message) => {
  if (!aiGuideEnabled) return

  if (lastGuideMessageRef.current === key) return
  lastGuideMessageRef.current = key

  speakGuideMessage(message)
}, [aiGuideEnabled])

const showGuideAlert = useCallback((key, message, options = {}) => {
  if (!aiGuideEnabled) return

  if (lastGuideMessageRef.current === key) return
  lastGuideMessageRef.current = key

  speakGuideMessage(message)

  showStepAlert({
  title: options.title || 'AI Guide',
  description: message,
  type: options.type || 'info',
  target: null,
  icon: options.icon || '🤖',
})
}, [aiGuideEnabled, showStepAlert])
useEffect(() => {
  if (!aiGuideEnabled) return
  if (aiGuideJustEnabledRef.current) return
  if (lastInstructionAudioRef.current === instructionStep) return

  const message = AI_GUIDE_STEP_MESSAGES[instructionStep]
  if (!message) return

  lastInstructionAudioRef.current = instructionStep
  speakGuideMessage(message)
}, [instructionStep, aiGuideEnabled])
const speakCurrentInstruction = useCallback((step = instructionStep) => {
  if (!aiGuideEnabled) return

  const message = AI_GUIDE_STEP_MESSAGES[step]

  if (!message) return

  lastGuideMessageRef.current = `step-${step}`
  speakGuideMessage(message)
}, [aiGuideEnabled, instructionStep])

const isCase3InProgress = (
  observations.currentSourceOnly &&
  observations.voltageSourceOnly &&
  !observations.bothSources
)

const canPlotGraph = readingCount >= 3

  const recordObservation = () => {
    if (!connectionsVerified) {
      showGuideAlert(
  'add-before-check',
  AI_GUIDE_MESSAGES.addBeforeCheck,
  {
    title: 'Check Connections First',
    target: '#check-button',
    type: 'warning',
  }
)
  setStatus('Check the circuit connections before adding readings.')
  showStepAlert({
    title: 'Check Connections First',
    description: 'Please press CHECK and verify the current case connections before adding the reading.',
    type: 'warning',
  })
  return
}

    /*if (!powerOn) {
      setStatus('Switch on the power supply before adding readings.')
      showStepAlert(EXPERIMENT_ALERTS.cannotStartPower, {
        description: 'Switch on the verified power supply before adding readings.',
        stepNumber: 6,
        target: '#power-toggle-button',
      })
      return
    }*/

    /*if (normalizedVoltage <= 0) {
      setStatus('Set the power supply voltage before adding a reading.')
      showStepAlert(EXPERIMENT_ALERTS.adjustVoltage, {
        dedupeKey: 'step-6-zero-voltage',
        description: 'Increase the voltage above 0 V before adding a reading.',
        target: '#voltage-control',
        type: 'warning',
      })
      return
    }*/

    if (readingCount >= MAX_OBSERVATIONS) {
      setStatus('Ten readings are already recorded. Plot the graph or reset for a new run.')
      showStepAlert(EXPERIMENT_ALERTS.minimumReadingsRequired, {
        description: 'The observation table already contains the maximum 10 readings.',
        title: 'Observation Table Is Full',
      })
      return
    }

    /*if (hasDuplicateReading) {
      setStatus('Duplicate reading cannot be added to the observation table.')
      showStepAlert(EXPERIMENT_ALERTS.readingAlreadyExists, {
        description: 'This reading already exists in the observation table. Change the voltage before adding another reading.',
        title: 'Duplicate Reading Not Allowed',
      })
      return
    }*/

    
      //let nextPendingObservation = { ...pendingObservation }

    if (!powerOn && currentSourceOn) {
  setObservations((prev) => ({
    ...prev,
    currentSourceOnly: {
      i1: readings.i1,
      i2: readings.i2,
      i3: readings.i3,
      current,
      r1,
      r2,
      r3,
    },
  }))
  setLockedCurrent(current)
  setInstructionStep('case1-remove-connections')
  instructionStepRef.current = 'case1-remove-connections'
  setStatus('Current source only reading saved.')

  showStepAlert({
    title: 'Current Source Only Reading Saved',
    description: 'Switch OFF the current source and proceed to Voltage Source Only case.',
    type: 'success',
  })
  playGuideAudio(
  'case1-reading-added',
  AI_GUIDE_MESSAGES.case1ReadingAdded
)

/*setTimeout(() => {
  playGuideAudio(
    'case2-connections-guide',
    AI_GUIDE_MESSAGES.case2Connections
  )
}, 4500)*/

  setConnectionsVerified(false)
  return
}

else if (powerOn && !currentSourceOn) {
  if (!observations.currentSourceOnly) {
    showStepAlert({
      title: 'Complete Current Source Case First',
      description: 'First perform Current Source Only case, then Voltage Source Only case.',
      type: 'warning',
    })
    return
  }

  setObservations((prev) => ({
    ...prev,
    voltageSourceOnly: {
      i1: readings.i1,
      i2: readings.i2,
      i3: readings.i3,
      voltage,
      r1,
      r2,
      r3,
    },
  }))
    setLockedVoltage(voltage)
  setInstructionStep('case2-turn-off-voltage')
  setStatus('Voltage source only reading saved.')

  showStepAlert({
    title: 'Voltage Source Only Reading Saved',
    description: 'Switch OFF the voltage source and proceed to Both Sources case.',
    type: 'success',
  })
  playGuideAudio(
  'case2-reading-added',
  AI_GUIDE_MESSAGES.case2ReadingAdded
)

  setConnectionsVerified(false)
  return
}

else if (powerOn && currentSourceOn) {
  if (!observations.currentSourceOnly || !observations.voltageSourceOnly) {
    showStepAlert({
      title: 'Complete Previous Cases First',
      description: 'Complete Current Source Only and Voltage Source Only cases before Both Sources case.',
      type: 'warning',
    })
    return
  }

  setObservations((prev) => ({
    ...prev,
    bothSources: {
      i1: readings.i1,
      i2: readings.i2,
      i3: readings.i3,
      voltage,
      current,
      r1,
      r2,
      r3,
    },
  }))
   setInstructionStep('calculate-button')
  setStatus('Both sources reading saved.')

  showStepAlert({
    title: 'Experiment Completed',
    description: 'All three cases have been recorded successfully.',
    type: 'success',
  })
  showGuideAlert(
  'case3-reading-added',
  AI_GUIDE_MESSAGES.case3ReadingAdded,
  {
    title: 'Final Reading Added',
    target: '#calculate-button',
    type: 'success',
  }
)

  setConnectionsVerified(false)
  return
}
/*
const hasAllReadings = (
  nextPendingObservation.i1Cs !== null
  && nextPendingObservation.i1Vs !== null
  && nextPendingObservation.i1Total !== null
)

if (!hasAllReadings) {
  setPendingObservation(nextPendingObservation)
  return
}

const nextObservation = {
  id: (observations.at(-1)?.id ?? 0) + 1,
  r1,
  r2,
  r3,
  i1Cs: nextPendingObservation.i1Cs,
  i1Vs: nextPendingObservation.i1Vs,
  i1Total: nextPendingObservation.i1Total,
  i1Sum: nextPendingObservation.i1Cs + nextPendingObservation.i1Vs,
}

/*setObservations([...observations, nextObservation])*/
/*
setObservations((prev) => {
  const updated = [...prev]
  const lastIndex = updated.length - 1

  updated[lastIndex] = {
    ...updated[lastIndex],
    i1Total: nextPendingObservation.i1Total,
    i1Sum: nextPendingObservation.i1Cs + nextPendingObservation.i1Vs,
  }

  return updated
})
setPendingObservation({
  i1Cs: null,
  i1Vs: null,
  i1Total: null,
  voltageVs: null,
  currentCs: null,
})
*/

setStatus('Complete superposition reading added to the observation table.')
setConnectionsVerified(false)

/*setObservations([...observations, nextObservation])
setStatus('Reading added to the observation table.')*/
    /*const nextObservationCount = readingCount + 1

    setObservations([...observations, nextObservation])
    setGraphGenerated(false)
    setReportGenerated(false)
    setStatus('Reading added to the observation table.')

    if (nextObservationCount === MIN_GRAPH_READINGS) {
      showStepAlert(EXPERIMENT_ALERTS.sufficientData)
    }*/
  }

  const resetSimulation = useCallback(() => {
    setAiGuideEnabled(false)
window.speechSynthesis?.cancel()
aiGuideJustEnabledRef.current = false
lastGuideMessageRef.current = ''
    setPowerOn(false)
    setVoltage(0)
    setCurrentSourceOn(false)
    setCurrent(0)
    setR1(1)
    setR2(1)
    setR3(1)
    setResistanceSet(false)
    setObservations({
    currentSourceOnly: null,
    voltageSourceOnly: null,
    bothSources: null,
    })
    setLockedCurrent(null)
setLockedVoltage(null)
   setCalculationResetTrigger((prev) => prev + 1)
setAutoFillTrigger(0)
    setGraphGenerated(false)
    setReportGenerated(false)
    addedCase2VoltageRef.current.clear()
    setAutoConnectRequest(0)
    setCheckRequest(0)
    lastInstructionAudioRef.current = ''
    setConnectionsVerified(false)
    case1IntroSpokenRef.current = false
    setResetRequest((current) => current + 1)
    setSessionStart(Date.now())
    removedAfterCase1Ref.current.clear()
    setInstructionStep('resistance')
    voltageLimitWarningShownRef.current = false
    setStatus('Simulation reset. Set R1, R2 and R3 before making circuit connections.')
    case1IntroSpokenRef.current = false
window.clearTimeout(resistanceGuideTimerRef.current)
touchedResistorsRef.current.clear()
case1IntroSpokenRef.current = false
window.clearTimeout(resistanceGuideTimerRef.current)
    //showStepAlert(EXPERIMENT_ALERTS.resetSuccess)
    /*setPendingObservation({
  i1Cs: null,
  i1Vs: null,
  i1Total: null,
  voltageVs: null,
  currentCs: null,
})*/
showStepAlert({
  title: 'Simulation Reset',
  description: 'The simulation has been reset. You can start again.',
  type: 'success',
})

  }, [showStepAlert, showGuideAlert])

  /*const handleReset = async () => {
    const confirmed = await confirmAlert(EXPERIMENT_ALERTS.resetWarning)

    if (confirmed) {
      resetSimulation()
    }
  }*/
 const handleReset = () => {
  resetSimulation()
}

  const handlePlot = () => {
    if (!canPlotGraph) {
      const remainingReadings = MIN_GRAPH_READINGS - readingCount

      setGraphGenerated(false)
      setReportGenerated(false)
      setStatus(`Add ${remainingReadings} more reading(s) before plotting the graph.`)
      showStepAlert(EXPERIMENT_ALERTS.insufficientGraphReadings, {
        description: `Add ${remainingReadings} more reading(s) before plotting.`,
      })
      return
    }

    setGraphGenerated(true)
    setReportGenerated(false)
    setStatus('Observation graph plotted from the table readings.')
    showStepAlert(EXPERIMENT_ALERTS.graphPlotted)
  }

  const handlePrint = () => {
  if (readingCount < 3) {
    showStepAlert({
      title: 'No Observation Found',
      description: 'Complete all three cases before generating the report.',
      type: 'warning',
    })
    return
  }
playGuideAudio(
  'print-guide',
  AI_GUIDE_MESSAGES.print
)
  window.print()
}
const handleCalculate = () => {
  showGuideAlert(
  'calculate-clicked',
  AI_GUIDE_MESSAGES.calculateClicked,
  {
    title: 'Calculation Panel',
    target: '#calculation-panel',
    type: 'info',
  }
)
  setAutoFillTrigger((prev) => prev + 1)

  setInstructionStep('calculation')
}
const handleAiGuide = () => {
  setAiGuideEnabled((prev) => {
    const next = !prev

    if (next) {
      lastGuideMessageRef.current = ''
      aiGuideJustEnabledRef.current = true

      speakGuideMessage("AI Guide activated. Let's connect the components.")

      setTimeout(() => {
        speakGuideMessage(
          'First, set the values of R1, R2 and R3 using the resistance sliders.'
        )

        setTimeout(() => {
          aiGuideJustEnabledRef.current = false
        }, 500)
      }, 2200)
    } else {
      window.speechSynthesis?.cancel()
      aiGuideJustEnabledRef.current = false
    }

    return next
  })
}
  const handleGenerateReport = async () => {
  console.log('GENERATE REPORT CLICKED', {
    aiGuideEnabled,
    readingCount,
    observations,
  })

  if (readingCount < 3) {
    showStepAlert({
      title: 'Incomplete Observations',
      description: 'Complete all three cases before generating the report.',
      type: 'warning',
    })
    return
  }

  const reportObservations = [
    { caseName: 'Current Source Only', ...observations.currentSourceOnly },
    { caseName: 'Voltage Source Only', ...observations.voltageSourceOnly },
    { caseName: 'Both Sources Active', ...observations.bothSources },
  ]

  if (aiGuideEnabled) {
  speakGuideMessage(AI_GUIDE_MESSAGES.report)

  confirmAlert({
    title: 'Report Generated Successfully',
    description: AI_GUIDE_MESSAGES.report,
    type: 'success',
    icon: '📄',
  })

  window.setTimeout(() => {
    const generated = generateSuperpositionReport({
      observations: reportObservations,
      resistances: { r1, r2, r3 },
      sessionStart,
    })

    if (generated) {
      setReportGenerated(true)
      setStatus('Superposition theorem report generated successfully.')
    }
  }, 2500)

  return
}
  const confirmed = await confirmAlert({
    title: 'Report Generated Successfully',
    description:
      'Your report has been generated successfully. Click OK to view your report.',
    type: 'success',
    icon: '📄',
  })

  if (confirmed === false) return

  const generated = generateSuperpositionReport({
    observations: reportObservations,
    resistances: { r1, r2, r3 },
    sessionStart,
  })

  if (!generated) {
    setStatus('Unable to open the report window.')
    window.alert('Unable to open the report window. Please allow pop-ups and try again.')
    return
  }

  setReportGenerated(true)
  setStatus('Superposition theorem report generated successfully.')
}

  const scaledWidth = Math.ceil(BASE_WIDTH * scale)
  const scaledHeight = Math.ceil(CONTENT_HEIGHT * scale)
  const handleCheckConnections = useCallback((result) => {
    /*if (result.isCorrect) {
      setConnectionsVerified(true)

      setStatus(
      'Connections verified successfully. You may now switch ON the required source for this case.',
      )
      showStepAlert(EXPERIMENT_ALERTS.connectionsVerified)

      return
    }*/
   if (result.isCorrect) {
  setConnectionsVerified(true)
  if (!observations.currentSourceOnly) {
  setInstructionStep('case1-turn-on-current')
} else if (!observations.voltageSourceOnly) {
  setInstructionStep('case2-turn-on-voltage')
} else {
  setInstructionStep('case3-turn-on-both')
}
if (!observations.currentSourceOnly) {
  showGuideAlert(
    'case1-verified',
    AI_GUIDE_MESSAGES.case1Verified,
    {
      title: 'Connections Verified',
      target: '#current-source',
      type: 'success',
    }
  )
} else if (!observations.voltageSourceOnly) {
  showGuideAlert(
    'case2-verified',
    AI_GUIDE_MESSAGES.case2Verified,
    {
      title: 'Connections Verified',
      target: '#power-supply-2',
      type: 'success',
    }
  )
} else {
  showGuideAlert(
    'case3-verified',
    AI_GUIDE_MESSAGES.case3Verified,
    {
      title: 'Connections Verified',
      target: '#equipment-panel',
      type: 'success',
    }
  )
}
  setStatus(
    'Connections verified. Now switch ON the required source for this case.',
  )

  showStepAlert({
    dedupeKey: `connections-verified-${Date.now()}`,
    title: 'Connections Verified Successfully',
    description: 'Now switch ON the required source for this case and click ADD to save the reading.',
    icon: '✅',
    target: '#check-button',
    type: 'success',
  })

  return
}

    setConnectionsVerified(false)
    if (result.totalConnections > 1) {
  playGuideAudio(
    'multiple-wrong-connections',
    AI_GUIDE_MESSAGES.multipleWrongConnections
  )
} else {
  playGuideAudio(
    'wrong-connection',
    AI_GUIDE_MESSAGES.wrongConnection
  )
}
    if (result.totalConnections === 0) {
      setStatus('Please make the connections first.')
      showStepAlert(EXPERIMENT_ALERTS.connectionErrorFound, {
        description: 'No circuit wires were found. Drag node connections before checking.',
        type: 'warning',
      })
      return
    }

    setStatus(
      `Invalid connections. Correct matched points: ${result.matchedCount}; total wires: ${result.totalConnections}.`,
    )
    showStepAlert(EXPERIMENT_ALERTS.connectionErrorFound, {
      description: `Matched ${result.matchedCount} of 8 required wire pairs from ${result.totalConnections} total wires.`,
    })
  }, [observations, showStepAlert, showGuideAlert, playGuideAudio])

  const handleCheck = () => {
    if (!resistanceSet) {
      showGuideAlert(
  'set-resistance-check',
  AI_GUIDE_MESSAGES.setResistance,
  {
    title: 'Set Resistance First',
    target: '#resistance-controls',
    type: 'warning',
  }
)
  showStepAlert({
    title: 'Set Resistance First',
    description: 'Please set R1, R2 and R3 before checking circuit connections.',
    icon: '⚠️',
    target: '#resistance-controls',
    type: 'warning',
  })
  return
}
  if (powerOn || currentSourceOn) {
    showStepAlert({
      title: 'Turn OFF Sources First',
      description: 'Switch OFF voltage and current sources before checking the next case connections.',
      type: 'warning',
    })
    return
  }

  setConnectionsVerified(false)
  if (aiGuideEnabled) {
  showGuideAlert(
    'make-required-connections',
    AI_GUIDE_MESSAGES.makeConnections,
    {
      title: 'Make Connections',
      target: '#equipment-panel',
      type: 'info',
    }
  )
}
  setCheckRequest((current) => current + 1)
}
  const handleToggleCurrentSource = () => {
  if (!currentSourceOn && !connectionsVerified) {
    setStatus('Check the circuit connections before switching on the current source.')
    showStepAlert(EXPERIMENT_ALERTS.cannotStartPower)
    return
  }

  if (!currentSourceOn && powerOn && (!observations.voltageSourceOnly || !observations.currentSourceOnly)) {
    showStepAlert({
      title: 'Wrong Source Combination',
      description: 'Both sources should be switched ON only after completing individual source cases.',
      type: 'warning',
    })
    return
  }

  if (currentSourceOn) {
  setCurrentSourceOn(false)
  //setCurrent(0)

  /*if (observations.currentSourceOnly && !observations.voltageSourceOnly) {
    setInstructionStep('case2-connections')
  }*/

  setStatus('Current source switched off.')
  return
}

  setCurrentSourceOn(true)

if (isCase3InProgress) {
  if (lockedCurrent !== null) {
    setCurrent(lockedCurrent)
  }

  setInstructionStep('case3-turn-on-both')

  if (powerOn) {
    showGuideAlert(
      'both-sources-on',
      AI_GUIDE_MESSAGES.bothSourcesOn,
      {
        title: 'Readings Displayed',
        target: '#add-reading-button',
        type: 'success',
      }
    )
  }

  return
}

setInstructionStep('case1-set-current')

setStatus('Current source switched on. Adjust current and add the reading.')
showStepAlert(EXPERIMENT_ALERTS.currentSourceOn)
}
   const handleTogglePower = () => {
  if (!powerOn && !connectionsVerified) {
    setStatus('Check the circuit connections before switching on the voltage source.')
    showStepAlert(EXPERIMENT_ALERTS.cannotStartPower)
    return
  }
  if (!powerOn && !currentSourceOn && !observations.currentSourceOnly) {
    showGuideAlert(
  'wrong-voltage-case1',
  AI_GUIDE_MESSAGES.wrongVoltageCase1,
  {
    title: 'Complete Current Source Case First',
    target: '#power-supply-2',
    type: 'warning',
  }
)
  showStepAlert({
    title: 'Complete Current Source Case First',
    description: 'First perform Current Source Only case before switching ON the voltage source.',
    type: 'warning',
  })
  return
}

  /*if (!powerOn && observations.voltageSourceOnly && !observations.currentSourceOnly && !currentSourceOn) {
    showStepAlert({
      title: 'Wrong Source For This Case',
      description: 'For Current Source Only case, keep the voltage source OFF.',
      type: 'warning',
    })
    return
  }*/

  if (!powerOn && currentSourceOn && (!observations.voltageSourceOnly || !observations.currentSourceOnly)) {
    showStepAlert({
      title: 'Wrong Source Combination',
      description: 'Both sources should be switched ON only after completing individual source cases.',
      type: 'warning',
    })
    return
  }

  if (powerOn) {
  setPowerOn(false)
  //setVoltage(0)
  voltageLimitWarningShownRef.current = false

  if (observations.currentSourceOnly && observations.voltageSourceOnly && !observations.bothSources) {
    setInstructionStep('case3-connections')
  }

  setStatus('Voltage source switched off.')
  return
}

  setPowerOn(true)

if (isCase3InProgress) {
  if (lockedVoltage !== null) {
    setVoltage(lockedVoltage)
  }

  setInstructionStep('case3-add-reading')

  if (currentSourceOn) {
    showGuideAlert(
      'both-sources-on',
      AI_GUIDE_MESSAGES.bothSourcesOn,
      {
        title: 'Readings Displayed',
        target: '#add-reading-button',
        type: 'success',
      }
    )
  }

  return
}
setInstructionStep('case2-set-voltage')

setStatus('Voltage source switched on. Adjust voltage and add the reading.')
showStepAlert(EXPERIMENT_ALERTS.powerOn)
}

  const handleAutoConnect = () => {
    if (!resistanceSet) {
      showGuideAlert(
  'set-resistance-autoconnect',
  AI_GUIDE_MESSAGES.setResistance,
  {
    title: 'Set Resistance First',
    target: '#resistance-controls',
    type: 'warning',
  }
)
  showStepAlert({
    title: 'Set Resistance First',
    description: 'Please set R1, R2 and R3 before making circuit connections.',
    icon: '⚠️',
    target: '#resistance-controls',
    type: 'warning',
  })
  return
}
    setAutoConnectRequest((current) => current + 1)
    setConnectionsVerified(false)
    if (!observations.currentSourceOnly) {
  setInstructionStep('case1-check')
} else if (!observations.voltageSourceOnly) {
  setInstructionStep('case2-check')
} else {
  setInstructionStep('case3-check')
}

    setStatus(
      'Default connections added using jsPlumb. Click CHECK to validate and lock the circuit.',
    )
    showStepAlert(EXPERIMENT_ALERTS.circuitConnectionsCompleted)
    showGuideAlert(
  'autoconnect-completed',
  AI_GUIDE_MESSAGES.autoConnect,
  {
    title: 'Autoconnect Completed',
    target: '#check-button',
    type: 'success',
  }
)
showGuideAlert(
  `autoconnect-completed-${autoConnectRequest}`,
  AI_GUIDE_MESSAGES.autoConnect,
  {
    title: 'Autoconnect Completed',
    target: '#check-button',
    type: 'success',
  }
)
  }

  const handleVoltageChange = useCallback((nextVoltage) => {
    setVoltage(nextVoltage)

    if (!powerOn || nextVoltage <= 0) {
      if (nextVoltage < VOLTAGE_SAFETY_RESET) {
        voltageLimitWarningShownRef.current = false
      }

      return
    }

    if (nextVoltage >= VOLTAGE_SAFETY_LIMIT && !voltageLimitWarningShownRef.current) {
      voltageLimitWarningShownRef.current = true
      showStepAlert(EXPERIMENT_ALERTS.voltageSafetyLimit, {
        description: `${nextVoltage.toFixed(1)} V is close to the 10 V supply limit.`,
      })
      return
    }

    if (nextVoltage < VOLTAGE_SAFETY_RESET) {
      voltageLimitWarningShownRef.current = false
    }
  }, [powerOn, showStepAlert])

  return (
    <div id="app-wrapper">
      <div
        id="app-viewport"
        style={{
          height: `${scaledHeight}px`,
          width: `${scaledWidth}px`,
        }}
      >
        <div
          id="app-scale"
          style={{
            height: `${CONTENT_HEIGHT}px`,
            transform: `scale(${scale})`,
          }}
        >
          <main className="simulation-shell" id="walkthrough-demo-experiment">
            <HeaderBoard />
            <WalkthroughStartButton variant="side-tab" />
            {/* <StatusBar status={status} /> */}
            <span className="sr-only" role="status" aria-live="polite">{status}</span>

            <section className="workspace-grid">
              <aside className="left-panel">
                <ActionButtons
  instructionStep={instructionStep}
  disabledButtons={{
  onAdd: false,
  onAutoConnect: powerOn || currentSourceOn,
  onCheck: false,
  onCalculate: readingCount < 3 || autoFillTrigger > 0,
  onPlot: false,
  onPrint: false,
}}
                  onAdd={recordObservation}
                  onCheck={handleCheck}
                  onCalculate={handleCalculate}
                  onPlot={handlePlot}
                  onPrint={handlePrint}
                  onReset={handleReset}
                  onAutoConnect={handleAutoConnect}
                  onAiGuide={handleAiGuide}
                />

                <ControlPanel
                  locked={
  powerOn
  || currentSourceOn
  || (
    observations.currentSourceOnly !== null
    && observations.voltageSourceOnly !== null
    && observations.bothSources === null
  )
}
                  observations={observations}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  setR1={(value) => handleResistanceChange('r1', setR1, value)}
setR2={(value) => handleResistanceChange('r2', setR2, value)}
setR3={(value) => handleResistanceChange('r3', setR3, value)}
                />
              </aside>

              <section className="right-panel">
                <ConnectionLab
                  autoConnectRequest={autoConnectRequest}
                  checkRequest={checkRequest}
                  onCheckConnections={handleCheckConnections}
                  observations={observations}
                  powerOn={powerOn}
                  current={current}
                  setCurrent={(value) => {
  setCurrent(value)

  if (isCase3InProgress) {
    setInstructionStep('case3-add-reading')
    return
  }

  if (currentSourceOn && !powerOn) {
    showGuideAlert(
  'current-value-set',
  AI_GUIDE_MESSAGES.currentValueSet,
  {
    title: 'Reading Displayed',
    target: '#add-reading-button',
    type: 'success',
  }
)
    setInstructionStep('case1-add-reading')
  }
}}
                  currentSourceOn={currentSourceOn}
                  onToggleCurrentSource={handleToggleCurrentSource}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  readings={readings}
                  resetRequest={resetRequest}
                  scale={scale}
                  onTogglePower={handleTogglePower}
                  setVoltage={(value) => {
  handleVoltageChange(value)

  if (isCase3InProgress) {
    setInstructionStep('case3-add-reading')
    return
  }

  if (powerOn && !currentSourceOn) {
    showGuideAlert(
  'voltage-value-set',
  AI_GUIDE_MESSAGES.voltageValueSet,
  {
    title: 'Reading Displayed',
    target: '#add-reading-button',
    type: 'success',
  }
)
    setInstructionStep('case2-add-reading')
  }
}}
                  voltage={voltage}
                  lockedCurrent={observations.currentSourceOnly !== null}
  lockedVoltage={observations.voltageSourceOnly !== null}
 onConnectionDetached={(sourceId, targetId) => {
  const latestObservations = observationsRef.current
  const pairKey = normalizePair(sourceId, targetId)

  console.log('DETACHED:', pairKey)

  if (!latestObservations.currentSourceOnly || latestObservations.voltageSourceOnly) {
    return
  }

  if (!requiredCase1Removals.has(pairKey)) {
    return
  }

  removedAfterCase1Ref.current.add(pairKey)

  if (removedAfterCase1Ref.current.size === 3) {
    instructionStepRef.current = 'case2-connections'
    setInstructionStep('case2-connections')
  }
}}
onConnectionChange={(count) => {
  const currentStep = instructionStepRef.current
  const latestObservations = observationsRef.current

  console.log('COUNT:', count, 'STEP:', currentStep)

  if (
    currentStep === 'case1-connections' &&
    !latestObservations.currentSourceOnly &&
    count >= 9
  ) {
    instructionStepRef.current = 'case1-check'
    setInstructionStep('case1-check')
    return
  }

  if (
    currentStep === 'case3-connections' &&
    latestObservations.currentSourceOnly &&
    latestObservations.voltageSourceOnly &&
    !latestObservations.bothSources &&
    count >= 10
  ) {
    instructionStepRef.current = 'case3-check'
    setInstructionStep('case3-check')
  }
}}
       onConnectionAdded={(sourceId, targetId) => {
  const latestObservations = observationsRef.current
  const pairKey = normalizePair(sourceId, targetId)

  console.log('ADDED:', pairKey, 'step:', instructionStepRef.current)

  if (!latestObservations.currentSourceOnly || latestObservations.voltageSourceOnly) return
  if (instructionStepRef.current !== 'case2-connections') return
  if (!requiredCase2VoltageAdds.has(pairKey)) return

  addedCase2VoltageRef.current.add(pairKey)

  console.log('Case 2 voltage added:', addedCase2VoltageRef.current.size)

  if (addedCase2VoltageRef.current.size === 2) {
    instructionStepRef.current = 'case2-check'
    setInstructionStep('case2-check')
  }
}}

                />
              </section>
            </section>
            <ReportControls
  onGenerateReport={handleGenerateReport}
  readingCount={readingCount}
  reportGenerated={reportGenerated}
/>
<button
  className="formula-button"
  type="button"
  onClick={() => setShowFormulaPanel(true)}
>
  Formulae
</button>
{showFormulaPanel && (
  <div className="formula-panel">
    <div className="formula-panel__header">
      <h3>Formulae Used</h3>

      <button
        className="formula-panel__close"
        type="button"
        onClick={() => setShowFormulaPanel(false)}
      >
        ×
      </button>
    </div>

    <div className="formula-panel__body">
  <h4>Reference Current Directions</h4>

  <p>The following reference directions are used throughout the experiment:</p>

  <ul className="formula-list">
    <li><strong>I₁:</strong> Left to right through R₁</li>
    <li><strong>I₂:</strong> Downward through R₂</li>
    <li><strong>I₃:</strong> Left to right through R₃</li>
  </ul>

  <p className="formula-note">
    A positive value indicates that the current flows in the assumed reference direction.
    A negative value indicates that the current flows opposite to the assumed direction.
  </p>

  <h4>Case 1: Current Source Active</h4>

  <p>
    When only the current source is active, the current divides between the
    R₂ and R₃ branches according to the current division rule.
  </p>

  <div className="formula-box">
    I₁(CS) = Is
  </div>

  <div className="formula-box">
    I₂(CS) = Is × R₃ / (R₂ + R₃)
  </div>

  <div className="formula-box">
    I₃(CS) = Is × R₂ / (R₂ + R₃)
  </div>

  <h4>Case 2: Voltage Source Active</h4>

  <p>
    When only the voltage source is active, the current through the R₂–R₃ path
    is obtained using Ohm's Law.
  </p>

  <div className="formula-box">
    I₁(VS) = 0
  </div>

  <div className="formula-box">
    I₂(VS) = V / (R₂ + R₃)
  </div>

  <div className="formula-box">
    I₃(VS) = − V / (R₂ + R₃)
  </div>

  <h4>Case 3: Both Sources Active</h4>

  <p>
    According to the Superposition Theorem, the total branch current is the
    algebraic sum of the currents produced by each independent source acting alone.
  </p>

  <div className="formula-box">
    I₁ = I₁(CS) + I₁(VS)
  </div>

  <div className="formula-box">
    I₂ = I₂(CS) + I₂(VS)
  </div>

  <div className="formula-box">
    I₃ = I₃(CS) + I₃(VS)
  </div>

  <p className="formula-note">
    If a component current is opposite to the assumed reference direction,
    it appears as a negative quantity and is automatically subtracted during
    algebraic addition.
  </p>

  <h4>Verification of Superposition Theorem</h4>

  <p>
    The theorem is verified when the branch currents measured with both sources
    active are equal to the algebraic sum of the corresponding currents obtained
    from Case 1 and Case 2.
  </p>
</div>
  </div>
)}

          </main>
          <CalculationPanel
  observations={observations}
  resistanceValues={{
    r1,
    r2,
    r3,
  }}
  currentValue={lockedCurrent}
  voltageValue={lockedVoltage}
  autoFillTrigger={autoFillTrigger}
  calculationResetTrigger={calculationResetTrigger}
  setInstructionStep={setInstructionStep}
/>

          {/* <GraphPanel
            className="graph-panel--separate"
            id="graph-panel"
            observations={observations}
            plotted={graphGenerated}
          /> */}
        </div>
      </div>
    </div>
  )
}

export default App
