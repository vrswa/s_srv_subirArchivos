const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const app = express();
app.use(fileUpload());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//curl curl -F rutaArchivo http://ip/mision/carpetadeLaMision
//curl -F 'archivo=@\Users\VRM\Pictures\leon.jpg' http://localhost:8080/mision/misionDaniel
app.post('/mision/:carpeta',(req,res) => {
  if(!req.files.archivo){
    res.sendStatus(400);
  }
  var miArchivo = req.files.archivo;
  var rutaCarpeta = `${__dirname}/mision/${req.params.carpeta}`;
  var rutaArchivo = `${rutaCarpeta}/${miArchivo.name}`;
  console.log(miArchivo.size / 1000000);
  if (miArchivo.size / 1000000 >= 100) return  res.sendStatus(400);
  
  if (!fs.existsSync(rutaCarpeta) ){
      fs.mkdirSync(rutaCarpeta);
  }

  miArchivo.mv(rutaArchivo,err => {
    if (err) return res.send(err);
  return res.status(200).send('archivo cargado');
  });
});

app.get('/mision/:carpeta/:archivo',(req,res) => {
  var carpeta = req.params.carpeta;
  var archivo = req.params.archivo;
  var rutaArchivo = `${__dirname}/mision/${req.params.carpeta}/${req.params.archivo}`;
  if (!fs.existsSync(rutaArchivo)){
    res.sendStatus(404);
  }
  res.sendFile(rutaArchivo);
});


const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

