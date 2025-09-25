const validacionFile = (type) => (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "No se han subido archivos" });
    }

    const file = type === 'image' ? req.files.image : req.files.file;
    if (!file) {
        return res.status(400).json({ message: `El archivo ${type} es requerido` });
    }

    if (type === 'image') {
        if (!file.mimetype.startsWith('image/')) {  
            return res.status(400).json({ message: "El archivo debe ser una imagen" });
        }
    } else {
        if (!file.mimetype.startsWith('audio')) {
            return res.status(400).json({ message: "El archivo debe ser un audio" });
        }
    }

    next();
};

module.exports = validacionFile;
