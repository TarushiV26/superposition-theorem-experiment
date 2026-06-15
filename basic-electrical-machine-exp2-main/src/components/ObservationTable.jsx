import SectionCard from './SectionCard.jsx'

const CASE_ROWS = [
  {
    id: 1,
    key: 'currentSourceOnly',
    label: 'Current Source Only',
  },
  {
    id: 2,
    key: 'voltageSourceOnly',
    label: 'Voltage Source Only',
  },
  {
    id: 3,
    key: 'bothSources',
    label: 'Both Sources Active',
  },
]

const formatCurrent = (value) => (
  Number.isFinite(Number(value)) ? Number(value).toFixed(3) : ''
)

const ObservationTable = ({ observations = {} }) => (
  <SectionCard className="observation-card-compact" icon="table" id="observation-table-panel" title="OBSERVATION TABLE">
    <div className="observation-table-wrap">
      <table className="observation-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Case</th>
            <th>I<sub>1</sub>(A)</th>
            <th>I<sub>2</sub>(A)</th>
            <th>I<sub>3</sub>(A)</th>
          </tr>
        </thead>

        <tbody>
          {CASE_ROWS.map((caseRow) => {
            const row = observations?.[caseRow.key]

            return (
              <tr key={caseRow.key}>
                <td>{caseRow.id}</td>
                <td>{caseRow.label}</td>
                <td>{formatCurrent(row?.i1)}</td>
                <td>{formatCurrent(row?.i2)}</td>
                <td>{formatCurrent(row?.i3)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </SectionCard>
)

export default ObservationTable