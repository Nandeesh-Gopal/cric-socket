const express = require("express");
// express is a function that return from a library
const router = express.Router();
// express is a function oject that has router method that return a router object
// router stores the methods like get,post,patch,delete
// router is like a object  
// console.log(typeof router);

console.log("this line executed when the router is imported into the server.js file")
const controller = require("../controllers/match");
//when this line gets executed then index.js will start executed

router.post("/create-match",controller.createMatch);

router.get("/matches",controller.getMatches);

router.post("/choose-batting/:id",controller.chooseBatting);

router.post("/update-score/:id",controller.updateScore);

router.patch("/matches/:id/status",controller.updateStatus);

module.exports = router;