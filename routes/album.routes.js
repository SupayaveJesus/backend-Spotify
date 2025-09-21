const controller = require("../controllers/album.controller");
let router = require("express").Router();
module.exports = (app) => {
  router.get("/", controller.getAlbumList);
  router.get("/:id", controller.getAlbumById);
  router.post("/", controller.postCreateAlbum);
  router.patch("/:id", controller.patchUpdateAlbum);
  router.put("/:id", controller.putAlbumUpdate);
  router.delete("/:id", controller.deleteAlbum);

  app.use("/albums", router);
};
