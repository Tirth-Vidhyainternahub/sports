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
  wheretowatchPage,
  sportmatrixPage,
  audiencePage,
  adminPage,
  tournamentPage
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
router.get("/wheretowatch", wheretowatchPage);
router.get("/sportmatrix", sportmatrixPage); // Render the sport matrix page
router.get("/audience", audiencePage); // Render the audience page
router.get("/admin", adminPage); // Render the admin page
router.get("/tournament", tournamentPage); // Render the tournament page

module.exports = router;
