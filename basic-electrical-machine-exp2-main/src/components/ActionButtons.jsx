import { useState } from 'react'
import SectionCard from './SectionCard.jsx'
import {
  AddIcon,
  AiGuide,
  AutoConnectIcon,
  ButtonIcon,
  CheckIcon,
  CloseIcon,
  PlotIcon,
  PrintIcon,
  ResetIcon,
  TableIcon,
} from './Icons.jsx'

const buttons = [
  {
    id: 'instruction-button',
    label: 'INSTRUCTION',
    tone: 'action-button--gold',
    Icon: ButtonIcon,
    opensInstructions: true,
  },
  {
    id: 'ai-guide-button',
    label: 'AI GUIDE',
    tone: 'action-button--cyan',
    Icon: AiGuide,
    handlerName: 'onAiGuide',
  },
  {
    id: 'check-button',
    label: 'CHECK',
    tone: 'action-button--green',
    Icon: CheckIcon,
    handlerName: 'onCheck',
  },
  {
    id: 'auto-connect-button',
    label: 'AUTO CONNECT',
    tone: 'action-button--teal',
    Icon: AutoConnectIcon,
    handlerName: 'onAutoConnect',
  },
  {
    id: 'add-reading-button',
    label: 'ADD',
    tone: 'action-button--blue',
    Icon: AddIcon,
    handlerName: 'onAdd',
  },
  /*{
    id: 'plot-button',
    label: 'PLOT',
    tone: 'action-button--orange',
    Icon: PlotIcon,
    handlerName: 'onPlot',
  },*/
  {
    id: 'reset-button',
    label: 'RESET',
    tone: 'action-button--red',
    Icon: ResetIcon,
    handlerName: 'onReset',
  },
  {
    id: 'print-button',
    label: 'PRINT',
    tone: 'action-button--purple',
    Icon: PrintIcon,
    handlerName: 'onPrint',
  },
  
 
]

const ActionButtons = ({
  disabledButtons = {},
  onAdd,
  onCheck,
  onPlot,
  onPrint,
  onReset,
  onAutoConnect,
  onAiGuide,
}) => {
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const handlers = {
    onAdd,
    onCheck,
    onPlot,
    onPrint,
    onReset,
    onAutoConnect,
    onAiGuide,
  }

  return (
    <SectionCard className="action-buttons-card h-[176px]" icon="buttons" id="action-buttons-panel" title="ACTION BUTTONS">
      <div className="action-buttons__grid">
        {buttons.map(({ id, label, tone, Icon, handlerName, opensInstructions }) => {
          const handler = handlers[handlerName]
          const isDisabled = !opensInstructions && (!handler || disabledButtons[handlerName])
          const buttonProps = opensInstructions
            ? {
                'aria-controls': 'experiment-instructions-panel',
                'aria-expanded': instructionsOpen,
                onClick: () => setInstructionsOpen((current) => !current),
              }
            : {
                onClick: handler,
              }

          return (
            <button
              id={id}
              key={label}
              type="button"
              className={`action-button ${tone}`}
              disabled={isDisabled}
              {...buttonProps}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {instructionsOpen ? (
        <div
          className="action-instructions-panel"
          id="experiment-instructions-panel"
          role="region"
          aria-labelledby="experiment-instructions-title"
        >
          <div className="action-instructions-panel__header">
            <h3 id="experiment-instructions-title">Instructions</h3>
            <button
              type="button"
              className="action-instructions-panel__close"
              aria-label="Close instructions"
              onClick={() => setInstructionsOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="action-instructions-panel__body">
            <ol className="action-instructions-panel__steps">
  <li>
    <strong>IMPORTANT:</strong> Set R1, R2 and R3 before starting. Keep the same resistance values for Current Source Only, Voltage Source Only and Both Sources cases.
  </li>

  <li>
    <strong>STEP 1:</strong> Set R1, R2 and R3 using the resistance sliders.
  </li>

  <li>
    <strong>CASE 1:</strong> Current source active and voltage source short-circuited.
    <ol className="action-instructions-panel__substeps" type="a">
      <li>Connect current source: 1-9 and 2-10.</li>
      <li>Short voltage source terminals: 17-18.</li>
      <li>Connect ammeters: 3-11, 4-12; 5-13, 6-14; 7-15, 8-16.</li>
      <li>Click CHECK.</li>
      <li>Turn ON current source only and keep voltage source OFF.</li>
      <li>Set the required current value.</li>
      <li>Click ADD to save I1, I2 and I3 for Current Source Only.</li>
      <li>Turn OFF current source and remove the short connection 17-18.</li>
    </ol>
  </li>

  <li>
    <strong>CASE 2:</strong> Voltage source active and current source open.
    <ol className="action-instructions-panel__substeps" type="a">
      <li>Connect voltage source: 17-19 and 18-20.</li>
      <li>Keep current source terminals open.</li>
      <li>Keep ammeter connections same.</li>
      <li>Click CHECK.</li>
      <li>Turn ON voltage source only and keep current source OFF.</li>
      <li>Set the required voltage value.</li>
      <li>Click ADD to save I1, I2 and I3 for Voltage Source Only.</li>
      <li>Turn OFF voltage source.</li>
    </ol>
  </li>

  <li>
    <strong>CASE 3:</strong> Both voltage and current sources active.
    <ol className="action-instructions-panel__substeps" type="a">
      <li>Connect current source: 1-9 and 2-10.</li>
      <li>Connect voltage source: 17-19 and 18-20.</li>
      <li>Keep ammeter connections same.</li>
      <li>Click CHECK.</li>
      <li>Turn ON both sources.</li>
      <li>Use the same current value used in Case 1 and the same voltage value used in Case 2.</li>
      <li>Click ADD to save I1, I2 and I3 for Both Sources Connected.</li>
    </ol>
  </li>

  <li>
    <strong>STEP 2:</strong> Check the observation table. It should contain three rows: Current Source Only, Voltage Source Only and Both Sources Active.
  </li>

  <li>
    <strong>STEP 3:</strong> Go to the Calculation Panel below the simulation.
    <ol className="action-instructions-panel__substeps" type="a">
      <li>Enter R1, R2, R3, current source value and voltage source value used during the experiment.</li>
      <li>Enter the branch currents obtained in Current Source Only and Voltage Source Only cases.</li>
      <li>Use the + / − toggle according to current direction.</li>
      <li>Use + when the component current is in the same direction as the assumed branch current.</li>
      <li>Use − when the component current is opposite to the assumed branch current.</li>
      <li>Enter your final calculated I1, I2 and I3 values.</li>
      <li>Click VERIFY to compare your calculation with the Both Sources Connected readings.</li>
    </ol>
  </li>

  <li>
    <strong>STEP 4:</strong> If calculated values match the measured Both Sources readings, the Superposition Theorem is verified.
  </li>

  <li>
    <strong>STEP 5:</strong> Click PRINT to print the webpage or RESET to restart the experiment.
  </li>
</ol>
          </div>
        </div>
      ) : null}
    </SectionCard>
  )
}

export default ActionButtons
