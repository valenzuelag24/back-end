import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'

dotenv.config()

function validarToken(req,res,next) {
    const token = req.cookies.token;
    if (!token) {
        res.status(404).json({message:'Token no Existe'})
    }
    try {
        const verificar = jwt.verify(token, process.env.SECRET);
        //res.status(200).json({ok:'Token Valido', message: verificar});
        next();
    } catch (error) {
        res.status(401).json({message:'Token Dañado'})
    }
}

export default validarToken;