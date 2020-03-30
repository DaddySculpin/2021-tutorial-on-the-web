const prod = {
  baseUrl: '/2021-tutorial-on-the-web/',
  sourceResolution: {
    width: 2160,
    height: 1350
  }
};

const dev = {
  baseUrl: '/',
  sourceResolution: {
    width: 2160,
    height: 1350
  }
};

// realtime check if we're in prod or dev
const config = window.location.hostname.includes('github.io') ? prod : dev;

export default config;
