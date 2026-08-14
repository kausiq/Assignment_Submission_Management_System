const LABELS = {
  draft: 'Draft',
  published: 'Published',
  submitted: 'Submitted',
  late: 'Late',
  graded: 'Graded'
};

const StatusStamp = ({ status }) => {
  return <span className={`stamp stamp-${status}`}>{LABELS[status] || status}</span>;
};

export default StatusStamp;
