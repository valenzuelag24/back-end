import express from 'express';
import controlador from './controlador/controlador.js';



const app = express();
const port = 3000;

app.use(express.json());
app.use('/', controlador);

app.listen(port,()=>{
    console.log(`Servidor escuchando en http://localhost:${port}`);
});