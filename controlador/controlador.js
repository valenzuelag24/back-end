import { json, Router } from "express";
//import modelo from "../modelo/modelo.js";
import conexion from "../modelo/conexion.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

//const data = modelo;
const app = Router();
const SECRET = 'hola_mundo';


// Traer Usuarios de Base de datos 
app.get('/database', async (req, res) => {
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
            const token = jwt.sign({usuario_red,contrasenna}, SECRET, {expiresIn:'1h'});
            
            res.cookie('token', token,{
                httpOnly: true,
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

// perfil con datos del token

app.get('/perfil', (req, res)=>{
    const token = req.cookies.token;
    if (!token) {
        return res.status(404).json({error:'token no existe'})
    }

    try {
        const datos = jwt.verify(token, SECRET);
        return res.json({usuario: datos.usuario_red})
    } catch (error) {
        return res.status(400).json({error:'token modificado'})
    }

})



export default app;