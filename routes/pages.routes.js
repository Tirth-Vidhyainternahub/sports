const express = require("express");
const router = express.Router();
const {
  Homepage,
  LoginPage,
  CityPage,
  CountryPage,
  venuePage,
  sportPage,
  ottPage,
  telecastPage,
  playerPage,
  teamPage,
} = require("../controllers/pages.controller");

router.get("/", Homepage); // Render the homepage
router.get("/login", LoginPage);
router.get("/city", CityPage);
router.get("/country", CountryPage);
router.get("/venue", venuePage);
router.get("/sport", sportPage);
router.get("/ott", ottPage);
router.get("/telecast", telecastPage);
router.get("/player", playerPage);
router.get("/team", teamPage);

module.exports = router;
