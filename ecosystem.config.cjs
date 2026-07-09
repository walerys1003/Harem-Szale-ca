module.exports = {
  apps: [
    {
      name: 'harem-szalenca',
      script: 'npx',
      args: 'serve . --listen 3000 --no-clipboard',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
