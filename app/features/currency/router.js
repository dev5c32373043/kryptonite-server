const priceRouter = require('express').Router();
const Currency    = require('../../models/currency');

priceRouter.get('/all', (req, res)=>{
  Currency.find({}, (error, currencies)=>{
    if(error) return res.status(500).send(error)
    res.json({ currencies: currencies })
  })
})

module.exports = priceRouter;
