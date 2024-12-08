const { pool } = require("../config/database.js");
const { encriptar } = require("../utils/EncryptData.js");
const { hashPassword, verifyHashPassword } = require("../utils/HashPsw.js");

const registerUser = async (req, res) => {
    const { user_login_name, user_fullname, user_email, user_password } = req.body;
    if (!user_fullname || !user_email || !user_password) return res.status(400).json({ message: "Algunos datos obligatorios no fueron proporcionados" });
    const query1 = `
        INSERT INTO users(user_email, user_fullname, user_login_name, user_psw) VALUES($1, $2, $3, $4);
    `

    let client;
    try {
        const hashedPsw = await hashPassword(user_password)

        client = await pool.connect()
        const response = await client.query(query1, [user_email, user_fullname, user_login_name, hashedPsw])
        if (response.rowCount === 0) return res.status(400).json({ msg: "No se pudo registrar el usuario" })
        return res.status(200).json({ msg: "Usuario registrado con exito" })
    } catch (error) {
        console.log(error)
        if (error.code === "23505") return res.status(400).json({ msg: "El correo o usuario ya se encuentra registrado" })
        return res.status(500).json({ msg: "Error interno del servidor al registrar el usuario" })
    } finally {
        if (client) client.release()
    }
};

const loginUser = async (req, res) => {
    const { user_login_name, user_email, user_password } = req.body;
    if (!user_password && (!user_login_name || !user_email)) return res.status(400).json({ message: "Algunos datos obligatorios no fueron proporcionados" });

    const query1 = `
        SELECT * FROM users WHERE user_email = $1;
    `
    const query2 = `
        SELECT * FROM users WHERE user_login_name = $1;
    `

    let client;
    try {
        client = await pool.connect()
        if (user_login_name) {

            const response = await client.query(query2, [user_login_name])
            if (response.rowCount === 0) return res.status(400).json({ msg: "No se pudo encontrar el usuario" })
            const user = response.rows[0]
            const isPswValid = await verifyHashPassword(user_password, user.user_psw)
            if (!isPswValid) return res.status(400).json({ msg: "Contraseña incorrecta" })

            if (process.env.admin_user_login_name === user_login_name) {
                return res.status(200).json({ msg: "Usuario logueado con exito", user: { ...user, admin: true } })
            } else {
                return res.status(200).json({ msg: "Usuario logueado con exito", user: user })
            }
        } else {
            const response = await client.query(query1, [user_email])
            if (response.rowCount === 0) return res.status(400).json({ msg: "No se pudo encontrar el usuario" })
            const user = response.rows[0]
            const isṔswValid = await verifyHashPassword(user_password, user.user_psw)
            if (!isṔswValid) return res.status(400).json({ msg: "Contraseña incorrecta" })

            if (process.env.admin_email === user_email) {
                return res.status(200).json({ msg: "Usuario logueado con exito", user: { ...user, admin: true } })
            } else {
                return res.status(200).json({ msg: "Usuario logueado con exito", user: user })
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Error interno del servidor al loguear el usuario" })
    } finally {
        if (client) client.release()
    }
}

module.exports = { registerUser, loginUser }