 const controller = require('../controllers/genre.controller');
let router = require('express').Router();
module.exports = app => {
    router.get('/', controller.getGenreList);
    router.get('/:id', controller.getGenreById);
    router.post('/', controller.postCreateGenre);
    router.patch('/:id', controller.patchUpdateGenre);
    router.put('/:id', controller.putUpdateGenre);
    router.delete('/:id', controller.deleteGenre);
    
    app.use('/genres', router);
};
