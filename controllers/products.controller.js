const { pool } = require("../config/database.js");

const saveProduct = async(req,res)=> {
    const {  product_name, product_description, product_price, product_category } = req.body;
    const images = req.files

    const query1 =  `
        INSERT INTO products(product_name, product_description, product_category, product_price) VALUES($1, $2, $3, $4) RETURNING id;
    `
    const query2 = `
            INSERT INTO product_images (product_id, image_name, image_type, image_size, image_data)
            VALUES ($1, $2, $3, $4, $5);
    `;

    let client;
    try {
        client = await pool.connect()
        await client.query("BEGIN")

        const response = await client.query(query1, [product_name, product_description, product_category, product_price])

        if(response.rowCount === 0){
            await client.query("ROLLBACK")
            return res.status(400).json({ msg: "No se pudo registrar el producto" })
        }

        const product_id = response.rows[0].id
        console.log('Producto insertado con ID:', product_id);

        const imageInsertPromises = images.map(image => {
            const imageValues = [
                product_id,
                image.originalname,
                image.mimetype,
                image.size,
                image.buffer
            ];

            return client.query(query2, imageValues);
        });

        const imageResponses = await Promise.all(imageInsertPromises);
        const totalInsertedImages = imageResponses.reduce((acc, imgRes) => acc + imgRes.rowCount, 0);
        if (totalInsertedImages !== images.length) {
            await client.query("ROLLBACK");
            return res.status(400).json({ msg: "No se pudieron registrar todas las imágenes" });
        }

        await client.query("COMMIT")
        return res.status(200).json({ msg: "Producto registrado con exito" })
    } catch (error) {
        console.log(error)
        await client.query("ROLLBACK")
        return res.status(500).json({ msg: "Error interno del servidor al registrar el producto" })
    }finally{
        if(client) client.release()
    }
}

const getProducts = async(req,res) => {
    const query = `
        SELECT p.*, pi.image_name, pi.image_type, pi.image_size, pi.image_data
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
    `;

    let client = await pool.connect();
    try {
        const response = await client.query(query);

        if (response.rowCount === 0) {
            return res.status(404).json({ msg: "No hay productos registrados" });
        }

        const products = response.rows;

        const productsWithImages = products.reduce((acc, product) => {
            if (!acc[product.id]) {
                acc[product.id] = { ...product, images: [] };
            }

            if (Buffer.isBuffer(product.image_data)) {
                console.log('Image size in Buffer:', product.image_data.length);
                const imageBase64 = product.image_data.toString("base64");
                console.log(imageBase64.length)
                acc[product.id].images.push({
                    image_name: product.image_name,
                    image_type: product.image_type,
                    image_size: product.image_size,
                    image_data:`data:${product.image_type};base64,${imageBase64}`,
                });
            } else {
                console.error(`Image data for product ${product.id} is not a valid Buffer.`);
            }

            return acc;
        }, {});
        const finalProducts = Object.values(productsWithImages);
        return res.status(200).json({ products: finalProducts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Error interno del servidor al encontrar los productos" });
    } finally {
        if (client) client.release();
    }
};

const updateProduct = async(req,res)=> {
    const {  product_name, product_description, product_price, product_category } = req.body;
    const images = req.files
    const { product_id } = req.params
console.log(product_id)
    if(!product_id || !product_name || !product_description || !product_price) 
        return res.status(400).json({ msg: "El servidor no recibió algunos datos necesarios" })
    
    if (!images || images.length === 0) {
        return res.status(400).json({ msg: "No se recibieron imágenes para el producto" })
    }

    const query1 =  `
        UPDATE products SET product_name = $1, product_description = $2, product_category = $3, product_price = $4 WHERE id = $5
    `
    const query2 = `
        DELETE FROM product_images WHERE product_id = $1
    `

    const query3 = `
            INSERT INTO product_images (product_id, image_name, image_type, image_size, image_data)
            VALUES ($1, $2, $3, $4, $5);
    `;

    let client;
    try {
        client = await pool.connect()
        await client.query("BEGIN")

        const response = await client.query(query1, [product_name, product_description, product_category, product_price, product_id])

        if(response.rowCount === 0){
            await client.query("ROLLBACK")
            return res.status(400).json({ msg: "No se pudo actualizar el producto" })
        }

        
        const imageDeleteResponse = await client.query(query2, [product_id])
        if(imageDeleteResponse.rowCount === 0){
            await client.query("ROLLBACK")
            return res.status(400).json({ msg: "No se pudieron eliminar las imágenes anteriores" })
        }

        const imageInsertPromises = images.map(image => {
            const imageValues = [
                product_id,
                image.originalname,
                image.mimetype,
                image.size,
                image.buffer
            ];

            return client.query(query3, imageValues);
        });

        const imageResponses = await Promise.all(imageInsertPromises);
        console.log(imageResponses)
        const totalInsertedImages = imageResponses.reduce((acc, imgRes) => acc + imgRes.rowCount, 0);
        if (totalInsertedImages !== images.length) {
            await client.query("ROLLBACK");
            return res.status(400).json({ msg: "No se pudieron registrar todas las imágenes" });
        }

        await client.query("COMMIT")
        return res.status(200).json({ msg: "Producto actualizado con éxito" })
    } catch (error) {
        console.log(error)
        await client.query("ROLLBACK")
        return res.status(500).json({ msg: "Error interno del servidor al registrar el producto" })
    }finally{
        if(client) client.release()
    }
}

module.exports = {
    saveProduct, getProducts, updateProduct
}