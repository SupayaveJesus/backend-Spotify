const db = require("../models");
const { handleFileUpload } = require("../utils/fileHandler");
const artist = db.artist;
const fs = require("fs");

exports.getArtistList = async (req, res) => {
  const artists = await artist.findAll({
    include: ["albums", "genres"],
  });
  res.status(200).json(artists);
};

exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artistData = await artist.findByPk(id, {
      include: [
        {
          model: db.album,
          as: "albums",
          include: [
            {
              model: db.song,
              as: "songs",
            },
          ],
        },
        {
          model: db.genre,
          as: "genres",
          through: { attributes: [] },
        },
      ],
    });

    if (!artistData) {
      return res.status(404).send({ message: "Artista no encontrado" });
    }

    res.status(200).json(artistData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postCreateArtist = async (req, res) => {
  try {
    const imagePath = await handleFileUpload(req.files.image, "artist");
    const data = {
      name: req.body.name,
      image: imagePath,
    };
    const validation = validate({ body: data });

    if (validation.errors) {
      // Si hay errores de validación, eliminar el archivo subido
      fs.unlinkSync(imagePath);
      return res.status(400).json({ errors: validation.errors });
    }

    const newArtist = await artist.create(data);
    if (req.body.genreIds) {
      try {
        const genreIds = JSON.parse(req.body.genreIds);
        await newArtist.setGenres(genreIds);
      } catch (error) {
        return res.status(400).json({
          message: "Error al asignar géneros",
          error: error.message,
        });
      }
    }
    res.status(201).json(newArtist);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el artista",
      error: error.message,
    });
  }
};

exports.patchUpdateArtist = async (req, res) => {
  if (!req.body && !req.files) {
    return res.status(400).json({ message: "Cuerpo de la solicitud es requerido" });
  }

  const { id } = req.params;
  const artistDataUpdate = await artist.findByPk(id);
  if (!artistDataUpdate) {
    return res.status(404).send({ message: "Artista no encontrado" });
  }

  const { name } = req.body;
  
  // ✅ CAMBIO 1: Actualizar nombre si existe
  if (name) {
    artistDataUpdate.name = name;
  }

  // ✅ CAMBIO 2: Solo manejar imagen SI se envía
  if (req.files && req.files.image) {
    try {
      const imagePath = await handleFileUpload(req.files.image, "artist");
      // Eliminar imagen anterior si existe
      if (artistDataUpdate.image) {
        try {
          fs.unlinkSync(artistDataUpdate.image);
        } catch (error) {
          console.log("No se pudo eliminar imagen anterior:", error.message);
        }
      }
      artistDataUpdate.image = imagePath;
    } catch (error) {
      return res.status(500).json({ 
        message: "Error al subir la imagen", 
        error: error.message 
      });
    }
  }

  // ✅ CAMBIO 3: SIEMPRE guardar (con o sin imagen)
  try {
    const saved = await artistDataUpdate.save();
    
    // ✅ CAMBIO 4: Manejar géneros si existen
    if (req.body.genreIds) {
      try {
        const genresIds = JSON.parse(req.body.genreIds);
        await artistDataUpdate.setGenres(genresIds);
      } catch (error) {
        return res.status(400).json({
          message: "Error al actualizar los géneros",
          error: error.message,
        });
      }
    }

    res.json(saved);
  } catch (error) {
    return res.status(500).json({ 
      message: "Error al guardar el artista", 
      error: error.message 
    });
  }
};

exports.putArtistUpdate = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ errors: { name: "El nombre es requerido" } });
  }

  const artistDataUpdate = await artist.findByPk(id);
  if (!artistDataUpdate) {
    return res.status(404).send({ message: "Artista no encontrado" });
  }

  artistDataUpdate.name = name;

  // Manejar imagen si se envía
  if (req.files && req.files.image) {
    try {
      const imagePath = await handleFileUpload(req.files.image, "artist");
      if (artistDataUpdate.image) {
        try {
          fs.unlinkSync(artistDataUpdate.image);
        } catch (error) {
          console.log("No se pudo eliminar imagen anterior:", error.message);
        }
      }
      artistDataUpdate.image = imagePath;
    } catch (error) {
      return res.status(500).json({ 
        message: "Error al subir la imagen", 
        error: error.message 
      });
    }
  }

  const saved = await artistDataUpdate.save();
  
  if (req.body.genreIds) {
    try {
      const genresIds = JSON.parse(req.body.genreIds);
      await artistDataUpdate.setGenres(genresIds);
    } catch (error) {
      return res.status(400).json({
        message: "Error al actualizar los géneros",
        error: error.message,
      });
    }
  }

  res.json(saved);
};

exports.deleteArtist = async (req, res) => {
  const { id } = req.params;
  const artistData = await artist.findByPk(id);
  if (!artistData) {
    return res.status(404).send({ message: "Artista no encontrado" });
  }
  const deleted = await artistData.destroy();
  if (!deleted) {
    return res.status(400).json({ message: "No se pudo eliminar el artista" });
  }
  res.status(200).json({ message: "Artista eliminado correctamente" });
};

const validate = (req) => {
  if (!req.body) {
    return { errors: ["Cuerpo de la solicitud es requerido"] };
  }

  const { name, image } = req.body;
  const errors = {};

  if (!name) errors.name = "El nombre es requerido";
  if (!image) errors.image = "La imagen es requerida";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: null,
    artistData: {
      name,
      image,
    },
  };
};
