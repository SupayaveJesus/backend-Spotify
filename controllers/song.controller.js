const db = require('../models');
const { handleFileUpload } = require('../utils/fileHandler');
const song = db.song;
const fs = require('fs');

exports.getSongList = async (req, res) => {
    const songs = await song.findAll({
        include: ['album']
    });
    res.status(200).json(songs);
};

exports.getSongById = async (req, res) => {
    const { id } = req.params;
    const songData = await song.findByPk(id, {
        include: ['album']
    });
    if (!songData) {
        return res.status(404).send({ message: "Canción no encontrada" });
    }
    res.send(songData);
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

        const newSong = await song.create(data);
        if (!newSong) {
            // Si falla, eliminar el archivo subido
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: "No se pudo crear la canción" });
        }

        res.status(201).json(newSong);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.patchUpdateSong = async (req, res) => {};
exports.deleteSong = async (req, res) => {};


const validateSong = (req) => {
    if(!req.body) {
        return { errors: ["Cuerpo de la solicitud es requerido"] };
    }
    const { name, file} = req.body;
    const errors = [];
    if (!name || name.trim() === '') {
        errors.push("El nombre de la canción es requerido");
    }
    if (!file) {
        errors.push("El archivo de la canción es requerido");
    }

    if(Object.keys(errors).length > 0) {
        return { errors };
    }

    return {
        errors: null,
        data: {
            name,
            albumId
        }
    };
};