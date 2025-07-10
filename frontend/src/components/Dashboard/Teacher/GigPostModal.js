import React from 'react';
import GigPostForm from '../../GigPostForm';

const GigPostModal = ({ 
  isGigFormOpen, 
  setIsGigFormOpen, 
  handleGigCreated 
}) => {
  if (!isGigFormOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <GigPostForm 
        onGigCreated={(newGig) => {
          handleGigCreated(newGig);
          setIsGigFormOpen(false);
        }}
        onClose={() => setIsGigFormOpen(false)}
      />
    </div>
  );
};

export default GigPostModal;