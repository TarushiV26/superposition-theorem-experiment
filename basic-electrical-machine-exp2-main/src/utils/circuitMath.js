const toFiniteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const calculateReadings = ({
  voltage,
  current,
  voltageSourceOn,
  currentSourceOn,
  r1,
  r2,
  r3,
}) => {
  const V = voltageSourceOn ? Math.max(toFiniteNumber(voltage), 0) : 0
  const Is = currentSourceOn ? Math.max(toFiniteNumber(current), 0) : 0

  const R2 = Math.max(toFiniteNumber(r2), 0.0001)
  const R3 = Math.max(toFiniteNumber(r3), 0.0001)

  // Fixed reference directions:
  // I1: left to right through R1
  // I2: downward through R2
  // I3: left to right through R3
  //
  // Positive value means current is in the assumed reference direction.
  // Negative value means current is opposite to the assumed reference direction.

  const currentSourceOnly = {
    i1: Is,
    i2: Is * (R3 / (R2 + R3)),
    i3: Is * (R2 / (R2 + R3)),
  }

  const voltageSourceOnly = {
  i1: 0,
  i2: V / (R2 + R3),
  i3: -(V / (R2 + R3)),
}

  let i1 = 0
  let i2 = 0
  let i3 = 0

  if (currentSourceOn && !voltageSourceOn) {
    i1 = currentSourceOnly.i1
    i2 = currentSourceOnly.i2
    i3 = currentSourceOnly.i3
  } else if (voltageSourceOn && !currentSourceOn) {
    i1 = voltageSourceOnly.i1
    i2 = voltageSourceOnly.i2
    i3 = voltageSourceOnly.i3
  } else if (voltageSourceOn && currentSourceOn) {
    i1 = currentSourceOnly.i1 + voltageSourceOnly.i1
    i2 = currentSourceOnly.i2 + voltageSourceOnly.i2
    i3 = currentSourceOnly.i3 + voltageSourceOnly.i3
  }

  return {
    totalResistance: 0,
    i1,
    i2,
    i3,

    currentSourceOnly,
    voltageSourceOnly,
  }
}
/*const toFiniteNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

export const calculateReadings = ({ voltage, r1, r2, r3 }) => {
  const powerSupply = Math.max(toFiniteNumber(voltage), 0)
  const r1Value = Math.max(toFiniteNumber(r1), 0)
  const r2Value = Math.max(toFiniteNumber(r2), 0)
  const r3Value = Math.max(toFiniteNumber(r3), 0)
  const branchResistance = r2Value + r3Value
  const parallelResistance = branchResistance > 0
    ? (r2Value * r3Value) / branchResistance
    : 0
  const totalResistance = r1Value + parallelResistance
  const i1 = totalResistance > 0 ? powerSupply / totalResistance : 0
  const i2 = branchResistance > 0 ? (r3Value / branchResistance) * i1 : 0
  const i3 = branchResistance > 0 ? (r2Value / branchResistance) * i1 : 0

  return {
    totalResistance,
    i1,
    i2,
    i3,
  }
}*/
