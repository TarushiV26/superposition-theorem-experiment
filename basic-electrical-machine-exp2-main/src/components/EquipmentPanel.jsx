
import Ammeter from './Ammeter.jsx'
import CurrentSource from './CurrentSource.jsx'
import PowerSupply from './PowerSupply.jsx'

const EquipmentPanel = ({
  onTogglePower,
  powerOn,
  readings,
  setVoltage,
  voltage,
  current,
  setCurrent,
  currentSourceOn,
  onToggleCurrentSource,
  lockedCurrent = false,
  lockedVoltage = false,
  sourcesLocked = false,
}) => (
  <section className="equipment-panel" id="equipment-panel">
    
    <CurrentSource
  label="CS1"
  positiveTerminal={1}
  negativeTerminal={2}
  powerOn={currentSourceOn}
  current={current}
  setCurrent={setCurrent}
  onTogglePower={onToggleCurrentSource}
   locked={lockedCurrent}
    sourcesLocked={sourcesLocked}
/>
    <div className="ammeter-slot ammeter-slot--a1">
  <Ammeter label="A1" value={readings.A1} />
</div>

<div className="ammeter-slot ammeter-slot--a2">
  <Ammeter label="A2" value={readings.A2} />
</div>

<div className="ammeter-slot ammeter-slot--a3">
  <Ammeter label="A3" value={readings.A3} />
</div>
<div id="ammeters-walkthrough-target" aria-hidden="true" />
    <PowerSupply
      id="power-supply-2"
      positiveTerminal={19}
      negativeTerminal={20}
      onTogglePower={onTogglePower}
      powerOn={powerOn}
      setVoltage={setVoltage}
      voltage={voltage}
      locked={lockedVoltage}
      sourcesLocked={sourcesLocked}
    />
  </section>
)

export default EquipmentPanel
