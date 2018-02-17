const Currency  = require('../../models/currency');

module.exports = (io, socket)=>{
  socket.on('get currencies', ()=>{
    Currency.count((error, count)=>{
      if(error) return socket.emit('error', error);
      const maxPage = Math.ceil(count / 100);

      Currency.find({})
      .sort('rank')
      .limit(100)
      .exec((error, currencies)=>{
        if(error) return socket.emit('error', error)
        socket.emit('currencies received', { currencies: currencies, maxPage: maxPage })
      })
    })
  })

  socket.on('get keys', ()=>{
    Currency.find({}, 'rank symbol price_usd')
    .sort('rank')
    .exec((error, keys)=>{
      if(error) return socket.emit('error', error)
      socket.emit('keys received', keys)
    })
  })

  socket.on('load more', (page)=>{
    Currency.find({})
    .sort('rank')
    .skip(page * 100)
    .limit(100)
    .exec((error, currencies)=>{
      if(error) return socket.emit('error', error)
      socket.emit('currencies loaded', currencies)
    })
  })
}
