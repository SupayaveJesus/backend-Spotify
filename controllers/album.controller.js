const db = require("../models");
const { handleFileUpload } = require("../utils/fileHandler");
const album = db.album;
const fs = require("fs");

exports.getAlbumList = async (req, res) => {
  try {
    const albums = await album.findAll({
      include: ["artist"],
    });

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlbumById = async (req, res) => {
  const { id } = req.params;
  const albumData = await album.findByPk(id, {
    include: ["artist", "songs"],
  });
  if (!albumData) {
    return res.status(404).send({ message: "Álbum no encontrado" });
  }
  res.send(albumData);
};

exports.postCreateAlbum = async (req, res) => {
  try {
    const path = await handleFileUpload(req.files.image, "album");
    const data = {
      name: req.body.name,
      artistId: req.body.artistId,
      image: path,
    };

    const newAlbum = await album.create(data);
    if (!newAlbum) {
      fs.unlinkSync(path);
      return res.status(400).json({ message: "No se pudo crear el álbum" });
    }

    res.status(201).json(newAlbum);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.patchUpdateAlbum = async (req, res) => {
  const { id } = req.params;
  const albumDataUpdate = await album.findByPk(id);

  if (!albumDataUpdate) {
    return res.status(404).send({ message: "Álbum no encontrado" });
  }

  const { name, artistId, image } = req.body;

  if (name) albumDataUpdate.name = name;
  if (artistId) albumDataUpdate.artistId = artistId;
  if (image) albumDataUpdate.image = image;

  const saved = await albumDataUpdate.save();
  if (!saved) {
    return res.status(400).json({ message: "No se pudo actualizar el álbum" });
  }
  res.json(saved);
};

exports.putAlbumUpdate = async (req, res) => {
  try {
    const validation = validateAlbum(req);
    if (validation.errors) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const { id } = req.params;
    const body = validation.data; 

    const albumDataUpdate = await album.findByPk(id);
    if (!albumDataUpdate) {
      return res.status(404).send({ message: "Álbum no encontrado" });
    }

    // Actualizar todos los campos (PUT requiere todos los datos)
    albumDataUpdate.name = body.name;
    albumDataUpdate.artistId = body.artistId;
    albumDataUpdate.image = body.image;

    const saved = await albumDataUpdate.save();
    if (!saved) {
      return res.status(400).json({ message: "No se pudo actualizar el álbum" });
    }
    
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  const { id } = req.params;

  const albumData = await album.findByPk(id);
  if (!albumData) {
    return res.status(404).send({ message: "Álbum no encontrado" });
  }

  const deleted = await albumData.destroy();
  if (!deleted) {
    return res.status(400).json({ message: "No se pudo eliminar el álbum" });
  }
  res.json({ message: "Álbum eliminado con éxito" });
};

const validateAlbum = (req) => {
  const { name, artistId, image } = req.body;
  const errors = {};

  if (!name) errors.name = "El nombre es obligatorio";
  if (!artistId) errors.artistId = "El  artista es obligatorio";
  if (!image) errors.image = "La imagen es obligatoria";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: null,
    data: {
      name,
      artistId,
      image,
    },
  };
};
