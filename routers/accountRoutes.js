const express = require('express');

const router = express.Router();

const database = require('../data/dbConfig.js');

//Route is based on host.com/api/accounts/
router.post('/', validateAccount(), (req, res) => {

  database("accounts").insert({ name:req.body.name, budget:req.body.budget })
    .then( data => {
      res.status(200).json(data);
    })
    .catch( err => { res.status(500).json({errorMessage:"There was an error creating an account."})})

});

router.get('/', (req, res) => {
  database("accounts")
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => { res.status(500).json({errorMessage:"There was an error retrieving the accounts."})})
});

router.get('/:id', validateAccountID(), (req, res) => {

    res.status(200).json(req.account);
});

router.delete('/:id', validateAccountID(), async (req, res, next) => {
  // console.log(req.account.id)
  try{
    await database("accounts").where("id", req.account.id).del();
    res.status(200).json({message:`removed record(s) from the database`}).end();
  } catch(err) {

    next(err);
  }

  
});

router.put('/:id', validateAccountID(), validateAccount(), (req, res) => {

  database("accounts").where({id:req.account.id}).update({name: req.body.name, budget: req.body.budget })
    .then(data => {
      console.log(data);
      if(data){
        res.status(200).json({message:`Before: id: ${req.account.id}, name: ${req.account.name}, budget: ${req.account.budget} | After: id: ${req.account.id}, name: ${req.body.name}, budget: ${req.account.budget}`})
      } else {
        res.status(501).json({errorMessage:"There was an error updating the account."});
      }
    })
    .catch(err => { res.status(500).json({errorMessage:"There was an internal error updating the account."})})

});

//middleware
function validateAccountID() {

  return (req, res, next) => {
    database("accounts").where("id", req.params.id)
      .then(data =>{
        if(data.length > 0){
          req.account = data[0];
          next();
        } else {
          res.status(400).json({errorMessage:"invalid account id"});
        }
      })
      .catch(err => res.status(500).json({errorMessage:"Error while searching for account ID"}))
  }
}

function validateAccount() {

  return (req, res, next) => {
    if(req.body){
      if(req.body.name){
        database("accounts").where({ name: req.body.name})
          .then(data => {
            console.log(data);
            if(data.length < 1){
              if(req.body.budget){

                next();
              } else {
                res.status(400).json({errorMessage:"missing required budget field"})
              }
            } else {
              res.status(400).json({errorMessage:"That name already exists!"})
            }
          })
          .catch(err => res.status(500).json({errorMessage:"failed to retrieve name from server."}))

      } else {
        res.status(400).json({errorMessage:"missing required name field"});
      }
    } else {
      res.status(400).json({errorMessage:"missing account data"});
    }
  }
}


module.exports = router;
