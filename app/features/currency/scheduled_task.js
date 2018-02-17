const io       = require('socket.io');
const cron     = require('node-cron');
const request  = require('request');
const Currency = require('../../models/currency');

const task = cron.schedule('*/5 * * * *', ()=>{
  request('https://api.coinmarketcap.com/v1/ticker?limit=0',
  { json: true },
  (error, response, body)=>{
    if(error) return console.error(error);
    Currency.count({})
    .exec((error, count)=>{
      if(error) return console.error(error);
      if(count){
        const currencies = Currency.find({}).cursor();
        let updatedCurrecies = [];
        currencies.on('data', (currency)=>{
          const receivedCurrency = body.filter((item)=> currency.id == item.id)[0];
          if(receivedCurrency){
            if(currency.last_updated < Number(receivedCurrency.last_updated)){
              currency.set(receivedCurrency)
              currency.save((error, result)=>{
                if(error) return console.error(error)
                updatedCurrecies.push(currency)
              })
            }
          }
        })
        currencies.on('close', ()=>{
          if(updatedCurrecies.length){
            io.emit('currencies updated', updatedCurrecies)
          }
        })
      }else{
        Currency.create(body, (error, currencies)=>{
          if(error) return console.error(error);
        })
      }
    })
  })
})

module.exports = task;
