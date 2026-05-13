const express = require("express");

const router = express.Router();

const controller = require("../controllers/match");

router.post(
  "/create-match",
  controller.createMatch
);

router.get(
  "/matches",
  controller.getMatches
);

router.post(
  "/choose-batting/:id",
  controller.chooseBatting
);

router.post(
  "/update-score/:id",
  controller.updateScore
);

router.patch(
  "/matches/:id/status",
  controller.updateStatus
);

module.exports = router;