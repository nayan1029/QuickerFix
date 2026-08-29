import React from 'react';

const steps = [
  'REPORTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CITIZEN_VERIFICATION',
  'CLOSED'
];

const LifecycleStepper = ({ status }) => {
  if (status === 'REOPENED') {
    return <div className="lifecycle-step bg-danger text-white">REOPENED</div>;
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="d-flex flex-wrap justify-content-center mb-3">
      {steps.map((step, index) => {
        let className = 'step-pending';
        if (index < currentIndex) className = 'step-done';
        if (index === currentIndex) className = 'step-active';
        
        return (
          <span key={step} className={`lifecycle-step ${className}`}>
            {step.replace('_', ' ')}
          </span>
        );
      })}
    </div>
  );
};

export default LifecycleStepper;
