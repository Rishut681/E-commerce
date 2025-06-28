import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    background-color: #f0f2f5; /* Light background for the page */
    color: #333;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden; /* Prevent horizontal scroll from animations */
  }

  button {
    font-family: 'Arial', sans-serif;
    cursor: pointer;
  }
`;

export default GlobalStyles;