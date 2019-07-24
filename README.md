# Server guardar archivos
servidor que permite con peticiones get guardar archivos en carpetas
y con post obtenerlos

# GET

  formato curl
```sh
$ curl "http://ip:port/mision/nombreDeLaMision/archivo.extension"
```
 ejemplo
 ```sh
$ curl "http://localhost:8080/mision/misionDaniel/leon.jpg"
```


esto devuelve:
  - http code: 200 y el archivo.
  - http code: 400 si el archivo no se encuentra

# POST

  formato curl
```sh
$ curl -F 'archivo=rutaArchivo' http://ip/mision/carpetadeLaMision
```
 ejemplo
 ```sh
$ curl curl -F 'archivo=@\Users\VRM\Pictures\leon.jpg' http://localhost:8080/mision/misionDaniel
```


esto devuelve:
  - http code: 200 caso positivo (si no existe la carpeta de la mision se crea)
  - http code: 400 si el archivo no se manda con la variable de nombre "archivo"
  - http code:400 si el archivo excede el limte de mb establecidos
