import React from 'react';

const StatusBadge = ({ status }) => {
  let color = 'secondary';
  let text = 'text-white';
  switch (status) {
    case 'REPORTED':
      color = 'secondary';
      break;
    case 'UNDER_REVIEW':
      color = 'warning';
      text = 'text-dark';
      break;
    case 'VERIFIED':
      color = 'primary';
      break;
    case 'ASSIGNED':
      color = 'info';
      text = 'text-dark';
      break;
    case 'IN_PROGRESS':
      color = 'primary';
      break;
    case 'RESOLVED':
      color = 'warning';
      text = 'text-dark';
      break;
    case 'CITIZEN_VERIFICATION':
      color = 'warning';
      text = 'text-dark';
      break;
    case 'CLOSED':
      color = 'success';
      break;
    case 'REOPENED':
      color = 'danger';
      break;
    default:
      break;
  }

  return (
    <span className={`badge bg-${color} ${text} badge-status`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
