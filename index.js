const express = require ('express');
const bodyParser = require ('body-parser');
const fileUpload = require ('express-fileupload');
const cors = require ('cors');

const app = express ();
const port = 3000;
const db = require ('./models/');

//cors
app.use(cors({
    origin: ['http://localhost:5173','http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173'],
    optionsSuccessStatus: 200
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
}));

// serve static files
app.use('/uploads', express.static('uploads'));

db.sequelize.sync({
    // force: true // drop tables and recreate
}).then(() => {
    console.log("db resync");
});

require("./routes")(app);
app.listen(port, () => {
    console.log(`Spotify app listening on port ${port}`);
});


