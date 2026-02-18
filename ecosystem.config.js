module.exports = {
  apps: [
    {
      name: "juniper",
      cwd: "/var/www/juniper-proposal",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      watch: false,
    },
  ],
};
