import powerSupplyOff from '../assets/VoltageSource_OFF.png'
import powerSupplyOn from '../assets/VoltageSource_ON.png'

const PowerSupply = ({
  id = 'power-supply',
  positiveTerminal = 1,
  negativeTerminal = 2,
  onTogglePower,
  powerOn,
  setVoltage,
  voltage,
}) => {
  const displayedVoltage = powerOn ? `${voltage.toFixed(1)} V` : ''
  const handleVoltageChange = (event) => {
    setVoltage(Number(Number(event.target.value).toFixed(1)))
  }

  return (
    <article className="power-supply" id={id}>
      <img
        alt={powerOn ? 'Power supply switched on' : 'Power supply switched off'}
        className="power-supply__image"
        src={powerOn ? powerSupplyOn : powerSupplyOff}
      />

      <div className="power-supply__display">{displayedVoltage}</div>
      <span
        id={`${positiveTerminal}-endpoint`}
        className={`connection-terminal connection-terminal--power connection-terminal--power-plus connection-terminal--endpoint-${positiveTerminal}`}
        data-polarity="plus"
        aria-label={`Power supply positive terminal ${positiveTerminal}`}
        title={`Voltage positive`}
      />
      <span
        className={`terminal-number-label terminal-number-label--power-plus terminal-number-label--endpoint-${positiveTerminal}`}
        data-terminal-id={`${positiveTerminal}-endpoint`}
        title={`Voltage positive`}
      >
        {positiveTerminal}
      </span>

      <span
        id={`${negativeTerminal}-endpoint`}
        className={`connection-terminal connection-terminal--power connection-terminal--power-minus connection-terminal--endpoint-${negativeTerminal}`}
        data-polarity="minus"
        aria-label={`Power supply negative terminal ${negativeTerminal}`}
        title={`Voltagenegative`}
      />
      <span
        className={`terminal-number-label terminal-number-label--power-minus terminal-number-label--endpoint-${negativeTerminal}`}
        data-terminal-id={`${negativeTerminal}-endpoint`}
        title={`Voltage negative`}
      >
        {negativeTerminal}
      </span>
      <button
        id="power-toggle-button"
        aria-label={powerOn ? 'Switch power supply off' : 'Switch power supply on'}
        aria-pressed={powerOn}
        className="power-supply__button"
        onClick={onTogglePower}
        type="button"
      />

      <label className="power-supply__control" id="voltage-control">
        <span className="sr-only">Voltage</span>
        <input
          aria-label="Voltage"
          className="voltage-range"
          disabled={!powerOn}
          id="voltage-slider"
          max="10"
          min="0"
          onChange={handleVoltageChange}
          step="0.1"
          type="range"
          value={voltage}
        />
      </label>
    </article>
  )
}

export default PowerSupply
