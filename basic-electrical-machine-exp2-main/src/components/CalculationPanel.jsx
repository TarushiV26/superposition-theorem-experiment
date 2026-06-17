import { useEffect, useState } from 'react'
import SectionCard from './SectionCard.jsx'

const branches = [
  { key: 'i1', label: 'I₁ (A)' },
  { key: 'i2', label: 'I₂ (A)' },
  { key: 'i3', label: 'I₃ (A)' },
]

const format = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return ''
  }

  return Number(number.toFixed(3)).toString()
}

const CalculationPanel = ({ observations, resistanceValues, currentValue, voltageValue, autoFillTrigger, setInstructionStep }) => {
  const [sourceValues, setSourceValues] = useState({
    r1: '',
    r2: '',
    r3: '',
    current: '',
    voltage: '',
  })

  const [operators, setOperators] = useState({
    i1: '',
    i2: '',
    i3: '',
  })

  const [readings, setReadings] = useState({
    currentSourceOnly: { i1: '', i2: '', i3: '' },
    voltageSourceOnly: { i1: '', i2: '', i3: '' },
    userResults: { i1: '', i2: '', i3: '' },
  })
  const [verificationMessage, setVerificationMessage] = useState('')

  const both = observations.bothSources
  const isReady = Boolean(both)

  useEffect(() => {
  if (!autoFillTrigger) return

  setSourceValues({
    r1: resistanceValues.r1,
    r2: resistanceValues.r2,
    r3: resistanceValues.r3,
    current: currentValue,
    voltage: voltageValue,
  })

  setReadings((prev) => ({
    ...prev,

    currentSourceOnly: {
      i1: observations.currentSourceOnly?.i1?.toFixed(3) ?? '',
      i2: observations.currentSourceOnly?.i2?.toFixed(3) ?? '',
      i3: observations.currentSourceOnly?.i3?.toFixed(3) ?? '',
    },

    voltageSourceOnly: {
      i1: observations.voltageSourceOnly?.i1?.toFixed(3) ?? '',
      i2: observations.voltageSourceOnly?.i2?.toFixed(3) ?? '',
      i3: observations.voltageSourceOnly?.i3?.toFixed(3) ?? '',
    },
  }))
}, [autoFillTrigger])
  const updateSourceValue = (key, value) => {
    setSourceValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const updateReading = (section, branch, value) => {
    setReadings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [branch]: value,
      },
    }))
  }

  const toggleOperator = (branch) => {
  setOperators((prev) => ({
    ...prev,
    [branch]: prev[branch] === '' || prev[branch] === '-' ? '+' : '-',
  }))
}

  const calculateBranch = (branch) => {
    const cs = Number(readings.currentSourceOnly[branch])
    const vs = Number(readings.voltageSourceOnly[branch])

    if (!Number.isFinite(cs) || !Number.isFinite(vs)) {
      return ''
    }

    if (!operators[branch]) {
  return ''
}

return operators[branch] === '+'
  ? cs + vs
  : cs - vs
  }

  const isCorrect = (branch) => {
    const userValue = Number(readings.userResults[branch])

    if (!isReady || !Number.isFinite(userValue)) {
      return false
    }

    return Math.abs(userValue - both[branch]) <= 0.01
  }
  const handleVerify = () => {
  if (!isReady) {
    setVerificationMessage('Complete all three simulation observations first.')
    return
  }

  const allCorrect = branches.every((branch) => isCorrect(branch.key))

  if (allCorrect) {
  setVerificationMessage('✓ Superposition Theorem verified successfully.')
  setInstructionStep?.('verified')
} else {
  setVerificationMessage('✗ Check your signs and calculated current values.')
}
}

  return (
    <SectionCard className="calculation-panel calculation-panel-card" icon="table" id="calculation-panel" title="CALCULATIONS">
      <div className="calculation-form">
        <div className="calculation-values-grid">
          <div>
            <h4>Resistance Values</h4>

            <label>
              R₁:
              <input
                className="calculation-input small"
                value={sourceValues.r1}
                onChange={(event) => updateSourceValue('r1', event.target.value)}
              />
              Ω
            </label>

            <label>
              R₂:
              <input
                className="calculation-input small"
                value={sourceValues.r2}
                onChange={(event) => updateSourceValue('r2', event.target.value)}
              />
              Ω
            </label>

            <label>
              R₃:
              <input
                className="calculation-input small"
                value={sourceValues.r3}
                onChange={(event) => updateSourceValue('r3', event.target.value)}
              />
              Ω
            </label>
          </div>

          <div>
            <h4>Source Values</h4>

            <label>
              Current Source:
              <input
                className="calculation-input small"
                value={sourceValues.current}
                onChange={(event) => updateSourceValue('current', event.target.value)}
              />
              A
            </label>

            <label>
              Voltage Source:
              <input
                className="calculation-input small"
                value={sourceValues.voltage}
                onChange={(event) => updateSourceValue('voltage', event.target.value)}
              />
              V
            </label>
          </div>
        </div>

        <div className="calculation-current-section">
          <div className="calculation-section-title"></div>

          <table className="calculation-table">
            <thead>
              <tr>
                <th>Observation</th>
                {branches.map((branch) => (
                  <th key={branch.key}>{branch.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Connected Current Source</td>
                {branches.map((branch) => (
                  <td key={branch.key}>
                    <input
                      className="calculation-input"
                      value={readings.currentSourceOnly[branch.key]}
                      onChange={(event) => updateReading('currentSourceOnly', branch.key, event.target.value)}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td></td>
                {branches.map((branch) => (
                  <td key={branch.key}>
                    <button
  className={`sign-toggle ${!operators[branch.key] ? 'sign-toggle--unset' : ''}`}
  onClick={() => toggleOperator(branch.key)}
  type="button"
>
  {operators[branch.key] || '±'}
</button>
                  </td>
                ))}
              </tr>

              <tr>
                <td>Connected Voltage Source</td>
                {branches.map((branch) => (
                  <td key={branch.key}>
                    <input
                      className="calculation-input"
                      value={readings.voltageSourceOnly[branch.key]}
                      onChange={(event) => updateReading('voltageSourceOnly', branch.key, event.target.value)}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td></td>
                {branches.map((branch) => (
                  <td key={branch.key} className="equals-cell">=</td>
                ))}
              </tr>

              <tr>
                <td>Both Sources Connected</td>
                {branches.map((branch) => (
                  <td key={branch.key}>
                    <input
                      className="calculation-input"
                      readOnly
                      value={format(calculateBranch(branch.key))}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td>Enter your calculation results</td>
                  {branches.map((branch) => (
                  <td key={branch.key}>
                    <input
                      className={`calculation-input ${isCorrect(branch.key) ? 'correct' : ''}`}
                      value={readings.userResults[branch.key]}
                      onChange={(event) => updateReading('userResults', branch.key, event.target.value)}
                    />
                  </td>
                   ))}
                  </tr>
                  </tbody>
                  <tfoot>
  <tr>
    <td colSpan={4}>
      <div className="calculation-verify-row">
        <button
          className="verify-button"
          type="button"
          onClick={handleVerify}
        >
          Verify
        </button>

        {verificationMessage && (
          <span className="verification-message">
            {verificationMessage}
          </span>
        )}
      </div>
    </td>
  </tr>
</tfoot>
                  </table>
                  </div>
                  </div>
                  <div className="copyright-footer">
  © 2026 Virtual Lab | IIT Roorkee
</div>
                 </SectionCard>
                   )
                  }

export default CalculationPanel