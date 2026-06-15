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
const [currentSourceOn, setCurrentSourceOn] = useState(false)
const [lockedCurrent, setLockedCurrent] = useState(null)
const [lockedVoltage, setLockedVoltage] = useState(null)
  const [observations, setObservations] = useState({
  currentSourceOnly: null,
  voltageSourceOnly: null,
  bothSources: null,
})
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
  const [connectionsVerified, setConnectionsVerified] = useState(false)
  const [sessionStart, setSessionStart] = useState(() => Date.now())
  const voltageLimitWarningShownRef = useRef(false)

  useEffect(() => {
    const handleResize = () => setScale(getScale())

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

const canPlotGraph = readingCount >= 3

  const recordObservation = () => {
    if (!connectionsVerified) {
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

  setStatus('Current source only reading saved.')

  showStepAlert({
    title: 'Current Source Only Reading Saved',
    description: 'Switch OFF the current source and proceed to Voltage Source Only case.',
    type: 'success',
  })

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
  setStatus('Voltage source only reading saved.')

  showStepAlert({
    title: 'Voltage Source Only Reading Saved',
    description: 'Switch OFF the voltage source and proceed to Both Sources case.',
    type: 'success',
  })

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

  setStatus('Both sources reading saved.')

  showStepAlert({
    title: 'Experiment Completed',
    description: 'All three cases have been recorded successfully.',
    type: 'success',
  })

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
    setGraphGenerated(false)
    setReportGenerated(false)
    setAutoConnectRequest(0)
    setCheckRequest(0)
    setConnectionsVerified(false)
    setResetRequest((current) => current + 1)
    setSessionStart(Date.now())
    voltageLimitWarningShownRef.current = false
    setStatus('Simulation reset. Set R1, R2 and R3 before making circuit connections.')
    //showStepAlert(EXPERIMENT_ALERTS.resetSuccess)
    /*setPendingObservation({
  i1Cs: null,
  i1Vs: null,
  i1Total: null,
  voltageVs: null,
  currentCs: null,
})*/
  }, [showStepAlert])

  const handleReset = async () => {
    const confirmed = await confirmAlert(EXPERIMENT_ALERTS.resetWarning)

    if (confirmed) {
      resetSimulation()
    }
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

  window.print()
}

  const handleGenerateReport = () => {
  if (readingCount < 3) {
    showStepAlert({
      title: 'Incomplete Observations',
      description: 'Complete all three cases before generating the report.',
      type: 'warning',
    })
    return
  }

  const reportObservations = [
    {
      caseName: 'Current Source Only',
      ...observations.currentSourceOnly,
    },
    {
      caseName: 'Voltage Source Only',
      ...observations.voltageSourceOnly,
    },
    {
      caseName: 'Both Sources Active',
      ...observations.bothSources,
    },
  ]

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
  showStepAlert({
    title: 'Report Generated Successfully',
    description: 'The Superposition Theorem report has been generated.',
    type: 'success',
  })
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
  }, [showStepAlert])

  const handleCheck = () => {
    if (!resistanceSet) {
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
    setCurrent(0)
    setStatus('Current source switched off.')
    return
  }

  setCurrentSourceOn(true)

if (lockedCurrent !== null && observations.currentSourceOnly && observations.voltageSourceOnly) {
  setCurrent(lockedCurrent)
}

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
    setVoltage(0)
    voltageLimitWarningShownRef.current = false
    setStatus('Voltage source switched off.')
    return
  }

  setPowerOn(true)

if (lockedVoltage !== null && observations.currentSourceOnly && observations.voltageSourceOnly) {
  setVoltage(lockedVoltage)
}

setStatus('Voltage source switched on. Adjust voltage and add the reading.')
showStepAlert(EXPERIMENT_ALERTS.powerOn)
}

  const handleAutoConnect = () => {
    if (!resistanceSet) {
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

    setStatus(
      'Default connections added using jsPlumb. Click CHECK to validate and lock the circuit.',
    )
    showStepAlert(EXPERIMENT_ALERTS.circuitConnectionsCompleted)
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
                  disabledButtons={{
                    onAdd: false,
                   onAutoConnect: powerOn || currentSourceOn,
                    onCheck: false,
                    onPlot: false,
                    onPrint: false,
                  }}
                  onAdd={recordObservation}
                  onCheck={handleCheck}
                  onPlot={handlePlot}
                  onPrint={handlePrint}
                  onReset={handleReset}
                  onAutoConnect={handleAutoConnect}
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
                  setR1={(value) => {
  setR1(value)
  setResistanceSet(true)
}}
setR2={(value) => {
  setR2(value)
  setResistanceSet(true)
}}
setR3={(value) => {
  setR3(value)
  setResistanceSet(true)
}}
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
                  setCurrent={setCurrent}
                  currentSourceOn={currentSourceOn}
                  onToggleCurrentSource={handleToggleCurrentSource}
                  r1={r1}
                  r2={r2}
                  r3={r3}
                  readings={readings}
                  resetRequest={resetRequest}
                  scale={scale}
                  onTogglePower={handleTogglePower}
                  setVoltage={handleVoltageChange}
                  voltage={voltage}
                />
              </section>
            </section>
            <ReportControls
  onGenerateReport={handleGenerateReport}
  readingCount={readingCount}
  reportGenerated={reportGenerated}
/>

          </main>
          <CalculationPanel observations={observations} />

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
