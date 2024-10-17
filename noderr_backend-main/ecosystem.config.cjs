module.exports = {
  apps: [
    {
      name: 'API-SERVER',  // Name of your app
      script: 'npm',
      args: 'start',        // This tells PM2 to run 'npm start'
      env: {
        NODE_ENV: 'production',  // Set to 'production' or 'development'
      },
    },
  ],
};
