module.exports = {
    apps : [
        {
          name: "myapp",
          script: "./server.js",
          watch: true,
          env: {
            "NODE_ENV": "production",
          }
        }
    ]
  }