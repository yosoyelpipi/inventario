/* global $ */
var ws;
var db;
var user;
var pass;
var defws;
var defdb;
var defuser;
var defpass;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        //scanear();
       //Habilita la función del botón atrás.
	   document.addEventListener("backbutton", onBackKeyDown, false);	 
        
       //Habilita la función del botón menú.
	   document.addEventListener("menubutton", onMenuKeyDown, false);
       
        verificarWS('configurado', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS para comenzar.');
    }   
};

//Botón atrás
function onBackKeyDown() {
            if( confirm("Realmente desea salir de la aplicación?") )
            {
                  navigator.app.exitApp();
            }
		}

// Función activada. Botón Menú.
function onMenuKeyDown() {
	alert('No hay opciones de menu disponible por el momento');
    }
    
//Ejecuto el lector de código de barras
function scanear(){
    cordova.plugins.barcodeScanner.scan(
        //Si el scaneo del barcode Scanner funciona ejecuta la función result
        function (result) {  
            //Guardamos el resultado del código QR o código de barras en una variable
            var codigoQR=result.text;
            //Introducimos esa variable en el campo 
            $('#resultado').html(codigoQR);
        }, 
        //Si no, ejecuta la función error.
        function (error) {
            notificacion("Ha ocurrido un error al escanear.");
        }
    );
};

//Verifico si el usuario definió o no el WS
function verificarWS(c,m){
    ws = window.localStorage.getItem("ws");
    db = window.localStorage.getItem("db");
    user = window.localStorage.getItem("user");
    pass = window.localStorage.getItem("pass");
    
    if ((!ws) || (!db) || (!user) || (!pass) ){
        console.log('no definiste el ws, por lo tanto no puedo mostrar el div '+ c);
        $('#error').show();
        $('#mgnalert').html('<p class="lead">'+ m +'</p>');
    }else{
        console.log('Ok si esta definido.');
        $('#'+ c +'').show();
    } 
}

function genInventario(){
    verificarWS('genInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar generar una toma de inventario.');
    $('#tomaInventario').hide();$('#depInventario').hide();$('#configWS').hide();$('#helpNow').hide();$('#configurado').hide();
}
function tomaInventario(){
    verificarWS('tomaInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelvé toma de inventario.');
    $('#genInventario').hide();$('#depInventario').hide();$('#configWS').hide();$('#helpNow').hide();$('#configurado').hide();
}
function depInventario(){
    verificarWS('depInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar depurar una toma de inventario.');
    $('#tomaInventario').hide();$('#genInventario').hide();$('#configWS').hide();$('#helpNow').hide();$('#configurado').hide();
}
function configWS(){
    ws = window.localStorage.getItem("ws");
    db = window.localStorage.getItem("db");
    user = window.localStorage.getItem("user");
    pass = window.localStorage.getItem("pass");
    
    if ((!ws) || (!db) || (!user) || (!pass) ){
        $('#configWS').show();  
    }else{
        probarWS();      
    }
    $('#tomaInventario').hide();$('#genInventario').hide();$('#depInventario').hide();$('#helpNow').hide();$('#configurado').hide();$('#error').hide();
}
function helpNow(){
    verificarWS('helpNow', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar depurar una toma de inventario.');
    $('#tomaInventario').hide();$('#genInventario').hide();$('#depInventario').hide();$('#configWS').hide();$('#configurado').hide();
}


/* Defino el WS
OPERACIONES 
- Almaceno los datos enviados por el formulario.
- Valido que todos tengas al menos un valor.
- Guardo en localStorage los valores.
- Refresco la aplicación. 
*/
function submitForm(){
	var _webs = $("[name='ws']").val();
	var _base = $("[name='bd']").val();
	var _users = $("[name='user']").val();
	var _pass = $("[name='pass']").val();
	
    if (_webs == ""){
        console.log('La ruta WS no puede estar vacía.');
        alert('La ruta WS no puede estar vacía.');
        return false;
    }
    if (_base == ""){
        console.log('La base de datos no puede estar vacía.');
        alert('La base de datos no puede estar vacía.');
        return false;
    }
    if (_users == ""){
        console.log('El usuario no puede estar vacío.');
        alert('El usuario no puede estar vacío.');
        return false;
    }
    if (_pass == ""){
        console.log('La contraseña no puede estar vacía.');
        alert('La contraseña no puede estar vacía.');
        return false;
    }    
	ws = window.localStorage.setItem("ws", _webs);
	db = window.localStorage.setItem("db", _base);
	user = window.localStorage.setItem("user", _users);
	pass = window.localStorage.setItem("pass", _pass);
	alert('Los datos se han guardado correctamente.');
	
	$("#configWS").hide();
    location.reload();
}

function probarWS(){
    $('#probarWS').show();
	
    defws = window.localStorage.getItem("ws");
	defdb = window.localStorage.getItem("db");
	defuser = window.localStorage.getItem("user");
	defpass = window.localStorage.getItem("pass");
    
    $('#defws').html('<label for="ws"><small>Web Service</small></label>' +
                  '<input type="text" class="form-control" name="ws" value="'+ defws +'">');
    
    $('#defdb').html('<label for="bd"><small>Base de datos</small></label>' +
                  '<input type="text" class="form-control" name="bd" value="'+ defdb +'">');
    
    $('#defuser').html('<label for="user"><small>Usuario</small></label>' +
                    '<input type="text" class="form-control" name="user" value="'+ defuser +'">');
   
    $('#defpass').html('<label for="pass"><small>Password</small></label>' +
                    '<input type="password" class="form-control" name="pass" value="'+ defpass +'">');             
   
}

/* Borrar los datos de conexión */
function Cleaner(){	
	if( confirm("Realmente deseas borrar los datos de conexión al WebService? ") )
            {
			window.localStorage.setItem("ws", "");
			window.localStorage.setItem("db", "");
			window.localStorage.setItem("user", "");
			window.localStorage.setItem("pass", "");
            
			console.log('Borraste los datos de conexión');
			alert('Borraste con éxito los datos de conexión');
			location.reload();
			}
}

/* Testeo la conexión */
    $("#conexion").click(function(){
        console.log('Hiciste click en el botón con ID "conexion". ');
                var url = window.localStorage.getItem("ws");
                $("#conectando").show();
                $.getJSON("http://leocondori.com.ar/app/local/testws.php", {ws: url, precio: 20}, resultConn, "json");          
        })

/* Función captura la respuesta del testeo de conexión */
		function resultConn(respuesta){
			if (respuesta.valor == 1){
				$("#conectando").hide();				   
				alert('Conexión creada con éxito.');
			}else{
				$("#conectando").hide();
				alert('No se pudo realizar una conexión con el servicio web solicitado');
			}
		}

/* Testeo-Login */
    $("#testlogin").click(function(){
    var WebService = window.localStorage.getItem("ws");
	var BaseDeDatos = window.localStorage.getItem("db");
	var Usuario = window.localStorage.getItem("user");
	var Clave = window.localStorage.getItem("pass");
        
    $("#conectando").show();		
        $.getJSON("http://leocondori.com.ar/app/local/itslogin.php", {ws: WebService, base: BaseDeDatos, usuario: Usuario, pass: Clave}, ItsLogin, "json");
    })

/* Función que captura la respuesta del testeo del login */
    function ItsLogin(Response){
        if (Response.ItsLoginResult == 1){
            $("#conectando").hide();				   
            alert('Error : ' + Response.motivo);
        }else{
            $("#conectando").hide();
            alert('Login realizado con éxito: ' + Response.session);
        }
    }
 
/* Generación de toma de inventario*/
    $("#actInventario").click(function(){
       var WebService = window.localStorage.getItem("ws");
	   var BaseDeDatos = window.localStorage.getItem("db");
	   var Usuario = window.localStorage.getItem("user");
	   var Clave = window.localStorage.getItem("pass");
       $("#conectando").show();          
       $.getJSON("http://leocondori.com.ar/app/inventario/erpgeninv.php", {ws: WebService, base: BaseDeDatos, usuario: Usuario, pass: Clave}, ItsGenInv, "json"); 
    })
    
    function ItsGenInv(Response){
        if (Response.ItsLoginResult == 1){
            $("#conectando").hide();
            }else{
                //Limpio el contenedor para volver a cargar los resultados.
                $('#depositos').html('');
                
                for(var x=0; x<Response.Data.length; x++) {
                    console.log(Response.Data[x]["FECHA"]);
                    console.log(Response.Data[x]["FK_ERP_DEPOSITOS"]);
                    console.log(Response.Data[x]["DES_DEP"]);
                    
                    var f = Response.Data[x]["FECHA"];
                    var d = Response.Data[x]["FK_ERP_DEPOSITOS"];
                    var de = Response.Data[x]["DES_DEP"];

                    $('#depositos').append('<button type="button" onClick="defDeposito('+f+','+d+',\''+de+'\')" class="list-group-item"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> '+ Response.Data[x]["DES_DEP"] +'</button>');
                }
            }
    }
    
function defDeposito(f,d,de){
    alert (f);
    alert (d);
    alert (de);
}        
    
/* Testo de conexión móvil */
function checkConnection() {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = 'No podemos determinar tu tipo de conexión a una red de datos.';
            states[Connection.ETHERNET] = 'Estás conectado a la red mediante Ethernet connection, estamos listo para sincronizar los datos.';
            states[Connection.WIFI]     = 'Estás conectado a la red mediante WiFi, estamos listo para sincronizar los datos.';
            states[Connection.CELL_2G]  = 'Estás conectado a la red mediante Cell 2G connection, estamos listo para sincronizar los datos.';
            states[Connection.CELL_3G]  = 'Estás conectado a la red mediante Cell 3G connection, estamos listo para sincronizar los datos.';
            states[Connection.CELL_4G]  = 'Estás conectado a la red mediante Cell 4G connection, estamos listo para sincronizar los datos.';
            states[Connection.CELL]     = 'Estás conectado a la red mediante Cell generic connection, podrías experimentar lentitud en la sincronización.';
            states[Connection.NONE]     = '¡Atención! tu dispositivo no tiene conexion a datos, no podrás sincronizar, sin embargo podrás seguir trabajando de manera offline.';
			
			if(navigator.network.connection.type == Connection.NONE){
				// No tenemos conexión
				alert(states[networkState]);
			}else{
				// Si tenemos conexión
				alert(states[networkState]);
			}
			
            //alert(states[networkState]);
        }        