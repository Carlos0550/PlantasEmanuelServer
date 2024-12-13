const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const {checkConnection} = require('./config/database.js');

const adminsRoutes = require('./routes/admins.routes.js');
const categoriesRoutes = require("./routes/categories.routes.js")
const productsRoutes = require("./routes/products.routes.js")

app.use(cors());
app.use(express.json());

(async()=>{
    await checkConnection()
})()

app.use('/api/admins', adminsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
