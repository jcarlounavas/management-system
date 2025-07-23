import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import './Spinner.css';


type Props = {
  isLoading?: boolean;
};

const Spinner = ({ isLoading = true }: Props) => {
  return (
    <div>
      <div id="loading-spinner">
        <ClipLoader
          color="#4A90E2"
          loading={isLoading}
          size={50}
          aria-label="Loading Spinner"
        />
      </div>
    </div>
  );
};

export default Spinner;