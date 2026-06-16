import { Fragment } from 'react'

import circuitImage from '../assets/circuit_superposition.png'
const terminalLabels = [
  {
    id: '9-endpoint',
    label: '9',
    polarity: 'plus',
  },
  {
    id: '10-endpoint',
    label: '10',
    polarity: 'minus',
  },
  {
    id: '11-endpoint',
    label: '11',
    polarity: 'plus',
  },
  {
    id: '12-endpoint',
    label: '12',
    polarity: 'minus',
  },
  {
    id: '13-endpoint',
    label: '13',
    polarity: 'plus',
  },
  {
    id: '14-endpoint',
    label: '14',
    polarity: 'minus',
  },
  {
    id: '15-endpoint',
    label: '15',
    polarity: 'plus',
  },
  {
    id: '16-endpoint',
    label: '16',
    polarity: 'minus',
  },
  {
  id: '17-endpoint',
  label: '17',
  polarity: 'plus',
},
{
  id: '18-endpoint',
  label: '18',
  polarity: 'minus',
},
]

const CircuitDiagram = ({ className = '', r1, r2, r3 }) => (
  <section className={`circuit-panel ${className}`} id="circuit-panel">
    <div className="circuit-panel__stage">
      <img alt="Superposition theorem circuit diagram" className="circuit-panel__image" src={circuitImage} />

      {terminalLabels.map(({ id, label, polarity }) => (
        <Fragment key={id}>
          <span
            id={id}
            className={`connection-terminal connection-terminal--circuit connection-terminal--endpoint-${label}`}
            data-polarity={polarity}
            aria-label={`Circuit terminal ${label}`}
            title={`Circuit terminal ${label}`}
          />
          <span
            className={`terminal-number-label terminal-number-label--circuit terminal-number-label--endpoint-${label}`}
            data-terminal-id={id}
            title={`Circuit terminal ${label}`}
          >
            {label}
          </span>
        </Fragment>
      ))}

      <span className="resistor-value left-[235px] top-[75px]">{r1} &Omega;</span>
      <span className="resistor-value left-[480px] top-[210px]">{r2} &Omega;</span>
      <span className="resistor-value left-[510px] top-[75px]">{r3} &Omega;</span>
    </div>
  </section>
)

export default CircuitDiagram
