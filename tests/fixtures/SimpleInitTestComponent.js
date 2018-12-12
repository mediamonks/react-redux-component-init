import React from 'react';

// eslint-disable-next-line react/prop-types
const SimpleInitTestComponent = ({ isInitializing, testInitProp, testProp }) => (
  <div>
    <h1>This is a test component</h1>
    {isInitializing && <span>initializing...</span>}
    {testInitProp && <span>The test param is: {testInitProp}</span>}
    {testProp && <span>The test prop is: {testProp}</span>}
  </div>
);

export default SimpleInitTestComponent;
