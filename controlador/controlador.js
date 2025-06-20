import { json, Router } from "express";
//import modelo from "../modelo/modelo.js";
import conexion from "../modelo/conexion.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import validarToken from "./verificarToken.js";

//const data = modelo;
dotenv.config()
const app = Router();
const SECRET = process.env.SECRET;



// Traer Usuarios de Base de datos 
app.get('/database', validarToken, async (req, res) => {
    const {usuario_red} = req.query
    try {
        
        const [datos]  =  await conexion.query('SELECT * FROM usuarios');
        if (usuario_red) {
            const r = datos.filter(i => i.usuario_red == usuario_red )
            if (r.length > 0) {
                return res.status(200).json({message:"Usuario encontrado", datos: r})
            }
            return res.status(500).json({error: "Error no se encuetra clientes"})
            
            
        } else  {
            
            return res.status(200).json({message:"Usuario encontrado", datos:datos})
        }
    } catch (error) {
        return res.status(500).json({error: "Error no se encuetra clientes"});
    }

});



// Agregar usuario a Base de datos 
app.post('/agregarUsuario', async (req, res)=> {
    const { usuario_red, correo, nombres, documento , contrasenna , rol } = req.body
    try {

        const caracteres = await bcrypt.genSalt(10);
        const incriptado = await bcrypt.hash(contrasenna,caracteres);



        const [data] = await conexion.query('insert into usuarios (usuario_red,correo,nombres,documento,contrasenna,rol) values (?,?,?,?,?,?)',[usuario_red,correo,nombres,documento,incriptado,rol]);
        
        res.status(200).json({message:"agregado exitosamente", data})
        
    } catch (error) {
        res.status(400).json({error:"Datos no son correctos"})
    }
})


// Modificar
app.put('/modificar', async (req,res)=>{
    const {usuario_red}= req.query
    const {correo, nombres, documento,contrasenna, rol } = req.body
    try {
        const [validar] = await conexion.query("SELECT * FROM usuarios")
        const revicion = validar.filter(i=> i.usuario_red == usuario_red)
        if (revicion.length > 0) {
            const caracteres = await bcrypt.genSalt(10);
            const incriptado = await bcrypt.hash(contrasenna,caracteres);
            const [data] = await conexion.query('UPDATE usuarios SET correo=(?),nombres=(?),documento=(?),contrasenna=(?),rol=(?) WHERE usuario_red=(?) ',[ correo, nombres, documento,incriptado, rol,usuario_red ])
            res.status(200).json({message:"Modificado", datos:data})
        }
        res.status(404).json({message:"No se encuetra Usuario"})
    } catch (error) {
        res.status(500).json({error:"Api o base de datos"})
    }
})

// Eliminar usuarios

app.delete('/eliminar', async (req, res)=>{
    const {usuario_red} = req.query
    try {
        const [ver] = await conexion.query("select * from usuarios");
        const validacion = ver.filter(i=> i.usuario_red == usuario_red)
        if (validacion.length > 0) {
            const [data] = await conexion.query('DELETE FROM usuarios WHERE usuario_red=(?)',[usuario_red]);
            res.status(200).json({message:"Eliminado", datos:data})
        }else{
            res.status(400).json({message:"Usuario no encontrado"})
        }
        
    } catch (error) {
        res.status(500).json({error:"Api o base de datos"})
    }
})


// Login

app.post('/login', async (req,res)=>{
    const {usuario_red,contrasenna}=req.body
    try {
        const [buscar] = await conexion.query('select * from usuarios');
        const indice = buscar.find(i=> i.usuario_red === usuario_red);
        const comparar = await bcrypt.compare(contrasenna, indice.contrasenna) 
        if (comparar) {
            const token = jwt.sign({usuario_red,correo:indice.correo , nombres:indice.nombres, documento:indice.documento, rol:indice.rol}, SECRET, {expiresIn:'1h'});
            
            res.cookie('token', token,{
                httpOnly: false,
                secure: false,
                sameSite:'lax',
                maxAge: 3600000
            });

            res.status(200).json({message:"Bienvenido", token})
        } else {
            res.status(404).json({error:"No se encuentra"})
        }
    } catch (error) {
         console.error("Error en /login:", error);
         res.status(500).json({error:"Api o base de datos"})
    }
})


// /dashboardPrincipal
// /dashboardUsuarios

// Cerrar Seccion 

app.post('/cerrada', (req, res) => {
    res.clearCookie('token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({ ok: 'Sesión Cerrada' });
});



// perfil con datos del token

app.get('/perfil', (req, res)=>{
    const token = req.cookies.token;
    if (!token) {
        return res.status(404).json({error:'token no existe'})
    }

    try {
        const datos = jwt.verify(token, SECRET);
        return res.json({usuario: datos.usuario_red, correo: datos.correo, nombres: datos.nombres, documento: datos.documento, rol: datos.rol })
    } catch (error) {
        return res.status(400).json({error:'token modificado'})
    }

})



export default app;