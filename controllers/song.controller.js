const db = require('../models');
const { handleFileUpload } = require('../utils/fileHandler');
const song = db.song;
const fs = require('fs');

exports.getSongList = async (req, res) => {
    try {
        const songs = await song.findAll({
            include: ['album']
        });
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const songData = await song.findByPk(id, {
            include: ['album']
        });
        if (!songData) {
            return res.status(404).json({ message: "Canción no encontrada" });
        }
        res.status(200).json(songData); // ← Cambiar .send() por .json()
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.postCreateSong = async (req, res) => {
    try {
        if(!req.files || !req.files.file) {
            return res.status(400).json({ message: "Archivo de canción es requerido" });
        }
        
        const filePath = await handleFileUpload(req.files.file, 'song');
        const data = {
            name: req.body.name,
            file: filePath,
            albumId: req.body.albumId,
        };

        const validation = validateSong({body: data});
        if (validation.errors) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ errors: validation.errors });
        }

        const newSong = await song.create(data);
        if (!newSong) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: "No se pudo crear la canción" });
        }

        res.status(201).json(newSong);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.patchUpdateSong = async (req, res) => {
    try { // ← AGREGAR try-catch
        if(!req.body) {
            return res.status(400).json({ message: "Cuerpo de la solicitud es requerido" });
        }

        const { id } = req.params;
        const songDataUpdate = await song.findByPk(id);

        if (!songDataUpdate) {
            return res.status(404).json({ message: "Canción no encontrada" }); // ← .json()
        }

        const { name, file, albumId } = req.body;

        if(name) songDataUpdate.name = name;
        if(file) songDataUpdate.file = file;
        if(albumId) songDataUpdate.albumId = albumId;

        const savedSong = await songDataUpdate.save();
        if(!savedSong) {
            return res.status(400).json({ message: "No se pudo actualizar la canción" });
        }
        res.status(200).json(savedSong);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.putSongUpdate = async (req, res) => {
    try { // ← AGREGAR try-catch
        const validation = validateSong(req);
        if (validation.errors) {
            return res.status(400).json({ errors: validation.errors });
        }

        const { id } = req.params;
        const body = validation.data;

        const songDataUpdate = await song.findByPk(id);
        if (!songDataUpdate) {
            return res.status(404).json({ message: "Canción no encontrada" }); // ← .json()
        }

        songDataUpdate.name = body.name;
        songDataUpdate.file = body.file;
        songDataUpdate.albumId = body.albumId; // ← AGREGAR albumId

        const saved = await songDataUpdate.save();
        if (!saved) {
            return res.status(400).json({ message: "No se pudo actualizar la canción" });
        }
        res.status(200).json(saved); // ← Agregar status
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSong = async (req, res) => {
    try { // ← AGREGAR try-catch
        const { id } = req.params;
        const songData = await song.findByPk(id);
        if (!songData) {
            return res.status(404).json({ message: "Canción no encontrada" }); // ← .json()
        }

        const deleted = await songData.destroy();
        if (!deleted) {
            return res.status(400).json({ message: "No se pudo eliminar la canción" });
        }
        res.status(200).json({ message: "Canción eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const validateSong = (req) => {
    if(!req.body) {
        return { errors: ["Cuerpo de la solicitud es requerido"] };
    }

    const { name, file, albumId } = req.body;
    const errors = [];

    if (!name || name.trim() === '') {
        errors.push("El nombre de la canción es requerido");
    }
    if (!file) {
        errors.push("El archivo de la canción es requerido");
    }
    if (!albumId) {
        errors.push("El ID del álbum es requerido");
    }

    if(errors.length > 0) { // ← Cambiar Object.keys por .length
        return { errors };
    }

    return {
        errors: null,
        data: {
            name,
            file,
            albumId
        }
    };
};