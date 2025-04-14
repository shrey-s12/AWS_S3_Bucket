const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(bodyParser.json());

require('./db');
const imageRoutes = require('./routes/imageRoutes');

app.use('/api/images', imageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});