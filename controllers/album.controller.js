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
    include: [
      { model: db.artist, as: "artist" },
      { model: db.song, as: "songs" },
    ],
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

  const { name, artistId } = req.body;

  // ✅ Actualizar campos si existen
  if (name) albumDataUpdate.name = name;
  if (artistId) albumDataUpdate.artistId = artistId;

  // ✅ Manejar imagen SI se envía archivo
  if (req.files && req.files.image) {
    try {
      const imagePath = await handleFileUpload(req.files.image, "album");
      // Eliminar imagen anterior si existe
      if (albumDataUpdate.image) {
        try {
          fs.unlinkSync(albumDataUpdate.image);
        } catch (error) {
          console.log("No se pudo eliminar imagen anterior:", error.message);
        }
      }
      albumDataUpdate.image = imagePath;
    } catch (error) {
      return res.status(500).json({ 
        message: "Error al subir la imagen", 
        error: error.message 
      });
    }
  }

  try {
    const saved = await albumDataUpdate.save();
    res.json(saved);
  } catch (error) {
    return res.status(500).json({ 
      message: "Error al guardar el álbum", 
      error: error.message 
    });
  }
};

exports.putAlbumUpdate = async (req, res) => {
  const { id } = req.params;
  const { name, artistId } = req.body;
  
  // ✅ Solo validar campos esenciales
  if (!name) {
    return res.status(400).json({ errors: { name: "El nombre es requerido" } });
  }
  if (!artistId) {
    return res.status(400).json({ errors: { artistId: "El artista es requerido" } });
  }

  const albumDataUpdate = await album.findByPk(id);
  if (!albumDataUpdate) {
    return res.status(404).send({ message: "Álbum no encontrado" });
  }

  albumDataUpdate.name = name;
  albumDataUpdate.artistId = artistId;

  // ✅ Imagen opcional en PUT también
  if (req.files && req.files.image) {
    try {
      const imagePath = await handleFileUpload(req.files.image, "album");
      if (albumDataUpdate.image) {
        try {
          fs.unlinkSync(albumDataUpdate.image);
        } catch (error) {
          console.log("No se pudo eliminar imagen anterior:", error.message);
        }
      }
      albumDataUpdate.image = imagePath;
    } catch (error) {
      return res.status(500).json({ 
        message: "Error al subir la imagen", 
        error: error.message 
      });
    }
  }

  try {
    const saved = await albumDataUpdate.save();
    res.json(saved);
  } catch (error) {
    return res.status(500).json({ 
      message: "Error al actualizar el álbum", 
      error: error.message 
    });
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
