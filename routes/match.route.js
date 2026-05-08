
const express = require("express");
const router = express.Router();
const controller = require("../controllers/match.controller");

router.post("/create-match", controller.createMatch);
router.get("/matches", controller.getMatches);
router.post("/update-score/:id", controller.updateScore);
router.patch("/matches/:id/status", controller.updateStatus);
router.post("/choose-batting/:id", controller.chooseBatting);

module.exports = router;


