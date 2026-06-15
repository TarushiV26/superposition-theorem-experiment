export const POSITIVE_TERMINALS = ['1-endpoint', '3-endpoint', '5-endpoint', '7-endpoint', '19-endpoint']

export const NEGATIVE_TERMINALS = ['2-endpoint', '4-endpoint', '6-endpoint', '8-endpoint', '20-endpoint']

export const CIRCUIT_POSITIVE_TERMINALS = [
  '9-endpoint',
  '11-endpoint',
  '13-endpoint',
  '15-endpoint',
  '17-endpoint',
]

export const CIRCUIT_NEGATIVE_TERMINALS = [
  '10-endpoint',
  '12-endpoint',
  '14-endpoint',
  '16-endpoint',
  '18-endpoint',
]

export const VALID_CONNECTION_SEQUENCE = [
  '19-endpoint', '17-endpoint',
'20-endpoint', '18-endpoint',
  '1-endpoint', '9-endpoint',
  '2-endpoint', '10-endpoint',

  '3-endpoint', '11-endpoint',
  '4-endpoint', '12-endpoint',

  '5-endpoint', '13-endpoint',
  '6-endpoint', '14-endpoint',

  '7-endpoint', '15-endpoint',
  '8-endpoint', '16-endpoint',

  // These extra combinations allow A1, A2, A3 to be connected
  // to different valid branches, same as your old JavaScript file.

  '3-endpoint', '13-endpoint',
  '4-endpoint', '14-endpoint',

  '3-endpoint', '15-endpoint',
  '4-endpoint', '16-endpoint',

  '5-endpoint', '11-endpoint',
  '6-endpoint', '12-endpoint',

  '5-endpoint', '15-endpoint',
  '6-endpoint', '16-endpoint',

  '7-endpoint', '11-endpoint',
  '8-endpoint', '12-endpoint',

  '7-endpoint', '13-endpoint',
  '8-endpoint', '14-endpoint',
]

export const DEFAULT_AUTO_CONNECTIONS = [
  ['19-endpoint', '17-endpoint'],
  ['20-endpoint', '18-endpoint'],

  ['1-endpoint', '9-endpoint'],
  ['2-endpoint', '10-endpoint'],

  ['3-endpoint', '11-endpoint'],
  ['4-endpoint', '12-endpoint'],

  ['5-endpoint', '13-endpoint'],
  ['6-endpoint', '14-endpoint'],

  ['7-endpoint', '15-endpoint'],
  ['8-endpoint', '16-endpoint'],
]
export const CURRENT_SOURCE_ONLY_CONNECTIONS = [
  ['1-endpoint', '9-endpoint'],
  ['2-endpoint', '10-endpoint'],

  ['17-endpoint', '18-endpoint'],

  ['3-endpoint', '11-endpoint'],
  ['4-endpoint', '12-endpoint'],

  ['5-endpoint', '13-endpoint'],
  ['6-endpoint', '14-endpoint'],

  ['7-endpoint', '15-endpoint'],
  ['8-endpoint', '16-endpoint'],
]

export const VOLTAGE_SOURCE_ONLY_CONNECTIONS = [
  ['19-endpoint', '17-endpoint'],
  ['20-endpoint', '18-endpoint'],

  ['3-endpoint', '11-endpoint'],
  ['4-endpoint', '12-endpoint'],

  ['5-endpoint', '13-endpoint'],
  ['6-endpoint', '14-endpoint'],

  ['7-endpoint', '15-endpoint'],
  ['8-endpoint', '16-endpoint'],
]

export const BOTH_SOURCES_CONNECTIONS = [
  ['19-endpoint', '17-endpoint'],
  ['20-endpoint', '18-endpoint'],

  ['1-endpoint', '9-endpoint'],
  ['2-endpoint', '10-endpoint'],

  ['3-endpoint', '11-endpoint'],
  ['4-endpoint', '12-endpoint'],

  ['5-endpoint', '13-endpoint'],
  ['6-endpoint', '14-endpoint'],

  ['7-endpoint', '15-endpoint'],
  ['8-endpoint', '16-endpoint'],
]

export const DEFAULT_AMMETER_CURRENT_KEYS = {
  A1: 'i1',
  A2: 'i2',
  A3: 'i3',
}

const AMMETER_BRANCH_CONNECTIONS = {
  A1: [
    {
      currentKey: 'i1',
      negativeTerminal: '4-endpoint',
      positiveTerminal: '3-endpoint',
      circuitNegativeTerminal: '12-endpoint',
      circuitPositiveTerminal: '11-endpoint',
    },
    {
      currentKey: 'i2',
      negativeTerminal: '4-endpoint',
      positiveTerminal: '3-endpoint',
      circuitNegativeTerminal: '14-endpoint',
      circuitPositiveTerminal: '13-endpoint',
    },
    {
      currentKey: 'i3',
      negativeTerminal: '4-endpoint',
      positiveTerminal: '3-endpoint',
      circuitNegativeTerminal: '16-endpoint',
      circuitPositiveTerminal: '15-endpoint',
    },
  ],
  A2: [
    {
      currentKey: 'i1',
      negativeTerminal: '6-endpoint',
      positiveTerminal: '5-endpoint',
      circuitNegativeTerminal: '12-endpoint',
      circuitPositiveTerminal: '11-endpoint',
    },
    {
      currentKey: 'i2',
      negativeTerminal: '6-endpoint',
      positiveTerminal: '5-endpoint',
      circuitNegativeTerminal: '14-endpoint',
      circuitPositiveTerminal: '13-endpoint',
    },
    {
      currentKey: 'i3',
      negativeTerminal: '6-endpoint',
      positiveTerminal: '5-endpoint',
      circuitNegativeTerminal: '16-endpoint',
      circuitPositiveTerminal: '15-endpoint',
    },
  ],
  A3: [
    {
      currentKey: 'i1',
      negativeTerminal: '8-endpoint',
      positiveTerminal: '7-endpoint',
      circuitNegativeTerminal: '12-endpoint',
      circuitPositiveTerminal: '11-endpoint',
    },
    {
      currentKey: 'i2',
      negativeTerminal: '8-endpoint',
      positiveTerminal: '7-endpoint',
      circuitNegativeTerminal: '14-endpoint',
      circuitPositiveTerminal: '13-endpoint',
    },
    {
      currentKey: 'i3',
      negativeTerminal: '8-endpoint',
      positiveTerminal: '7-endpoint',
      circuitNegativeTerminal: '16-endpoint',
      circuitPositiveTerminal: '15-endpoint',
    },
  ],
}

export const resolveJsPlumb = (module) => (
  module?.jsPlumb
  || module?.default?.jsPlumb
  || module?.default
  || window.jsPlumb
)

const getAllConnections = (instance) => {
  if (!instance) return []

  if (typeof instance.getAllConnections === 'function') {
    return instance.getAllConnections()
  }

  if (typeof instance.getConnections === 'function') {
    return instance.getConnections()
  }

  return []
}

export const deleteConnectionsForTerminal = (instance, terminalId) => {
  const matchingConnections = getAllConnections(instance).filter((connection) => {
    const sourceId = connection.sourceId || connection.source?.id
    const targetId = connection.targetId || connection.target?.id

    return sourceId === terminalId || targetId === terminalId
  })

  matchingConnections.forEach((connection) => {
    if (typeof instance.deleteConnection === 'function') {
      instance.deleteConnection(connection)
      return
    }

    connection.detach?.()
  })

  return matchingConnections.length
}

const isNegativeTerminal = (terminalId) => (
  NEGATIVE_TERMINALS.includes(terminalId)
  || CIRCUIT_NEGATIVE_TERMINALS.includes(terminalId)
)

const terminalPaintStyles = {
  positive: {
    fill: '#0969e8',
    outlineStroke: '#f8fbff',
    outlineWidth: 2,
    stroke: '#062b77',
    strokeWidth: 1.4,
  },
  negative: {
    fill: '#e33024',
    outlineStroke: '#fff8f6',
    outlineWidth: 2,
    stroke: '#8f140e',
    strokeWidth: 1.4,
  },
}

const terminalHoverPaintStyles = {
  positive: {
    fill: '#2a7cff',
    outlineStroke: '#ffffff',
    outlineWidth: 2.4,
    stroke: '#082767',
    strokeWidth: 1.6,
  },
  negative: {
    fill: '#ff4a3d',
    outlineStroke: '#ffffff',
    outlineWidth: 2.4,
    stroke: '#81130f',
    strokeWidth: 1.6,
  },
}

const getTerminalNumber = (terminalId) => terminalId.replace('-endpoint', '')

const getCssValue = (styles, propertyName, fallback) => {
  const value = styles.getPropertyValue(propertyName).trim()

  return value || fallback
}

const getCssNumber = (styles, propertyName, fallback) => {
  const value = Number.parseFloat(styles.getPropertyValue(propertyName))

  return Number.isFinite(value) ? value : fallback
}

const getEndpointPaintStyle = (element, type, state = 'default') => {
  const styles = window.getComputedStyle(element)
  const prefix = state === 'hover' ? '--jtk-endpoint-hover' : '--jtk-endpoint'
  const defaults = state === 'hover'
    ? terminalHoverPaintStyles[type]
    : terminalPaintStyles[type]

  return {
    fill: getCssValue(styles, `${prefix}-fill`, defaults.fill),
    outlineStroke: getCssValue(
      styles,
      `${prefix}-outline-stroke`,
      defaults.outlineStroke,
    ),
    outlineWidth: getCssNumber(
      styles,
      `${prefix}-outline-width`,
      defaults.outlineWidth,
    ),
    stroke: getCssValue(styles, `${prefix}-stroke`, defaults.stroke),
    strokeWidth: getCssNumber(
      styles,
      `${prefix}-stroke-width`,
      defaults.strokeWidth,
    ),
  }
}

const getEndpointRadius = (element) => (
  getCssNumber(window.getComputedStyle(element), '--jtk-endpoint-radius', 5)
)

const getEndpointCssClass = (terminalId, type) => {
  const terminalNumber = getTerminalNumber(terminalId)

  return [
    'jtk-endpoint--terminal',
    `jtk-endpoint--terminal-${terminalNumber}`,
    `jtk-endpoint--${terminalId}`,
    `jtk-endpoint--${type}`,
  ].join(' ')
}

export const wirePaintStyles = {
  positive: {
    outlineStroke: '#07306e',
    outlineWidth: 1.15,
    stroke: '#1f73e6',
    strokeWidth: 4.6,
  },
  negative: {
    outlineStroke: '#771914',
    outlineWidth: 1.15,
    stroke: '#dd342d',
    strokeWidth: 4.6,
  },
}

export const wireHoverPaintStyles = {
  positive: {
    outlineStroke: '#052357',
    outlineWidth: 1.35,
    stroke: '#3a8aff',
    strokeWidth: 5,
  },
  negative: {
    outlineStroke: '#5d110d',
    outlineWidth: 1.35,
    stroke: '#f04a42',
    strokeWidth: 5,
  },
}

export const getConnectionBetween = (instance, firstId, secondId) => {
  const connections = getAllConnections(instance)

  return connections.find((connection) => {
    const sourceId = connection.sourceId || connection.source?.id
    const targetId = connection.targetId || connection.target?.id

    return (
      (sourceId === firstId && targetId === secondId)
      || (sourceId === secondId && targetId === firstId)
    )
  })
}

export const hasConnectionBetween = (instance, firstId, secondId) => (
  Boolean(getConnectionBetween(instance, firstId, secondId))
)

export const getAmmeterCurrentKeys = (instance) => {
  const currentKeys = {
    ...DEFAULT_AMMETER_CURRENT_KEYS,
  }

  Object.entries(AMMETER_BRANCH_CONNECTIONS).forEach(([meterLabel, branches]) => {
    const matchedBranch = branches.find((branch) => (
      hasConnectionBetween(
        instance,
        branch.positiveTerminal,
        branch.circuitPositiveTerminal,
      )
      && hasConnectionBetween(
        instance,
        branch.negativeTerminal,
        branch.circuitNegativeTerminal,
      )
    ))

    if (matchedBranch) {
      currentKeys[meterLabel] = matchedBranch.currentKey
    }
  })

  return currentKeys
}

export const addTerminalEndpoint = (instance, terminalId, type) => {
  const element = document.getElementById(terminalId)

  if (!element) {
    return
  }

  instance.addEndpoint(element, {
    uuid: terminalId,
    endpoint: ['Dot', { radius: getEndpointRadius(element) }],
    cssClass: getEndpointCssClass(terminalId, type),
    anchor: ['Center'],
    isSource: true,
    isTarget: true,
    connectionType: type,
    connectionsDetachable: true,
    connectorStyle: wirePaintStyles[type],
    connectorHoverStyle: wireHoverPaintStyles[type],
    maxConnections: 1,
    paintStyle: getEndpointPaintStyle(element, type),
    hoverPaintStyle: getEndpointPaintStyle(element, type, 'hover'),
  })
}

export const addAllEndpoints = (instance) => {
  POSITIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'positive')
  })

  NEGATIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'negative')
  })

  CIRCUIT_POSITIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'positive')
  })

  CIRCUIT_NEGATIVE_TERMINALS.forEach((terminalId) => {
    addTerminalEndpoint(instance, terminalId, 'negative')
  })
}

const applyAutoConnections = (instance, connections) => {
  instance.deleteEveryConnection?.()

  connections.forEach(([source, target]) => {
    instance.connect({
      uuids: [source, target],
      type: isNegativeTerminal(source) ? 'negative' : 'positive',
    })
  })
}

export const autoConnectDefaultCircuit = (instance) => {
  applyAutoConnections(instance, DEFAULT_AUTO_CONNECTIONS)
}

export const autoConnectCurrentSourceOnly = (instance) => {
  applyAutoConnections(instance, CURRENT_SOURCE_ONLY_CONNECTIONS)
}

export const autoConnectVoltageSourceOnly = (instance) => {
  applyAutoConnections(instance, VOLTAGE_SOURCE_ONLY_CONNECTIONS)
}

export const autoConnectBothSources = (instance) => {
  applyAutoConnections(instance, BOTH_SOURCES_CONNECTIONS)
}

export const validateOldExperimentConnections = (instance) => {
  const ammeterConnections = [
    ['3-endpoint', '11-endpoint'],
    ['4-endpoint', '12-endpoint'],
    ['5-endpoint', '13-endpoint'],
    ['6-endpoint', '14-endpoint'],
    ['7-endpoint', '15-endpoint'],
    ['8-endpoint', '16-endpoint'],
  ]

  // Case 1: Current Source Only
  // Voltage source terminals are shorted.
  const currentSourceOnlyConnections = [
    ...ammeterConnections,
    ['1-endpoint', '9-endpoint'],
    ['2-endpoint', '10-endpoint'],
    ['17-endpoint', '18-endpoint'],
  ]

  // Case 2: Voltage Source Only
  // Current source terminals remain open.
  const voltageSourceOnlyConnections = [
    ...ammeterConnections,
    ['19-endpoint', '17-endpoint'],
    ['20-endpoint', '18-endpoint'],
  ]

  // Case 3: Both Sources Connected
  const bothSourcesConnections = [
    ...ammeterConnections,
    ['1-endpoint', '9-endpoint'],
    ['2-endpoint', '10-endpoint'],
    ['19-endpoint', '17-endpoint'],
    ['20-endpoint', '18-endpoint'],
  ]

  const cases = [
    currentSourceOnlyConnections,
    voltageSourceOnlyConnections,
    bothSourcesConnections,
  ]

  const totalConnections = getAllConnections(instance).length

  const caseResults = cases.map((connections) => {
    const matchedCount = connections.filter(([first, second]) => (
      hasConnectionBetween(instance, first, second)
    )).length

    return {
      requiredCount: connections.length,
      matchedCount,
      isCorrect:
        matchedCount === connections.length
        && totalConnections === connections.length,
    }
  })

  const correctCase = caseResults.find((result) => result.isCorrect)

  const bestMatch = caseResults.reduce((best, current) => (
    current.matchedCount > best.matchedCount ? current : best
  ), caseResults[0])

  const correctCaseIndex = caseResults.findIndex((result) => result.isCorrect)

const caseNames = [
  'currentSourceOnly',
  'voltageSourceOnly',
  'bothSources',
]

return {
  isCorrect: correctCaseIndex !== -1,
  matchedCount: correctCaseIndex !== -1
    ? caseResults[correctCaseIndex].matchedCount
    : bestMatch.matchedCount,
  totalConnections,
  caseType: correctCaseIndex !== -1 ? caseNames[correctCaseIndex] : null,
}
}

export const lockJsPlumbCircuit = (instance, containerElement) => {
  getAllConnections(instance).forEach((connection) => {
    connection.setDetachable?.(false)

    connection.endpoints?.forEach((endpoint) => {
      endpoint.setEnabled?.(false)
    })
  })

  containerElement?.classList.add('connection-lab--locked')
}
