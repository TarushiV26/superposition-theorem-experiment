import { PdfIcon } from './Icons.jsx'

const ReportControls = ({
  onGenerateReport,
  readingCount,
  reportGenerated,
}) => {
  const readingsReady = readingCount >= 3

  const buttonTitle = reportGenerated
    ? 'Report generated. Click to regenerate the report.'
    : readingsReady
      ? 'Generate the final Superposition Theorem report.'
      : 'Complete all three cases before generating the report.'

  return (
    <button
      id="generate-report-button"
      type="button"
      className="report-button"
      disabled={!readingsReady}
      title={buttonTitle}
      aria-label="Generate Report"
      data-report-generated={reportGenerated ? 'true' : 'false'}
      onClick={onGenerateReport}
    >
      <PdfIcon />
      <span>Generate Report</span>
    </button>
  )
}

export default ReportControls