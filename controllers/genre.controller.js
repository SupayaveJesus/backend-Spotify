const db = require("../models");
const { handleFileUpload } = require("../utils/fileHandler");
const genre = db.genre;

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
  } catch (error) {
    return res.status(500).json({ 
        message: 'Error al obtener genero',
        error:error.message });
  }
};

exports.postCreateGenre = async (req, res) => {
    try {
        const errors = validation(req);
        if(errors){
            return res.status(400).json({ errors: errors.errors });
        }

        const imagePath = await handleFileUpload(req.files.image, "genre");
        const data = {
            name: req.body.name,
            image: imagePath,
        };

        const newGenre = await genre.create(data);
        if (!newGenre) {
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
        const {id} = req.params;
        const genreDataUpdate = await genre.findByPk(id);
        if(!genreDataUpdate){
            return res.status(404).json({ message: "Género no encontrado" });
        }
        
        genreDataUpdate.name = req.body.name;
        genreDataUpdate.image = req.body.image;

        const saved = await genreDataUpdate.save();
        if(!saved){
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

exports.deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const genreData = await genre.findByPk(id);
        if (!genreData) {
            return res.status(404).json({ message: "Género no encontrado" });
        }
        const delet = await genreData.destroy();
        res.status(200).json({ message: "Género eliminado correctamente" });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar género',
            error: error.message
        });
    }
};

const validation = (req) => {
  const errors = [];

  if (!req.body.name) errors.name = "El nombre es requerido";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: null,
    genreData: {
      name: req.body.name,
    },
  };
};
