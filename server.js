const config       = require('./config');
const morgan       = require('morgan');
const bodyParser   = require('body-parser');
const bluebird     = require('bluebird');
const mongoose     = require('mongoose');
const cluster      = require('cluster');
const numCPUs      = require('os').cpus().length;
const express      = require('express');
const app          = express();
const http         = require('http').Server(app);
const io           = require('socket.io')(http);
const PORT         = process.env.PORT || 3000;

global.NODE_ENV  = process.env.NODE_ENV || 'development';
global.Promise   = bluebird;

mongoose.Promise = bluebird;

const origin = NODE_ENV == 'production' ? 'https://kryptonite-011101.herokuapp.com' : '*';

app.use((req, res, next)=> {
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader('X-Powered-By', 'pickyDude')
  next()
})

if(NODE_ENV != 'test'){
  app.use(morgan('tiny'))
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

io.on('connection', (socket)=> require('./app/features/currency/router')(io, socket))

mongoose.connect(config[NODE_ENV].db)

const database = mongoose.connection;

database.on('error', console.error.bind(console, 'connection error:'))

database.once('open', ()=>{
  if(NODE_ENV == 'production'){
    if (cluster.isMaster) {
      require('./app/features/currency/scheduled_task').start();

      console.log(`Master ${process.pid} is running`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (deadWorker, code, signal) => {
        console.log(`worker ${deadWorker.process.pid} died.`);
        if(signal != 'SIGINT'){
          let worker = cluster.fork();
          console.log(`worker ${worker.process.pid} born.`);
        }
      })
    } else {
     http.listen(PORT, ()=> console.log(`Worker ${process.pid} started`))
   }
  }else{
    http.listen(PORT, ()=> console.log(`Express listen on ${PORT} port!`))
  }
})

module.exports = app;
