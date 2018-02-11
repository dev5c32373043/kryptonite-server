module.exports = {
  production: {
    db: process.env.DB_URL
  },
  development: {
    db: "mongodb://localhost:27017/kryptonite"
  },
  test: {
    db: "mongodb://localhost:27017/kryptonite_test"
  }
}
