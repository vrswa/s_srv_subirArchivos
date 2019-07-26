
CfgDbBaseDir = `${__dirname}/mission`; //A: las misiones que llegan se escriben aqui
CfgUploadSzMax = 50 * 1024 * 1024; //A: 50MB max file(s) size 
//----------------------------------------------------------
var express = require('express');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var app = express();
//----------------------------------------------------------
//S: lib
function leerJson(ruta){
  return JSON.parse(fs.readFileSync(ruta));
}

//U: limpia extensiones de archivos no aceptadas, por aceptadas
/*
limpiarFname("../../esoy un path \\Malvado.exe");
limpiarFname("TodoBien.json");
limpiarFname("TodoCasiBien.Json");
limpiarFname("Ok.mp3");
*/
function limpiarFname(fname, dfltExt) {
  var fnameYext= fname.match(/(.+?)(\.(mp4|mp3|wav|png|jpg|json|txt))/) || ["",fname, dfltExt||""];
  //A: o tiene una extension aceptada, o le ponemos dfltExt o ""
  var fnameSinExt= fnameYext[1];
  var fnameLimpio= fnameSinExt.replace(/[^a-z0-9_-]/gi,"_") + fnameYext[2];
  //A: en el nombre si no es a-z A-Z 0-9 _ o - reemplazo por _ , y agrego extension aceptada
  return fnameLimpio;
}

//U: devuelve la ruta a la carpeta o archivo si wantsCreate es true la crea sino null
function rutaCarpeta(missionId,file,wantsCreate) {
  missionId = limpiarFname(missionId||"_0SinMision_");
  file = file!=null && limpiarFname(file,".dat");

  console.log("nombres limpios: " + missionId + ' ' + file);

  var rutaCarpeta = `${CfgDbBaseDir}/${missionId}`;
  if (!fs.existsSync(rutaCarpeta)) { 
		if (wantsCreate){
    	fs.mkdirSync(rutaCarpeta);
		}else{
			return null;
		}
	}
  //A:tenemos carpeta

  if (file){
    var rutaArchivo = `${rutaCarpeta}/${file}`;
    return rutaArchivo;
  }else{
    return rutaCarpeta;
  }
}
/* TESTS
console.log(rutaCarpeta("t_rutaCarpeta_ok",null,true))
console.log(rutaCarpeta("t_rutaCarpeta_ok","arch1",true))
console.log(rutaCarpeta("t_rutaCarpeta2_ok","arch2",true))
console.log(rutaCarpeta("t_rutaCarpeta2_ok","Malvado1.exe",true)) //A: no pasa exe
console.log(rutaCarpeta("t_rutaCarpeta2_ok","/root/passwd",true)) //A: no pasa /
console.log(rutaCarpeta("../../t_rutaCarpeta_dirUp_MAL","index.json",true)) //A: no pasa ../
console.log(rutaCarpeta("/t_rutaCarpeta_root_MAL","index.json",true)) //A: no pasa /
*/

//----------------------------------------------------------
app.use(fileUpload({
  abortOnLimit: true,
  responseOnLimit: "ERROR: Size Max "+CfgUploadSzMax,
  limits: { 
    fileSize: CfgUploadSzMax
  },
}));
//VER:  http://expressjs.com/en/starter/basic-routing.html
//VER:  http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.static('files'));

//nos envian via POST uno o varios archivos de una mission
//U: curl -F 'file=rutaArchivo' http://ip/mission/carpetadeLaMision
//U: curl -F 'file=@\Users\VRM\Pictures\leon.jpg' http://localhost:8080/mission/misionDaniel
app.post('/mission/:missionId',(req,res) => {
  try{
    if(!req.files){  return res.sendStatus(400); }
    //A: sino me mandaron nigun file devolvi 400
    var archivo = req.files.file;
 
    var rutaArchivo = rutaCarpeta(req.params.missionId, archivo.name,true);
    //A: ruta carpeta limpia path (que no tenga .. exe js )
    //A : el tamaño maximo se controla con CfgUploadSzMax
    console.log("mission upload: " + rutaArchivo + " " + archivo.size);
    archivo.mv(rutaArchivo,err => {
      if (err) return res.send(err);
      return res.status(200).send('OK ' + archivo.size); //TODO: enviar tambien HASH
    });
  }catch (err) {
    res.status(500).send(err);
  }
});


//U: mediante GET se pide un archivo especifico de una mision especifica
//curl "http://localhost:8080/mission/misionDaniel/leon.jpg"
app.get('/mission/:missionId/:file',(req,res) => {
  //var missionId = req.params.missionId;
  var archivo = req.params.file;
  //console.log(fs.existsSync(console.log(CfgDbBaseDir + '/' + missionId + '/'+ archivo)));
  var rutaArchivo = rutaCarpeta(missionId, archivo,false);
  console.log("llegaste bien " + rutaArchivo);
  if (fs.existsSync(rutaArchivo)){
    res.status(200).sendFile(rutaArchivo);
  }else{
    res.status(404);
  }
});

//U: mediante GET se piden los index.json de todas las misiones
app.get('/mission',(req,res) => {
  var vector = new Array();

  fs.readdir(CfgDbBaseDir, function(err, carpetas) {
    for (var i=0; i<carpetas.length; i++) {
      var rutaArchivo = `${CfgDbBaseDir}/${carpetas[i]}/index.json`;
      if (fs.existsSync(rutaArchivo)) {
        vector.push(leerJson(rutaArchivo));
      }  
      rutaArchivo="";
    }
    return res.status(200).send(vector);
  });
})


const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

