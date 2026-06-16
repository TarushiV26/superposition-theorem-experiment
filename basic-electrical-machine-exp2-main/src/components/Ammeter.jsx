import a1Img from '../assets/A1.png'
import a2Img from '../assets/A2.png'
import a3Img from '../assets/A3.png'
import needleImg from '../assets/needle.png'

//const METER_MAX_CURRENT = 10
//const DIAL_START_ANGLE = 180
//const DIAL_SWEEP_ANGLE = 180

const ammeterImages = {
  A1: a1Img,
  A2: a2Img,
  A3: a3Img,
}

const terminalNumbers = {
  A1: { positive: 3, negative: 4 },
  A2: { positive: 5, negative: 6 },
  A3: { positive: 7, negative: 8 },
}

const Ammeter = ({ label, value = 0 }) => {
  const terminals = terminalNumbers[label]
const current = Number.isFinite(value) ? Math.abs(value) : 0
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const needleCalibration = [
  { value: 0, angle: 180 },
  { value: 1, angle: 196 },
  { value: 2, angle: 212 },
  { value: 3, angle: 230 },
  { value: 4, angle: 248 },
  { value: 5, angle: 270 },
  { value: 6, angle: 291 },
  { value: 7, angle: 309 },
  { value: 8, angle: 327 },
  { value: 9, angle: 344},
  { value: 10, angle: 360 },
]

const getNeedleAngle = (value) => {
  const currentValue = clamp(value, 0, 10)

  for (let i = 0; i < needleCalibration.length - 1; i += 1) {
    const startPoint = needleCalibration[i]
    const endPoint = needleCalibration[i + 1]

    if (currentValue >= startPoint.value && currentValue <= endPoint.value) {
      const localRatio =
        (currentValue - startPoint.value) / (endPoint.value - startPoint.value)

      return startPoint.angle + localRatio * (endPoint.angle - startPoint.angle)
    }
  }

  return needleCalibration.at(-1).angle
}

const angle = getNeedleAngle(current)

  /*const needleRotation = {
  A1: { start: 180, sweep: 180 },
  A2: { start: 180, sweep: 180 },
  A3: { start: 180, sweep: 180 },
}*/

//const { start, sweep } = needleRotation[label] ?? needleRotation.A1


  return (
    <article className={`ammeter ammeter--${label}`} id={`ammeter-${label.toLowerCase()}`} aria-label={`${label} ammeter`}>
      <img
        src={ammeterImages[label]}
        alt={`${label} ammeter`}
        className="ammeter__image"
      />

      <span
        id={`${terminals.positive}-endpoint`}
        className={`connection-terminal connection-terminal--meter connection-terminal--meter-plus connection-terminal--endpoint-${terminals.positive}`}
        data-polarity="plus"
        aria-label={`${label} positive terminal ${terminals.positive}`}
        title={`${label} positive`}
      />
      <span
        className={`terminal-number-label terminal-number-label--meter-plus terminal-number-label--endpoint-${terminals.positive}`}
        data-terminal-id={`${terminals.positive}-endpoint`}
        title={`${label} positive`}
      >
        {terminals.positive}
      </span>

      <span
        id={`${terminals.negative}-endpoint`}
        className={`connection-terminal connection-terminal--meter connection-terminal--meter-minus connection-terminal--endpoint-${terminals.negative}`}
        data-polarity="minus"
        aria-label={`${label} negative terminal ${terminals.negative}`}
        title={`${label} negative`}
      />
      <span
        className={`terminal-number-label terminal-number-label--meter-minus terminal-number-label--endpoint-${terminals.negative}`}
        data-terminal-id={`${terminals.negative}-endpoint`}
        title={`${label} negative`}
      >
        {terminals.negative}
      </span>

      <div
        className="ammeter__needle"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <img
          src={needleImg}
          alt="Needle"
          className="ammeter__needle-image"
        />
      </div>
    </article>
  )
}

export default Ammeter
