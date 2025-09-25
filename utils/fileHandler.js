const path = require('path');
    
const handleFileUpload = async (file, type) => {
    try {
        const fileName = `${type}-${Date.now()}${path.extname(file.name)}`;
        const uploadPath = `uploads/${type}s/${fileName}`;

        await file.mv(uploadPath);
        return uploadPath;
    } catch (error) {
        throw new Error(`Error al guardar el archivo: ${error.message}`);
    }
};

module.exports = {
    handleFileUpload
};