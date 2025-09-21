module.exports = app => {
    require('./artist.route')(app);
    require('./album.routes')(app);
    require('./genre.routes')(app);
    require('./song.route')(app);
};
    