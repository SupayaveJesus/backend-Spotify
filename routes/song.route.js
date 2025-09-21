const controller = require("../controllers/song.controller");
let router = require("express").Router();
let validacionFile = require("../middleware/validation")

module.exports = (app) => {
  router.get("/", controller.getSongList);
  router.get("/:id", controller.getSongById);
  router.post("/", validacionFile("file"), controller.postCreateSong);
  router.patch("/:id", controller.patchUpdateSong);
  router.put("/:id", controller.putSongUpdate);
  router.delete("/:id", controller.deleteSong);

  app.use("/songs", router);
};
