module.exports = {
  apps: [
    {
      name: "my-app",
      script: "index.js",
      autorestart: false,
      log_file: "combined.log",
      out_file: "out.log",
      error_file: "error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
