/* global $ */
var ws;
var db;
var user;
var pass;
var defws;
var defdb;
var defuser;
var defpass;
var existe_db;
var dbcreate;
var fua_cli;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
		
	existe_db = window.localStorage.getItem("existe_db");	
	
	dbcreate = window.openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
	
	if(!existe_db){
	    console.log("la BD es null");
		creaDB();
	}else{
		console.log("la BD está definida");
		//cargaDatos();
		//CargoArticulos();
	}	
		
	
	//Inicializo las notificaciones Push
	if(PushbotsPlugin.isAndroid()){
		PushbotsPlugin.initializeAndroid("56660cab17795947198b4569", "902461928096");
	}	
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
            $('#contado').append(codigoQR);
			//Llamo nuevamente al léctor de código de barras.
			loop();
        }, 
        //Si no, ejecuta la función error.
        function (error) {
            notificacion("Ha ocurrido un error al escanear.");
        }
    );
};

function loop(){
	scanear();
}
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
	
	//Si tiene depósito seleccionado te dejo hacer el inventario.
	
	//Levanto el ID del depósito seleccionado.
	var depo = window.localStorage.getItem("deposito");
	
	var desDepo = window.localStorage.getItem("des_dep");
	
	//Ahora controlo si la varaible esta definida o no.	
	if(!depo){
		$('#TomaDeInventario').html('<div class="alert alert-danger" role="alert">Oh snap! No tenés definido aún ningún depósito, andá a la generación de inventario y seleccioná un depósito. De lo contrario no vas a poder realizarlo.</div>');
		$('#DesDepo').html('<span class="label label-danger" >Sin definir</span>');
	}else{
		$('#TomaDeInventario').html('<button type="button" onClick="scanear()" class="btn btn-primary btn-lg btn-block"><span class="glyphicon glyphicon-barcode" aria-hidden="true"></span> Por código de barras</button>' +
									'<button type="button" class="btn btn-default btn-lg btn-block"><span class="glyphicon glyphicon-tag" aria-hidden="true"></span> Por código de artículo</button>');
		$('#DesDepo').html('<span class="label label-success" >' + desDepo + '</span>');
	}
	
	
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
                $("#conectandonos").show();
                $.getJSON("http://leocondori.com.ar/app/local/testws.php", {ws: url, precio: 20}, resultConn, "json");          
        })

/* Función captura la respuesta del testeo de conexión */
		function resultConn(respuesta){
			if (respuesta.valor == 1){
				$("#conectandonos").hide();				   
				alert('Conexión creada con éxito.');
			}else{
				$("#conectandonos").hide();
				alert('No se pudo realizar una conexión con el servicio web solicitado');
			}
		}

/* Testeo-Login */
    $("#testlogin").click(function(){
	$("#conectandonos").show();	
    var WebService = window.localStorage.getItem("ws");
	var BaseDeDatos = window.localStorage.getItem("db");
	var Usuario = window.localStorage.getItem("user");
	var Clave = window.localStorage.getItem("pass");	
        $.getJSON("http://leocondori.com.ar/app/local/itslogin.php", {ws: WebService, base: BaseDeDatos, usuario: Usuario, pass: Clave}, ItsLogin, "json");
    })

/* Función que captura la respuesta del testeo del login */
    function ItsLogin(Response){
        if (Response.ItsLoginResult == 1){
            $("#conectandonos").hide();				   
            alert('Error : ' + Response.motivo);
        }else{
            $("#conectandonos").hide();
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
					
					$("#conectando").hide();
                    $('#depositos').append('<button type="button" onClick="defDeposito('+f+','+d+',\''+de+'\')" class="list-group-item"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> '+ Response.Data[x]["DES_DEP"] +'</button>');
                }
            }
    }
 
//Agregar el depósito activo.    
function defDeposito(f,d,de){
	window.localStorage.setItem("fecha", f);
	window.localStorage.setItem("deposito", d);
	window.localStorage.setItem("des_dep", de);
    alert('La fecha seleccionada es: '+ f);
    //alert('' + d);
    alert('El depósito seleccionado es: ' + de);
	
	//Lo redirecciono a la toma de inventario.
	tomaInventario();
}        
    
/* Testeo de conexión móvil */
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

/*
*Creación de base de datos
*/
function creaDB(){
	dbcreate.transaction(creaNuevaDB, errorDB, crearSuccess);
	}

function creaNuevaDB(tx){
	console.log("Creando base de datos.");
	
	tx.executeSql('DROP TABLE IF EXISTS erp_inventario');
	//Creo la tabla toma de inventario.
	var sql = "CREATE TABLE IF NOT EXISTS erp_inventario( " +
	          "ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
			  "FK_ERP_ARTICULOS VARCHAR(15)," +
			  "FK_ERP_DEPOSITOS VARCHAR(15)," +
			  "CANTIDAD VARCHAR(10)," +
			  "FECHA DATE )";			  
	tx.executeSql(sql);
	console.log('Creé la tabla erp_inventario');

	//Creo la tabla ERP_ARTICULOS.
	tx.executeSql('DROP TABLE IF EXISTS ERP_ARTICULOS');
	var ERP_ARTICULOS = "CREATE TABLE IF NOT EXISTS ERP_ARTICULOS ( " +
						"id VARCHAR(50) PRIMARY KEY," +
						"DESCRIPCION VARCHAR(100) )";
	tx.executeSql(ERP_ARTICULOS);
	console.log('Creé la tabla ERP_ARTICULOS');
	
	//Marco a la aplicación para que sepa que la base de datos ya está creada.
	window.localStorage.setItem("existe_db", 1);
}

function crearSuccess(){
	console.log('La base y tablas se crearon con éxito.');
	//cargaDatos();	
}

function errorDB(err){
	console.log("Error procesando SQL:" + err.message);
	alert("Error procesando SQL:" + err.message);
}

function test(){
	$("#leo").hide();	
}
function testing(){
	$("#leo").show();	
}

//************* ARTICULOS *************	
	function CargoArticulos(){
	$("#leo").show();
	
       var WebService = window.localStorage.getItem("ws");
	   var BaseDeDatos = window.localStorage.getItem("db");
	   var Usuario = window.localStorage.getItem("user");
	   var Clave = window.localStorage.getItem("pass");
	   
			//Para la pimera ejecución, entonces controlo si está declarada o no.
			var fua_cli = window.localStorage.getItem("fua_cli");
			if(!fua_cli){
				var fec_ult_act_cli = '';
			}else{
				var fec_ult_act_cli = fua_cli;
			}
				$.getJSON("http://leocondori.com.ar/app/inventario/down_art.php", {ws: WebService, base: BaseDeDatos, usuario: Usuario, pass: Clave, fua_cliente: fec_ult_act_cli}, ItsDownloadClient, "json");
	}
//FIN: Sincronizo clientes

		function ItsDownloadClient(Response){
			if (Response.ItsLoginResult == 1){
				$("#leo").hide();				   
				alert('Error : ' + Response.motivo);
			}else{
					$("#leo").hide();
					
					//Muestro un DIV para informar algo al usuario.
					$("#instala").show();
					
					if(Response.Cantidad != 0){

					var db = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
					db.transaction(crearEmpresa, errorCB, successArt);
function crearEmpresa(tx){													
						for(x=0; x<Response.Data.length; x++) {
								console.log('Esto es el ID: '+ Response.Data[x]["ID"]);
								console.log('Esto es el DESC: '+ Response.Data[x]["DESCRIPCION"]);
								tx.executeSql("INSERT INTO ERP_ARTICULOS (id, DESCRIPCION) VALUES ('"+Response.Data[x]["ID"]+"', '"+Response.Data[x]["DESCRIPCION"]+"') ");
							}
						}
						
						$("#instala").html('<span class="label label-default">¡Genial! se han sincronizado ' + Response.Data.length + ' registros.</span><br>');
						window.localStorage.setItem("fua_cli", Response.ItsGetDate);
						$("#instala").append('<span class="label label-success">Fecha de última actualización: ' + Response.ItsGetDate + '</span>');
						console.log('Fecha de última actualización:' + Response.ItsGetDate);						
						//$("#instala").fadeOut(10000);						
					}else{
						
						
						fua_cli = window.localStorage.getItem("fua_cli");
                        showAlert();						
						
						
						
			/*if( confirm("No hay artículos nuevos para centralizar, la fecha y hora que se ejecutó por última vez es " + fua_cli + ". De todas maneras ¿Desea forzar la centralización? se perderán todas las empresas guardadas.") )
            {
			//Borro los datos de la tabla.
			var db = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
			db.transaction(function(tx) {
			tx.executeSql("delete from ERP_ARTICULOS");
			}, errorCB, successCB);
			
			//Actualizo la fecha de última actualización.
			  window.localStorage.setItem("fua_cli", '');
			//Todo fue maravilloso  
              alert('¡Excelente! ahora volvé a centralizar las empresas.');
				//location.reload();			  
            }*/
					
						//$("#instala").html('<span class="label label-info">Tenés el maestro de empresas actualizado</span><br>');
						$("#instala").fadeOut(9000);
					}
			}
		}
		
function errorCB(err){
	console.log("Error procesando SQL:" + err.code);
	//navigator.notification.alert("Error procesando SQL:" + err.code);
	alert("Error procesando SQL:" + err.code + '-' + err.message);
}

function alertCallback(){
	console.log("AlertCallback");
}

function successArt(){
	console.log("Dato insertado");
	//navigator.notification.alert("Error procesando SQL:" + err.code);
	navigator.notification.alert('Artículos centralizados con éxito', alertCallback, 'Centralizador dice:', 'Aceptar');
	
	$('#depositos').html('');
	//Escribo algo en el HTML	
}		

    // process the confirmation dialog result
    function onConfirm(buttonIndex) {
		if (buttonIndex==1){resetArticulos();}
    }


	function showAlert() {
        navigator.notification.confirm(
            'No hay artículos nuevos para actualizar la aplicación. La fecha y hora que se ejecutó por última vez fue ' + fua_cli + '. ¿De todas maneras deseas forzar la centralización?',  // message
            onConfirm, // callback
            'Centralizador dice:', // title
            ['Forzar', 'Cancelar'] // buttonName
        );
    }
	
function resetArticulos(){	
	//Borro los datos de la tabla.
	var db = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
	db.transaction(function(tx) {
	tx.executeSql("delete from erp_articulos");
	}, errorCB, successCB);
	
	//Actualizo la fecha de última actualización.
	  window.localStorage.setItem("fua_cli", '');
	//Todo fue maravilloso	
}	
function errorCB(err){
	console.log("Error procesando SQL:" + err.code);
	alert("Error procesando SQL:" + err.code + '-' + err.message);
}

function successCB(){
	console.log("Dato insertado");
	//alert('¡Excelente! ahora volvé a centralizar los precios.');	
	navigator.notification.alert('¡Excelente! ahora volvé a centralizar los precios.', alertCallback, 'Centralizador dice:', 'Aceptar')
}	
	
    //FUCIONES  (ESTE TESTING ANDA)    
   /* function ItsDownloadClientes(respuesta)
    {
        if (respuesta.ItsLoginResult == 0){
            $("#leo").hide();
			for(x=0; x<respuesta.Data.length; x++) {
				console.log('Esto es el ID: '+ respuesta.Data[x]["ID"]);
				console.log('Esto es la descripción de ARTICULOS: '+ respuesta.Data[x]["DESCRIPCION"]);
			}
			alert('Preparamos la aplicación para la toma de inventario con éxito.');
        }else{
            $("#leo").hide();
            alert('Existió un error' + respuesta.motivo);
        }
    }*/
//************* ARTICULOS *************