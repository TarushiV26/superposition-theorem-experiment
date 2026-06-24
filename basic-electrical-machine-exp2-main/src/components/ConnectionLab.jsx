import { useEffect, useRef, useState } from 'react'

import CircuitDiagram from './CircuitDiagram.jsx'
import EquipmentPanel from './EquipmentPanel.jsx'

import {
  addAllEndpoints,
  autoConnectCurrentSourceOnly,
autoConnectVoltageSourceOnly,
autoConnectBothSources,
  DEFAULT_AMMETER_CURRENT_KEYS,
  deleteConnectionsForTerminal,
  getAmmeterCurrentKeys,
  lockJsPlumbCircuit,
  resolveJsPlumb,
  validateOldExperimentConnections,
  wireHoverPaintStyles,
  wirePaintStyles,
} from '../utils/jsPlumbWiring.js'

const getJsPlumbZoom = (scale) => (
  Number.isFinite(scale) && scale > 0 ? scale : 1
)

const ConnectionLab = ({
  autoConnectRequest,
  checkRequest,
  onCheckConnections,
  powerOn,
  observations,
  current,
  setCurrent,
  currentSourceOn,
  onToggleCurrentSource,
  r1,
  r2,
  r3,
  readings,
  resetRequest,
  scale = 1,
  onTogglePower,
  setVoltage,
  voltage,
  lockedCurrent = false,
  lockedVoltage = false,
  onConnectionChange,
  onConnectionDetached,
  onConnectionAdded,
}) => {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const onCheckConnectionsRef = useRef(onCheckConnections)
  const scaleRef = useRef(getJsPlumbZoom(scale))

  const [isLocked, setIsLocked] = useState(false)
  const [ammeterCurrentKeys, setAmmeterCurrentKeys] = useState(DEFAULT_AMMETER_CURRENT_KEYS)

  useEffect(() => {
    onCheckConnectionsRef.current = onCheckConnections
  }, [onCheckConnections])

  useEffect(() => {
    let cancelled = false

    const initJsPlumb = async () => {
      const jsPlumbModule = await import('jsplumb')
      const jsPlumb = resolveJsPlumb(jsPlumbModule)

      if (cancelled || !containerRef.current || !jsPlumb?.getInstance) {
        return
      }

      instanceRef.current?.reset()

      /*containerRef.current.classList.remove('connection-lab--locked')*/
      containerRef.current.classList.remove(
  'connection-lab--locked',
  'connection-lab--verified',
  'connection-lab--success',
  'walkthrough-active-target',
)
      setIsLocked(false)
      setAmmeterCurrentKeys(DEFAULT_AMMETER_CURRENT_KEYS)

      const instance = jsPlumb.getInstance({
        Container: containerRef.current,
        ConnectionsDetachable: true,
        ReattachConnections: true,
        Connector: ['Bezier', { curviness: 72 }],
        PaintStyle: {
          ...wirePaintStyles.positive,
        },
        HoverPaintStyle: {
          ...wireHoverPaintStyles.positive,
        },
        Endpoint: ['Dot', { radius: 5 }],
      })

      instanceRef.current = instance
      instance.setZoom?.(scaleRef.current)

      instance.registerConnectionTypes({
        positive: {
          paintStyle: {
            ...wirePaintStyles.positive,
          },
          hoverPaintStyle: {
            ...wireHoverPaintStyles.positive,
          },
        },
        negative: {
          paintStyle: {
            ...wirePaintStyles.negative,
          },
          hoverPaintStyle: {
            ...wireHoverPaintStyles.negative,
          },
        },
      })

      instance.setSuspendDrawing(true)

      addAllEndpoints(instance)

const notifyConnectionChange = () => {
  const connections =
    typeof instance.getAllConnections === 'function'
      ? instance.getAllConnections()
      : instance.getConnections?.()

  onConnectionChange?.(connections?.length ?? 0)
}

const handleConnectionAdded = (info) => {
  const sourceId = info.sourceId || info.source?.id
  const targetId = info.targetId || info.target?.id

  onConnectionAdded?.(sourceId, targetId)

  window.setTimeout(() => {
    notifyConnectionChange()
  }, 0)
}

const handleConnectionDetached = (connection) => {
  const sourceId = connection.sourceId || connection.source?.id
  const targetId = connection.targetId || connection.target?.id

  onConnectionDetached?.(sourceId, targetId)
  notifyConnectionChange()
}

instance.bind?.('connection', handleConnectionAdded)
instance.bind?.('connectionDetached', handleConnectionDetached)
instance.bind?.('connectionMoved', notifyConnectionChange)

instance.setSuspendDrawing(false, true)

      window.setTimeout(() => {
  instance.revalidate?.(containerRef.current)
  instance.repaintEverything()
}, 300)
    }

    initJsPlumb()

    const handleResize = () => {
      window.setTimeout(() => {
        instanceRef.current?.repaintEverything()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    return () => {
  cancelled = true
  window.removeEventListener('resize', handleResize)

  instanceRef.current?.deleteEveryConnection?.()
  instanceRef.current?.reset()
  instanceRef.current = null
}
  }, [resetRequest])

  useEffect(() => {
    const instance = instanceRef.current
    const zoom = getJsPlumbZoom(scale)

    scaleRef.current = zoom

    if (!instance?.setZoom) {
      return
    }

    instance.setZoom(zoom, true)

    window.setTimeout(() => {
      instance.repaintEverything?.()
    }, 0)
  }, [scale])

 useEffect(() => {
  if (autoConnectRequest === 0 || !instanceRef.current || isLocked) {
    return
  }

  const runAutoConnect = () => {
    if (!observations.currentSourceOnly) {
      autoConnectCurrentSourceOnly(instanceRef.current)
    } else if (!observations.voltageSourceOnly) {
      autoConnectVoltageSourceOnly(instanceRef.current)
    } else {
      autoConnectBothSources(instanceRef.current)
    }

    instanceRef.current?.repaintEverything()
  }

  window.setTimeout(runAutoConnect, 250)
}, [autoConnectRequest, isLocked])
  useEffect(() => {
    console.log('CHECK REQUEST RECEIVED:', checkRequest, instanceRef.current)
    if (checkRequest === 0 || !instanceRef.current) {
      return
    }
    const connections =
  typeof instanceRef.current.getAllConnections === 'function'
    ? instanceRef.current.getAllConnections()
    : instanceRef.current.getConnections?.()

console.log('CONNECTION COUNT:', connections?.length)
    containerRef.current?.classList.remove(
  'connection-lab--verified',
  'connection-lab--success',
  'walkthrough-active-target',
)

    //const result = validateOldExperimentConnections(instanceRef.current)
     const result = validateOldExperimentConnections(instanceRef.current)

console.log('CHECK RESULT:', result)

    if (result.isCorrect) {
  setAmmeterCurrentKeys(getAmmeterCurrentKeys(instanceRef.current))
  setIsLocked(false)
}

    onCheckConnectionsRef.current?.(result)
  }, [checkRequest])
  

  const handleLabelClick = (event) => {
    const label = event.target.closest('.terminal-number-label')

    if (!label || !containerRef.current?.contains(label)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    /*if (isLocked) {
      return
    }*/

    const terminalId = label.dataset.terminalId

    if (!terminalId || !instanceRef.current) {
      return
    }

    deleteConnectionsForTerminal(instanceRef.current, terminalId)
    instanceRef.current.repaintEverything?.()
  }

  const ammeterReadings = {
    A1: readings[ammeterCurrentKeys.A1] ?? 0,
    A2: readings[ammeterCurrentKeys.A2] ?? 0,
    A3: readings[ammeterCurrentKeys.A3] ?? 0,
  }

  return (
    <div className="connection-lab" onClick={handleLabelClick} ref={containerRef}>
      <EquipmentPanel
  onTogglePower={onTogglePower}
  powerOn={powerOn}
  readings={ammeterReadings}
  setVoltage={setVoltage}
  voltage={voltage}
  current={current}
  setCurrent={setCurrent}
  currentSourceOn={currentSourceOn}
  onToggleCurrentSource={onToggleCurrentSource}
  lockedCurrent={lockedCurrent}
lockedVoltage={lockedVoltage}
/>

      <CircuitDiagram r1={r1} r2={r2} r3={r3} />
    </div>
  )
}

export default ConnectionLab
