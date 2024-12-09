const { pool } = require("../config/database.js");

const saveCategories = async(req,res) => {
    const { category_name } = req.body
    console.log(req.body)

    if(!category_name) return res.status(400).json({ msg: "Por favor ingrese el nombre de la categoría" })
        const query1 = `INSERT INTO categories(category_name) VALUES($1)`

        let client;
    try {
        client = await pool.connect()

        const result = await client.query(query1, [category_name])
        if(result.rowCount === 0) return res.status(400).json({ msg: "No se pudo registrar la categoría" })
        return res.status(200).json({ msg: "Categoría registrada con exito" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Error interno del servidor al registrar la categoría" })
    }finally{
        if(client) client.release()
    }
}

const getCategories = async(req,res) => {
    const query = `SELECT * FROM categories`
    let client;
    try {
        client = await pool.connect()
        const response = await client.query(query)
        if(response.rowCount === 0) return res.status(404).json({ msg: "No se pudo encontrar las categorías" })
        return res.status(200).json({ msg: "Categorías encontradas con exito", categories: response.rows })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Error interno del servidor al encontrar las categorías" })
    }finally{
        if(client) client.release()
    }
}

module.exports = { saveCategories, getCategories }