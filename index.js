const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const {checkConnection} = require('./config/database.js');

const userRoutes = require('./routes/user.routes.js');
const categoriesRoutes = require("./routes/categories.routes.js")

app.use(cors());
app.use(express.json());

(async()=>{
    await checkConnection()
})()

app.use('/api/users', userRoutes);
app.use("/api/categories", categoriesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
