const db = require("../models");
const { handleFileUpload } = require("../utils/fileHandler");
const genre = db.genre;
const fs = require('fs');

exports.getGenreList = async (req, res) => {
  try {
    const genres = await genre.findAll();
    return res.status(200).json(genres);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener la lista de géneros" });
  }
};

exports.getGenreById = async (req, res) => {
  try {
    const { id } = req.params;
    const genreData = await genre.findByPk(id, {
      include: [
        {
          model: db.artist,
          as: "artists",
          through: {
            attributes: [], 
          },
        },
      ],
    });
    if (!genreData) {
      return res.status(404).json({ message: "Género no encontrado" });
    }
    return res.status(200).json(genreData); // ← FALTABA ESTE RETURN
  } catch (error) {
    return res.status(500).json({ 
        message: 'Error al obtener genero',
        error: error.message 
    });
  }
};

exports.postCreateGenre = async (req, res) => {
    try {
        const validation = validateGenre(req); // ← CAMBIÉ EL NOMBRE
        if(validation.errors){
            return res.status(400).json({ errors: validation.errors });
        }

        const imagePath = await handleFileUpload(req.files.image, "genre");
        const data = {
            name: req.body.name,
            image: imagePath,
        };

        const newGenre = await genre.create(data);
        if (!newGenre) {
            fs.unlinkSync(imagePath); // ← LIMPIAR ARCHIVO SI FALLA
            return res.status(400).json({ message: "No se pudo crear el género" });
        }
        res.status(201).json(newGenre);

    } catch (error) {
        return res.status(500).json({
            message: 'Error al crear género',
            error: error.message
        });
    }
};

exports.patchUpdateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const genreDataUpdate = await genre.findByPk(id);
        if (!genreDataUpdate) {
            return res.status(404).json({ message: "Género no encontrado" });
        }

        const { name, image } = req.body;
        if (name) {
            genreDataUpdate.name = name;
        }
        if (image) {
            genreDataUpdate.image = image;
        }

        const saved = await genreDataUpdate.save();
        if (!saved) {
            return res.status(400).json({ message: "No se pudo actualizar el género" });
        }
        res.status(200).json(saved);
        
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar género',
            error: error.message
        });
    }
};

exports.putUpdateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const genreDataUpdate = await genre.findByPk(id);
        
        if (!genreDataUpdate) {
            return res.status(404).json({ message: "Género no encontrado" });
        }

        // Manejar imagen: si viene archivo nuevo, subirlo; si no, mantener actual
        let imagePath = genreDataUpdate.image; // ← Mantener imagen actual por defecto
        
        if (req.files && req.files.image) {
            // Si viene archivo nuevo, subirlo
            imagePath = await handleFileUpload(req.files.image, 'genre');
        }

        // Actualizar datos
        genreDataUpdate.name = req.body.name;
        genreDataUpdate.image = imagePath; // ← Nunca será null

        const saved = await genreDataUpdate.save();
        res.status(200).json(saved);

    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar género',
            error: error.message
        });
    }
};

exports.deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const genreData = await genre.findByPk(id);
        if (!genreData) {
            return res.status(404).json({ message: "Género no encontrado" });
        }
        const deleted = await genreData.destroy(); // ← CAMBIÉ NOMBRE DE VARIABLE
        if (!deleted) { // ← AGREGAR VALIDACIÓN
            return res.status(400).json({ message: "No se pudo eliminar el género" });
        }
        res.status(200).json({ message: "Género eliminado correctamente" });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar género',
            error: error.message
        });
    }
};

// ← VALIDACIÓN CORREGIDA CON IMAGEN
const validateGenre = (req) => {
  const errors = {};

  if (!req.body.name) errors.name = "El nombre es requerido";
  if (!req.files || !req.files.image) errors.image = "La imagen es requerida";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: null,
    genreData: {
      name: req.body.name,
      image: req.files.image
    },
  };
};