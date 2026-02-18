const target = process.env.DEVCONTAINER
  ? 'http://host.docker.internal:3000'
  : 'http://localhost:3000';

export default {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
};
