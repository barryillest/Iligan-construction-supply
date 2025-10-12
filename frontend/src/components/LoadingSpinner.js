import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.padding || '20px'};
`;

const Spinner = styled.div`
  width: ${props => props.size || '32px'};
  height: ${props => props.size || '32px'};
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = ({ size, padding }) => {
  return (
    <SpinnerContainer padding={padding}>
      <Spinner size={size} />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;