// load the things we need
const { query } = require('express');
var express = require('express');
var app = express();

var data= [];
const ids= new Map();
const valor= new Map();

var time = 0;

app.use(express.json());
//para cuando reciba el html, usamos el urlencoded para interpretarlo
app.use(express.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
    var mascots = [
        { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
        { name: 'Tux', organization: "Linux", birth_year: 1996},
        { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
    ];
    var tagline = "Usa los ids para realizar las diferentes operaciones. Recuerda que si dejas en desuso durante un minuto las operaciones realizadas en dicho id, se reiniciará a cero. Ve a formulario para empezar a operar!";

    res.render('pages/index', {
        mascots: mascots,
        tagline: tagline
    });
});


app.post('/result', (req, res) => {
    const accion=req.body.accion;
    const id = req.body.id;
    const numero=parseFloat(req.body.numero);

    ids.set(id, new Date());
    var localVar = valor.get(id);

   // console.log(id)
    //Comprobamos para ver si existe el valor para el id
        // isNaN(valor)  intenta convertir el parámetro pasado a un número. Si el parámetro 
        // no se puede convertir, devuelve true; en caso contrario, devuelve false.
    if( isNaN(localVar)){
        console.log("No existe valor para el id: "+id);
        localVar=0;
    }
    //console.log("valor local: " +localVar)
    data.push({ id, accion, numero, fecha: new Date()});

    //console.log(numero)
    //Diferentes casos de operaciones
    switch (accion){
        case "+":
            localVar+=numero;
            break;
        case "-":
            localVar-=numero;
            break;
        case "*":
            localVar=localVar*numero;
            break;
        case "/":
            //Mensaje para que no dividan por 0
            if(numero==0){
                res.render('pages/errorDivision0');
                return;
            }
            localVar=localVar/numero;
            break;
        case "R":
            clean(id);
            res.render('pages/formulario',{
                id,
                log:"Se han reseteado los valores para el id "+id
            });
            return;

    }

    //console.log(accion)
    valor.set(id,localVar);
    var resultadof = localVar;

    let log = "";

    for(i in data){
        if(data[i].id==id)
            log+=" "+data[i].accion+" "+data[i].numero;
    }

    //console.log(resultadof)
    res.render('pages/result', 
    { 
        operacion: { id, accion, numero},
        log,
        resultadof        
    });
}); 

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// formulario page
app.get('/formulario', (req, res) => {
    res.render('pages/formulario',{
        //para poder volver con el id
        id: req.query.id,
        log: ""
    });
});

//Función que limpia valor del id
function clean(id){
    console.log("Borrando el id: "+id);
    ids.delete(id);
    valor.delete(id);
    data = data.filter( i => {
        i.id!=id
    })
}

app.listen(8080, () =>{
    console.log('8080 is the magic port')
    //temporizador que va comprobando cada segundo
    setInterval(incrementaTiempo, 1000);
});

function incrementaTiempo()
{
    time++;
    console.log(time);
    var tiempoActual = new Date().getTime();
    const i = ids.keys();
    console.log(i)
    while(id=i.next().value){
        var fechaActual = ids.get(id).getTime();
        if(fechaActual < (tiempoActual - 60000)){
            console.log("Han pasado 60 segundos");
            clean(id);
            console.log("Se ha eliminado id "+id);

        }
    }
        
    
    
}