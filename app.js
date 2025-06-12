import express from 'express';
import controlador from './controlador/controlador.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'; 


const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser()); 
app.use(express.json());
app.use('/', controlador);

app.listen(port,()=>{
    console.log(`Servidor escuchando en http://localhost:${port}`);
});