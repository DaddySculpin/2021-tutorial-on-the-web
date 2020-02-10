const dev = {
  baseUrl: '/'
};

const prod = {
  baseUrl: '/2021-tutorial-on-the-web/'
};

const config = window.location.hostname.includes('github.io') ? prod : dev;

export default config;
