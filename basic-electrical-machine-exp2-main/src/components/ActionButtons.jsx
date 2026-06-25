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
  CalculationIcon,
} from './Icons.jsx'

const buttons = [
  {
    id: 'instruction-button',
    label: 'INSTRUCTIONS',
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
  {
  id: 'calculate-button',
  label: 'CALCULATE',
  tone: 'action-button--orange',
  Icon: CalculationIcon,
  handlerName: 'onCalculate',
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
  instructionStep,
  onAdd,
  onCheck,
  onCalculate,
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
    onCalculate,
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


<li className={instructionStep === 'resistance' ? 'instruction-step--active' : ''}>
  <strong>STEP 1:</strong> Set the values of resistances R1, R2 and R3 by adjusting the sliders.
</li>

<li
  className={
    instructionStep?.startsWith('case1') ||
    instructionStep?.startsWith('case2') ||
    instructionStep?.startsWith('case3')
      ? 'instruction-step--active'
      : ''
  }
>
  <strong>STEP 2:</strong> Make connections as per the instructions given below:

  <ol className="action-instructions-panel__substeps instruction-case-list">
    <li>
      <strong>CASE 1:</strong> Current source active and voltage source short-circuited.
      <ol type="a">
        <li className={instructionStep === 'case1-connections' ? 'instruction-substep--active' : ''}>Connect current source: 1-9 and 2-10.</li>
        <li className={instructionStep === 'case1-connections' ? 'instruction-substep--active' : ''}>Short voltage source terminals: 17-18.</li>
        <li className={instructionStep === 'case1-connections' ? 'instruction-substep--active' : ''}>Connect ammeters: 3-11, 4-12; 5-13, 6-14; 7-15, 8-16.</li>
        <li className={instructionStep === 'case1-check' ? 'instruction-substep--active' : ''}>Click CHECK.</li>
        <li className={instructionStep === 'case1-turn-on-current' ? 'instruction-substep--active' : ''}>Turn ON current source only and keep voltage source OFF.</li>
        <li className={instructionStep === 'case1-set-current' ? 'instruction-substep--active' : ''}>Set the required current value.</li>
        <li className={instructionStep === 'case1-add-reading' ? 'instruction-substep--active' : ''}>Click ADD to save I1, I2 and I3 for Current Source Only.</li>
        <li className={instructionStep === 'case1-turn-off-current' ? 'instruction-substep--active' : ''}>Turn OFF current source and remove the short connection 17-18 and remove the connections 9-10 and 1-2.</li>
      </ol>
    </li>

    <li>
      <strong>CASE 2:</strong> Voltage source active and current source open.
      <ol type="a">
        <li className={instructionStep === 'case2-connections' ? 'instruction-substep--active' : ''}>Connect voltage source: 17-19 and 18-20.</li>
        <li className={instructionStep === 'case2-connections' ? 'instruction-substep--active' : ''}>Keep current source terminals open.</li>
        <li className={instructionStep === 'case2-connections' ? 'instruction-substep--active' : ''}>Keep ammeter connections same.</li>
        <li className={instructionStep === 'case2-check' ? 'instruction-substep--active' : ''}>Click CHECK.</li>
        <li className={instructionStep === 'case2-turn-on-voltage' ? 'instruction-substep--active' : ''}>Turn ON voltage source only and keep current source OFF.</li>
        <li className={instructionStep === 'case2-set-voltage' ? 'instruction-substep--active' : ''}>Set the required voltage value.</li>
        <li className={instructionStep === 'case2-add-reading' ? 'instruction-substep--active' : ''}>Click ADD to save I1, I2 and I3 for Voltage Source Only.</li>
        <li className={instructionStep === 'case2-turn-off-voltage' ? 'instruction-substep--active' : ''}>Turn OFF voltage source.</li>
      </ol>
    </li>

    <li>
      <strong>CASE 3:</strong> Both voltage and current sources active.
      <ol type="a">
        <li className={instructionStep === 'case3-connections' ? 'instruction-substep--active' : ''}>Connect current source: 1-9 and 2-10.</li>
        <li className={instructionStep === 'case3-connections' ? 'instruction-substep--active' : ''}>Keep voltage source connections: 17-19 and 18-20.</li>
        <li className={instructionStep === 'case3-connections' ? 'instruction-substep--active' : ''}>Keep ammeter connections same.</li>
        <li className={instructionStep === 'case3-check' ? 'instruction-substep--active' : ''}>Click CHECK.</li>
        <li className={instructionStep === 'case3-turn-on-both' ? 'instruction-substep--active' : ''}>Turn ON both sources.</li>
        <li className={instructionStep === 'case3-use-locked-values' ? 'instruction-substep--active' : ''}>Use the same current value used in Case 1 and the same voltage value used in Case 2.</li>
        <li className={instructionStep === 'case3-add-reading' ? 'instruction-substep--active' : ''}>Click ADD to save I1, I2 and I3 for Both Sources Connected.</li>
      </ol>
    </li>
  </ol>
</li>

<li
  className={
    instructionStep === 'observation-table' ||
    instructionStep === 'calculate-button'
      ? 'instruction-step--active'
      : ''
  }
>
  <strong>STEP 3:</strong> Click on the CALCULATE button to auto-fill the calculation panel using the recorded observation values.
</li>

<li className={instructionStep?.startsWith('calculation') ? 'instruction-step--active' : ''}>
  <strong>STEP 4:</strong> Calculate the branch currents manually using the Superposition Theorem, enter the calculated values in the input fields, and click the VERIFY button to verify the theorem.
  <br />
  <strong>Note:</strong> If calculated values match the measured Both Sources readings, the Superposition Theorem is verified.
</li>

<li className={instructionStep === 'verified' ? 'instruction-step--active' : ''}>
  <strong>STEP 5:</strong> Click RESET to clear the experiment and start again.
</li>
</ol>
          </div>
        </div>
      ) : null}
    </SectionCard>
  )
}

export default ActionButtons
