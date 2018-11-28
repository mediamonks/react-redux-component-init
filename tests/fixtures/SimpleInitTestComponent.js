import React from 'react';

// eslint-disable-next-line react/prop-types
const SimpleInitTestComponent = ({ isInitializing, testParam }) => (
  <div>
    <h1>This is a test component</h1>
    {
      isInitializing && (
        <span>
          initializing...
        </span>
      )
    }
    {
      testParam && (
        <span>
          The test param is: {testParam}
        </span>
      )
    }
  </div>
);

export default SimpleInitTestComponent;
