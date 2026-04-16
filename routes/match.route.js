const express = require("express");
const router = express.Router();
const controller = require("../controllers/match.controller");

router.post("/create-match", controller.createMatch);
router.get("/matches", controller.getMatches);
router.patch("/matches/:id/score", controller.updateScore);
router.patch("/matches/:id/status", controller.updateStatus);

module.exports = router;