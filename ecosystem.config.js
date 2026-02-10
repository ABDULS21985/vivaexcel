module.exports = {
  apps: [
    {
      name: 'viva-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
    },
    {
      name: 'viva-frontend',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'run dev -- -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
    {
      name: 'viva-dashboard',
      cwd: './apps/dashboard',
      script: 'npm',
      args: 'run start -- -p 3002',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
