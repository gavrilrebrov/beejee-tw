module.exports = {
  apps: [
    {
      name: 'beejee-tw',
      script: './server/index.js',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
}