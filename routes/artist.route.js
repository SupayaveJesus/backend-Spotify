const controller = require('../controllers/artist.controller');
let router = require('express').Router();
module.exports = app => {
    router.get('/', controller.getArtistList);
    router.get('/:id', controller.getArtistById);
    router.post('/', controller.postCreateArtist);
    router.patch('/:id', controller.patchUpdateArtist);
    router.put('/:id', controller.putArtistUpdate);
    router.delete('/:id', controller.deleteArtist);

    app.use('/artists', router);
};
