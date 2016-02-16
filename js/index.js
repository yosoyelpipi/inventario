global = $;
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
var Articulo;
var CantidadIngresada;
var errorglobales;
var recibi;
//configWS -- Borrador.



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
		/*if(PushbotsPlugin.isAndroid()){
		 PushbotsPlugin.initializeAndroid("56660cab17795947198b4569", "902461928096");
		}*/

		var Pushbots = PushbotsPlugin.initialize("56c23d84177959ab388b4567", {"android":{"sender_id":"902461928096"}});

		Pushbots.on("notification:clicked", function(data){
			console.log("clicked:" + JSON.stringify(data));
		});

    }   
};


//Verifico si el usuario definió o no el WS
function verificarWS(c,m){
    ws = window.localStorage.getItem("ws");
    db = window.localStorage.getItem("db");
    user = window.localStorage.getItem("user");
    pass = window.localStorage.getItem("pass");
    
    if (!ws){
        console.log('no definiste el ws, por lo tanto no puedo mostrar el div '+ c);
        $('#error').show();
        $('#mgnalert').html('<p class="lead">'+ m +'</p>');
    }else{
        console.log('Ok si esta definido.');
        $('#'+ c +'').show();
    } 
}

//Botón atrás
function onBackKeyDown(){
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
            //ANDA ESCRIBE RESULTADOS
			$('#contado').html('<input type="hidden" class="form-control" id="CodBarrasLeido" value="'+codigoQR+'">');

			//Llamo nuevamente al léctor de código de barras.
			loop(codigoQR);  
        }, 
        //Si no, ejecuta la función error.
        function (error) {
            notificacion("Ha ocurrido un error al escanear.");
        }
    );
};


//Función para saber si el Json está vacío.
function isEmptyJSON(obj){
	for(var i in obj) { return false; }
	return true;
}

function is_integer(value){
	for (i = 0 ; i < value.length ; i++) {
		if ((value.charAt(i) < '0') || (value.charAt(i) > '9')) return false
	}
	return true;
}
/*
Graba pedidos
*/
function clickMeArt(erp_articulos){
	var erp_articulos;
	grabaDatos();
}

function grabaDatos(){
	db.transaction(grabaRegistros, errorDB);
}

function grabaRegistros(tx){
	var fechia = window.localStorage.getItem("fecha");
	var deposi = window.localStorage.getItem("deposito");
	var descripdepo = window.localStorage.getItem("des_dep");

	tx.executeSql("insert into erp_inventario (fk_articulos, fk_erp_depositos, cantidad, fecha)values('"+erp_articulos+"','"+deposi +"', '1', '"+fechia+"') ", [], grabarDatosSuccess, errorDB);
	console.log("inserté linea para migrar");
}

function loop(codigo){
	console.log('Arrancó la función loop');
	searchEmpresas();
	window.localStorage.setItem("codigoqr", codigo);
	var codigo =  window.localStorage.getItem("codigoqr");
		/*
		BUSCAR EMPRESAS
		*/
		function searchEmpresas(){
			console.log('Arrancó la función searchEmpresas');
			var dbbb = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
			dbbb.transaction(searchEmp, errorDB);
		}
		function searchEmp(tx){
			console.log('Arrancó la función searchEmp');
			//var codigo = $("#CodBarrasLeido").val();			
			if(!codigo){
				alert('Tenés que ingresar un valor para iniciar la búsqueda');
				return;
			}			
			console.log("Buscando código de barra ::: "+codigo+" ::: de la base de datos de la aplicación.");
			tx.executeSql('select * from erp_articulos where COD_BARRA like (\'%'+ codigo +'%\') ', [], searchEmpSuccess, errorDB);
		}			


	function searchEmpSuccess(tx, results){
		console.log('Arrancó la función searchEmpSuccess');
		if(results.rows.length == 0){
			//var searchFail = $("#CodBarrasLeido").val();
			
			console.log("No hay resultados para la busqueda (" + codigo + ") seleccionada.");
			alert("No hay artículos con el siguiente código de barra (" + codigo + ") intenta registrar el artículo por número de código.");
			if(confirm("Sin resultados. ¿Seguís usando el escaner?") ){scanear();}
		}else{
		console.log('Arrancó la función searchEmpSuccess con datos');
		//$("#erparticulos").hide();
		console.log('Entro acá porque existen datos.');
				for(var x=0; x<results.rows.length; x++){
					var empresult = results.rows.item(x);
					//Grabo en la consola el estado de los resultados.
					console.log('Encontre esto: ' + empresult.id);

				var fa = window.localStorage.getItem("fecha");
				var deo = window.localStorage.getItem("deposito");
				var dd = window.localStorage.getItem("des_dep");
				
					var person = prompt("Ingresá la cantidad", "");
					if (person != null) {
						//document.getElementById("demo").innerHTML =
						//"Hello " + person + "! How are you today?";

						console.log('Ingreso algo distinto de NULL, parece un número, mirá: ' + person);
						var cancontado = person;

						//validar si una variable es de tipo entero
						if (is_integer(cancontado)){
							console.log(cancontado + " es entero");
							var descripdepo = window.localStorage.getItem("des_dep");

							tx.executeSql("INSERT INTO erp_inventario (FK_ERP_ARTICULOS, FK_ERP_DEPOSITOS, DESC_DEPOSITOS, CANTIDAD, FECHA) VALUES ('"+empresult.id+"', '"+deo+"', '"+descripdepo+"', '"+cancontado+"', '"+fa+"') ");
							if(confirm("Dato ingresado. ¿Seguís usando el escaner?") ){scanear();}
						}else{
							alert (cancontado + " no parece ser un código de barras. Operación abortada.");
							scanear();
						}


					}else{
						console.log('Ingresó algo parecido a NULL: '+ person);
						var cancontado = person;
						sinCantidad(empresult.id);
					}
				}
		}	
	}
}
function sinCantidad(art){
	var art;
	console.log('Se canceló el ingreso del artículo '+ art +' porque no ingresaste la cantidad.');
	if(confirm("Se canceló el ingreso del artículo "+ art +" porque no ingresaste la cantidad. ¿Seguís usando el escaner?") ){scanear();}
}
/*
function errorIngreso(){
	console.log('Error desconocido a insertar artículo');
	alert('Error desconocido a insertar artículo');
	if(confirm("Lectura cancelada. ¿Seguís usando el escaner?") ){scanear();}
}

function successIngreso(){
	console.log('Exito al insertar artículo');
	alert('Exito al insertar artículo');
	if(confirm("Dato ingresado. ¿Seguís usando el escaner?") ){scanear();}
}*/

function genInventario(){

var hayWiFi=validateConnection();
//var hayWiFi = true;

	if(hayWiFi == true) {
	//Levanto el ID del depósito seleccionado.
		var depo = window.localStorage.getItem("deposito");
		var desDepo = window.localStorage.getItem("des_dep");

		if (!depo) {
			$('#DesDepoRefresh').html('<span class="label label-danger" >Sin definir</span>');
		} else {
			$('#DesDepoRefresh').html('<span class="label label-success" >' + desDepo + '</span>');
		}
		verificarWS('genInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar generar una toma de inventario.');
		$('#tomaInventario').hide();
		$('#depInventario').hide();
		$('#configWS').hide();
		$('#helpNow').hide();
		$('#configurado').hide();
		$('#probarWS').hide();
	}else{
		alert('No estás conectado a ninguna red WiFi. Conectate a una y volvé por acá.');
	}
}
function tomaInventario(){
    verificarWS('tomaInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelvé toma de inventario.');
    $('#genInventario').hide();$('#depInventario').hide();$('#configWS').hide();$('#helpNow').hide();$('#configurado').hide();$('#probarWS').hide();
	
	//Si tiene depósito seleccionado te dejo hacer el inventario.
	
	//Levanto el ID del depósito seleccionado.
	var depo = window.localStorage.getItem("deposito");	
	var desDepo = window.localStorage.getItem("des_dep");
	
	//Ahora controlo si la varaible esta definida o no.	
	if(!depo){
		$('#TomaDeInventario').html('<div class="alert alert-danger" role="alert">Oh snap! No tenés definido aún ningún depósito, andá a la generación de inventario y seleccioná un depósito. De lo contrario no vas a poder realizarlo.</div>');
		$('#DesDepo').html('<span class="label label-danger" >Sin definir</span>');
	}else{
		$('#TomaDeInventario').html('<button type="button" onClick="CargoArticulos()" class="btn btn-success btn-lg btn-block"><span class="glyphicon glyphicon-floppy-save" aria-hidden="true"></span> Actualizar artículos</button><br> ' +
									'<button type="button" onClick="scanear()" class="btn btn-primary btn-lg btn-block"><span class="glyphicon glyphicon-barcode" aria-hidden="true"></span> Por código de barras</button>' +
									'<button type="button" onclick="ingresarCod()" class="btn btn-default btn-lg btn-block"><span class="glyphicon glyphicon-tag" aria-hidden="true"></span> Por código de artículo</button>');
		$('#DesDepo').html('<span class="label label-success" >' + desDepo + '</span>');
	}
	
	
}
function depInventario(){
    verificarWS('depInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar depurar una toma de inventario.');
    $('#tomaInventario').hide();$('#genInventario').hide();$('#configWS').hide();$('#helpNow').hide();$('#configurado').hide();$('#probarWS').hide();
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
    $('#tomaInventario').hide();$('#genInventario').hide();$('#depInventario').hide();$('#configWS').hide();$('#configurado').hide();$('#probarWS').hide();
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
	$('#tomaInventario').hide();$('#genInventario').hide();$('#depInventario').hide();$('#configWS').hide();$('#configurado').hide();
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
					console.log('Esta es la cantidad: ' + Response.Data.length);
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
	
	//var dateString = today.format("dd-m-yy");
    //alert('La fecha seleccionada es: '+ f);
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
		      "DESC_DEPOSITOS VARCHAR(60)," +
			  "CANTIDAD VARCHAR(10)," +
			  "FECHA DATE )";			  
	tx.executeSql(sql);
	console.log('Creé la tabla erp_inventario');

	//Creo la tabla ERP_ARTICULOS.
	tx.executeSql('DROP TABLE IF EXISTS ERP_ARTICULOS');
	var ERP_ARTICULOS = "CREATE TABLE IF NOT EXISTS ERP_ARTICULOS ( " +
						"id VARCHAR(50) PRIMARY KEY," +
						"DESCRIPCION VARCHAR(100), " + 
						"COD_BARRA VARCHAR(15) )";
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




//Función de conexión.
function validateConnection(){
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

	if(navigator.network.connection.type == Connection.WIFI){
			return true;
		}else{
			return false;
		}
}


//************* ARTICULOS *************	
	function CargoArticulos(){

		var hayWiFi = validateConnection();
		//var hayWiFi = true;
		if(hayWiFi == true){
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
		}else{
			alert('Tu dispositivo no está conectado a ninguna red WiFi. No podemos continuar.');
		}

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
								console.log('Esto es el COD_BARRA: '+ Response.Data[x]["COD_BARRA"]);

								recibi = Response.Data[x]["ID"];
							var existeONo = existeEnLaBase();

								//Valido si tengo el artículo en mi APP o no.
								if (existeONo == false){
									console.log('Como NO existe entro acá para insertar.');
									tx.executeSql("INSERT INTO ERP_ARTICULOS (id, DESCRIPCION, COD_BARRA) VALUES ('"+Response.Data[x]["ID"]+"', '"+Response.Data[x]["DESCRIPCION"]+"', '"+Response.Data[x]["COD_BARRA"]+"') ");
									var accion = 'sincronizado';
								}else{
									console.log('Como existe entro acá para updatear.');
									var accion = 'actualizado';
									tx.executeSql("UPDATE ERP_ARTICULOS SET id = '" + Response.Data[x]["ID"] + "', DESCRIPCION = '"+Response.Data[x]["DESCRIPCION"]+"', COD_BARRA = '"+Response.Data[x]["COD_BARRA"]+"' where id = '" + Response.Data[x]["ID"] + "' ");
								}

							}
							
						console.log("Cantidad insertada: "+ Response.Cantidad);
						$("#instala").html('<span class="label label-default">¡Genial! se han '+ accion + '  ' + Response.Data.length + ' registros.</span><br>');
						window.localStorage.setItem("fua_cli", Response.ItsGetDate);
						$("#instala").append('<span class="label label-success">Fecha de última actualización: ' + Response.ItsGetDate + '</span>');
						console.log('Fecha de última actualización:' + Response.ItsGetDate);							
						
						}						
						//$("#instala").fadeOut(9000);
					}else{						
						fua_cli = window.localStorage.getItem("fua_cli");
                        showAlert();
					
						//$("#instala").html('<span class="label label-info">Tenés el maestro de empresas actualizado</span><br>');
						//$("#instala").fadeOut(9000);
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

	//navigator.notification.alert("Error procesando SQL:" + err.code);
	alert('Artículos centralizados con éxito');
	//navigator.notification.alert('Artículos centralizados con éxito', alertCallback, 'Centralizador dice:', 'Aceptar');
	
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
	navigator.notification.alert('¡Excelente! ahora volvé a centralizar los artículos.', alertCallback, 'Centralizador dice:', 'Aceptar')
}	



/*
BUSCAR EMPRESAS
*/

function searchEmpresas(){
	var dbb = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
	dbb.transaction(searchEmp, errorDB);
}
function searchEmp(tx){
	var searchEmpresa = $("#searchclient").val();
	
	if(!searchEmpresa){
		alert('Tenés que ingresar un valor para iniciar la búsqueda de empresas');
		return;
	}
	
	console.log("Cargando clientes ::: "+searchEmpresa+" :::de la base de datos.");
	tx.executeSql('select * from erp_articulos where id like(\'%'+ searchEmpresa +'%\') or COD_BARRA like(\'%'+ searchEmpresa +'%\') ', [], searchEmpSuccess, errorDB);
}
function searchEmpSuccess(tx, results){
	if(results.rows.length == 0){
		var searchFail = $("#searchclient").val();
		console.log("No hay resultados para la busqueda (" + searchFail + ")seleccionada.");
		alert("No hay resultados para la busqueda (" + searchFail + ") seleccionada.");
	}else{	
	$("#erparticulos").hide();
	console.log('Oculto todos los resultos sin limpiar datos. Para no volver a cargarlos.');
	
	$("#erpempresassearch").html('');
	$("#erpempresassearch").show();
	console.log('Limpie los resultados anteriores y vuelvo a mostrar los resultados.');
	
		for(var x=0; x<results.rows.length; x++){
				var empresult = results.rows.item(x);
				//Muestro la sección del buscador.
				$("#googleEmp").show();
				//Limpio la sección de resultados del buscador.
				$("#erpempresassearch").show();
				//Grabo en la consola el estado de los resultados.
				console.log('Encontre esto: ' + empresult.DESCRIPCION);
			
				//Imprimo los resultados encontrados.
				$("#erpempresassearch").append('<button type="button" onclick="clickMeArticulos(\' '+ empresult.id + ' \', \' '+ empresult.DESCRIPCION +' \', \' '+ empresult.COD_BARRA + '\');" class="list-group-item"><span class="glyphicon glyphicon-user" aria-hidden="true"></span> '+ empresult.id +' - '+ empresult.DESCRIPCION +' ['+ empresult.COD_BARRA +'] </button>');
			}
	}	
}

/*
BUSCAR POR CÓDIGO; VALIDAR SI EXISTE Y GRABAR EN LA TOMA DE INVENTARIO.
*/

function ingresarCod(){
	var db = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
	db.transaction(searchArt, errorArtDB);
}
function searchArt(tx){
	var artContado = prompt("Ingresá el código de artículo", "");
	if (artContado != null){
		console.log('Ingreso algo distinto de NULL, parece un número, mirá: ' + artContado);
		Articulo = artContado;
		console.log("Buscando artículos => "+Articulo+" <= de la base de datos.");
		tx.executeSql('select * from erp_articulos where id ="'+ Articulo +'" ', [], searchCodSuccess, errorCodDB);	
	}else{
		console.log('Ingresó algo parecido a NULL: '+ artContado);
		Articulo = artContado;
	}	
}
function searchCodSuccess(tx, results){
	if(results.rows.length == 0){
		console.log("No hay resultados para la busqueda (" + Articulo + ")seleccionada.");
		alert("No hay resultados para la busqueda (" + Articulo + ") seleccionada.");
		loopTomaArt();
	}else{	
	console.log('Encontré dato, linea: 707');
	CantidadIngresada = prompt("Ingresá la cantidad para el artículo " + Articulo, "");
		if (CantidadIngresada == '') {
			console.log('No ingresaste ninguna cantidad. ¡Operación abortada!');
			alert('No ingresaste ninguna cantidad. ¡Operación abortada!');
		} else {
			var fechia = window.localStorage.getItem("fecha");
			var deposi = window.localStorage.getItem("deposito");
			var descripdepo = window.localStorage.getItem("des_dep");

			//validar si una variable es de tipo entero
			if (is_integer(CantidadIngresada)){
				console.log(CantidadIngresada + " es entero");
				tx.executeSql("insert into erp_inventario (fk_erp_articulos, fk_erp_depositos, desc_depositos, cantidad, fecha)values('" + Articulo + "','" + deposi + "', '" + descripdepo + "', '" + CantidadIngresada + "', '" + fechia + "') ", [], grabarSuccess, errorDB);
			}else{
				alert (CantidadIngresada + " no parece ser un número entero. Operación abortada.");
				loopTomaArt();
			}


		}
	}	
}

function grabarSuccess(){
	console.log('Exitos');
	console.log("inserté linea para migrar");
	console.log('Ingresaste el siguiente artículo: '+ Articulo + ' y la cantidad que contaste es ' + CantidadIngresada);
	alert('Ingresaste el siguiente artículo: '+ Articulo + ' y la cantidad que contaste es ' + CantidadIngresada);
	loopTomaArt();
}

function loopTomaArt(){
	ingresarCod();
}
function grabaArtiSuccess(){
	console.log('Exitos');
	console.log("inserté linea para migrar");
	console.log('Ingresaste el siguiente artículo: '+ Articulo + 'y la cantidad que contaste es ' + CantidadIngresada);			
	alert('Ingresaste el siguiente artículo: '+ Articulo + ' y la cantidad que contaste es ' + CantidadIngresada);
	}

function errorArtiDB(err){
	console.log('Errores a morir');
	console.log("Error al intentar grabar artículos por código: " + err.message);
	alert("Error al intentar grabar artículos por código: " + err.message);	
}
function errorCodDB(){
	alert('Error...errorCodDB().');
}
function errorArtDB(err){
	//alert('Errores.....errorArtDB().');
	console.log(err.message);
	alert(err.message);		
}


//Muestro el inventario de todolo conté hasta el momento.
function muestroTodo(){
	console.log('Acá vamos a mostrar todo lo que el tipo contó.');
	searchAll();

	function searchAll(){
		console.log('Arrancó la función searchAll');
		var dbe = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
		dbe.transaction(searchAllArt, errorDB);
	}
	function searchAllArt(tx){
		console.log('Arrancó la función searchAllArt');
		/*var codigo = $("#searchclient").val();
		if(!codigo){
			alert('Tenés que ingresar un valor para iniciar la búsqueda');
			return;
		}*/
		//console.log("Buscando código de artículo ::: "+codigo+" ::: de la base de datos de la aplicación.");
		tx.executeSql('select desc_depositos, fk_erp_articulos, cantidad from erp_inventario group by desc_depositos, fk_erp_articulos, cantidad', [], searchAllSuccess, errorDB);
	}


	function searchAllSuccess(tx, results){
		console.log('Arrancó la función searchEmpSuccess');
		if(results.rows.length == 0){
			var mns = 'No hay resultados guardados aún.';
			console.log(mns);
			alert(mns);
		}else{
			console.log('Arrancó la función searchAllEmpSuccess con datos');
			//$("#erparticulos").hide();
			console.log('Entro acá porque existen datos.');

			//Pongo visible el DIV que recibe los datos de todos los artículos.
			$("#todosloscontados").show();
			//$("#todosloscontados").show();
			$("#contadoLocal").html('');

			document.getElementById("searchclient").value='';

			for(var x=0; x<results.rows.length; x++){
				var empresult = results.rows.item(x);

				//Grabo en la consola el estado de los resultados.
				console.log('Encontre esto: ' + empresult.FK_ERP_ARTICULOS);

				var fa = window.localStorage.getItem("fecha");
				var deo = window.localStorage.getItem("deposito");
				var dd = window.localStorage.getItem("des_dep");

				$('#contadoLocal').append('<tr> ' +
										//'<td>' + empresult.ID + '</td>' +
										'<td>' + empresult.FK_ERP_ARTICULOS + '</td>' +
										'<td>' + empresult.DESC_DEPOSITOS +'</td>' +
										'<td>' + empresult.CANTIDAD +'</td>' +
									 '</tr>');
			}
		}
	}
}

//Limpiar el formulario de Todo lo Contado.

function cleanerTodo(){
	document.getElementById("searchclient").value='';
	$("#contadoLocal").html('');
	$("#todosloscontados").hide();
}



//Muestro el inventario filtrando por artículo o código de barra.
function muestroFiltrando(){
	console.log('Acá vamos a mostrar todo lo que el tipo contó filtrado por artículo');
	searchFilter();

	function searchFilter(){
		console.log('Arrancó la función searchFilter');
		var dbe = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
		dbe.transaction(searchAllArtFil, errorDB);
	}
	function searchAllArtFil(tx){
		console.log('Arrancó la función searchAllArtFill');
		var codigo = $("#searchclient").val();
		 if(!codigo){
		 alert('Tenés que ingresar un valor para iniciar la búsqueda');
		 return;
		 }
		console.log("Buscando este valor ::: "+codigo+" ::: de la base de datos de la aplicación.");
		tx.executeSql('select * from erp_inventario where FK_ERP_ARTICULOS like(\'%'+ codigo +'%\') ', [], searchAllFilSuccess, errorDB);
	}


	function searchAllFilSuccess(tx, results){
		console.log('Arrancó la función searchAllFilSuccess');
		if(results.rows.length == 0){
			var mns = 'No hay resultados guardados aún.';
			console.log(mns);
			alert(mns);
		}else{
			console.log('Arrancó la función searchAllEmpSuccess con datos');
			//$("#erparticulos").hide();
			console.log('Entro acá porque existen datos.');

			//Pongo visible el DIV que recibe los datos de todos los artículos.
			$("#todosloscontados").show();
			$("#contadoLocal").html('');

			for(var x=0; x<results.rows.length; x++){
				var empresult = results.rows.item(x);
				//Grabo en la consola el estado de los resultados.
				console.log('Encontre esto: ' + empresult.ID);

				var fa = window.localStorage.getItem("fecha");
				var deo = window.localStorage.getItem("deposito");
				var dd = window.localStorage.getItem("des_dep");
				$('#contadoLocal').append('<tr> ' +
					'<td>' + empresult.FK_ERP_ARTICULOS + '</td>' +
					'<td>' + empresult.DESC_DEPOSITOS +'</td>' +
					'<td>' + empresult.CANTIDAD +'</td>' +
					'</tr>');
			}
		}
	}
}

function enviarInventario(){

	var tienesWifi = validateConnection();
	//var tienesWifi = true;

	if(tienesWifi == true){
			if(confirm("¡Atención! estamos a punto de enviar a Itris toda la información que ingresaste. Una vez finalizado se borrará toda la info local. ¿Estás seguro que querés continuar?")){
				$('#leo2').show();
				sendAll();
			}else{
				alert('Ok, aquí no ha pasado nada.');
			}
	}else{
		alert('Tu dispositivo no está conectado a ninguna red Wi-Fi. Debés estar conectado para enviar datos.');
	}

}

function sendAll(){
	//alert('Ok comenzaremos a procesar el alta...');
	muestroTodoEnvio();
}

//Muestro el inventario de todolo conté hasta el momento.
function muestroTodoEnvio(){
	console.log('Acá vamos a mostrar todo lo que el tipo contó.');
	searchAllSend();

	function searchAllSend(){
		console.log('Arrancó la función searchAll');
		var dbe = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
		dbe.transaction(searchAllArtSend, errorDB);
	}
	function searchAllArtSend(tx){
		console.log('Arrancó la función searchAllArt');
		/*var codigo = $("#searchclient").val();
		 if(!codigo){
		 alert('Tenés que ingresar un valor para iniciar la búsqueda');
		 return;
		 }*/
		//console.log("Buscando código de artículo ::: "+codigo+" ::: de la base de datos de la aplicación.");
		tx.executeSql('select * from erp_inventario', [], searchAllSuccessSend, errorDB);
	}


	function searchAllSuccessSend(tx, results){
		console.log('Arrancó la función searchEmpSuccess');
		if(results.rows.length == 0){
			$('#leo2').hide();
			var mns = 'No hay resultados guardados aún.';
			console.log(mns);
			alert(mns);
		}else{
			console.log('Arrancó la función searchAllSuccessSend con datos');
			//$("#erparticulos").hide();
			console.log('Entro acá porque existen datos.');

			//Pongo visible el DIV que recibe los datos de todos los artículos.
			$("#sync").show();
			//$("#todosloscontados").show();
			$("#sync").html('');

			document.getElementById("searchclient").value='';

			var fa = window.localStorage.getItem("fecha");
			var deo = window.localStorage.getItem("deposito");
			var dd = window.localStorage.getItem("des_dep");
			myArrClone = [];
			for(var x=0; x<results.rows.length; x++){
				var invResult = results.rows.item(x);

				//Grabo en la consola el estado de los resultados.
				console.log('Encontre esto: ' + invResult.ID);

				//myArrClone.push( 'ID:'+invResult.ID +';'+'FK_ERP_ARTICULOS:'+invResult.FK_ERP_ARTICULOS+';FK_ERP_DEPOSITOS:'+invResult.FK_ERP_DEPOSITOS+';CANTIDAD:'+invResult.CANTIDAD+';FECHA:'+invResult.FECHA+' ' );
				myArrClone.push({"Datos":{"id":invResult.ID,"articulo":invResult.FK_ERP_ARTICULOS, "deposito":invResult.FK_ERP_DEPOSITOS,"cantidad":invResult.CANTIDAD,"fecha":invResult.FECHA}});
			}
			console.log(myArrClone);
			var myJsonString = JSON.stringify(myArrClone);
			//console.log(myJsonString);
			EnvioTodo(myJsonString);
		}
	}
}

/* Testeo la conexión */
function EnvioTodo(a){
	var a;
	console.log('Estoy enviando esto: '+a);

	ws = window.localStorage.getItem("ws");
	console.log('WS: '+ws);
	db = window.localStorage.getItem("db");
	console.log('Base de datos: '+db);
	user = window.localStorage.getItem("user");
	console.log('Usuario: '+user);
	pass = window.localStorage.getItem("pass");
	console.log('Pass: '+pass);

	$.getJSON("http://leocondori.com.ar/app/inventario/enviarinventario.php", {string:  a , ws: ws, db: db, user: user, pass: pass}, resultConnInv, "json");
}

/* Función captura la respuesta del testeo de conexión */
function resultConnInv(respuesta){
	if (respuesta.valor == 0){
		$('#leo2').hide();
		//alert('Esta es la cantidad que llegó: '+respuesta.cantidad);
		//alert('Conexión creada con éxito: '+respuesta.contenido);
		//alert('Esta es la fecha: '+respuesta.fecha);
		//alert('Usaste este WS: '+respuesta.ws);
		//alert('Esta es la base: '+respuesta.db);
		//alert('Con este usuario: '+respuesta.user);
		//alert('Con esta pass: '+respuesta.pass);
		//alert('Este es el resultado del LogOut: '+respuesta.LogOut);
		//alert('Estos son los ID que no pasaron, ojo: '+respuesta.iderr);
		//var myJsonError = JSON.stringify(respuesta.iderr);
		//alert(respuesta.iderr);
		//alert(myJsonError);
		var jsonResul = isEmptyJSON(respuesta.OutPutJson);
		console.log('Esta vacío si o no '+jsonResul);

		if (jsonResul==false){
			alert('La sincronización terminó pero con algunos errores.');
			$('#syncro').show();

			$('#titleerro').html('<div class="alert alert-success" role="alert">'+respuesta.CantidadOk+' registros ingresados correctamente.</div>'+
				'<div class="alert alert-danger" role="alert">Existieron '+respuesta.OutPutJson.length+' errores en la exportación</div>'+
				'<button type="button" onclick="DepurarTodos()" class="btn btn-warning"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Depurar</button>'+
				'<br>');
			$('#soloerror').show();
			errorglobales = JSON.stringify(respuesta.OutPutJson);

			for(var x=0; x<respuesta.OutPutJson.length; x++) {
				//Grabo en la consola el estado de los resultados.
				console.log('Esto es el ID: ' + respuesta.OutPutJson[x]["ID"]);
				console.log('Esto es el Motivo: ' + respuesta.OutPutJson[x]["Motivo"]);

				$('#LogError').append('<tr> ' +
					'<td>' + respuesta.OutPutJson[x]["ID"] + '</td>' +
					'<td>' + respuesta.OutPutJson[x]["Articulo"] + '</td>' +
					'<td>' + respuesta.OutPutJson[x]["Cantidad"] + '</td>' +
					'<td>' + respuesta.OutPutJson[x]["Motivo"] + '</td>' +
					'</tr>');
			}

		}else{
			alert('¡Excelente! la sincronización ha finalizado con éxito.');
			$('#syncro').show();
			$('#soloerror').hide();
			$('#titleerro').html('<div class="alert alert-success" role="alert">'+respuesta.CantidadOk+' registros ingresados correctamente.</div>'+
				'<br>');
			setTimeout(function() {
				$("#titleerro").fadeOut(1500);
			},9000);

			for(var y=0; y<respuesta.InsertOK.length; y++) {
				//Grabo en la consola el estado de los resultados.
				console.log('Esto es el ID: ' + respuesta.InsertOK[y]["ID"]);
				limpiarmigrado(respuesta.InsertOK[y]["ID"]);
			}

		}



	}else{
		alert('Ocurrió un error '+respuesta.valor);
		alert('Por este motivo: '+respuesta.motivo);
	}
}

//Función para borrar todos los registros migrados con éxito.
function limpiarmigrado(a){
	var a;
	console.log('Se activó la función limpiarmigrado() y se procede a borrar este ID: '+a);
	//Borro los datos de la tabla.
	var db = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
	db.transaction(function(tx) {
		tx.executeSql("delete from erp_inventario where ID='"+a+"' ");
	}, errorBorrar, successBorrar);


}
function errorBorrar(err){
	console.log("Error procesando SQL:" + err.code);
	alert("Error procesando SQL:" + err.code + '-' + err.message);
}

function successBorrar(){
	console.log("Borré los datos insertados en ITRIS.");
	//navigator.notification.alert('¡Excelente! los registros que fueron insertados en Itris fueron depurados de este dispositivo.', alertCallback, 'Itris inventario dice:', 'Aceptar');
}


//Función para depurar la tabla Toma de inventario, que son los registros que tienen errores.

function DepurarTodos(){
	if(confirm("Está apunto de eliminar todos los datos erróneos. ¿Continuar?") ){
		DepurarTodo();
	}else{
		alert('Ok, recuerde que estos datos permanecerán guardados en su dispositivo. No podrá podrá modificarlos.');
	}
}
function DepurarTodo(){
	console.log('Se activó la función DepurarTodo() y se procede limpiar la tabla ERP_INVENTARIO.');

	//Borro los datos de la tabla.
	var db = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
	db.transaction(function(tx) {
		tx.executeSql("delete from erp_inventario");
	}, errorDepurar, successDepurar);

	console.log('Mirá todos los errores llegaron hasta acá: '+errorglobales);

	enviarmail(errorglobales);

	$('#syncro').html('<hr><div class="alert alert-success" role="alert"><p><b>Depuramos el inventario con éxito.</b></p></div>');
	setTimeout(function() {
		$("#syncro").fadeOut(1500);
	},9000);
}
function errorDepurar(err){
	console.log("Error procesando SQL:" + err.code);
	alert("Error procesando SQL:" + err.code + '-' + err.message);
}

function successDepurar(){
	console.log("Tabla de inventario depurada con éxito.");
	//navigator.notification.alert('¡Excelente! los registros que fueron insertados en Itris fueron depurados de este dispositivo.', alertCallback, 'Itris inventario dice:', 'Aceptar');
}

//Enviar Mail
function enviarmail(m){
	var m;
	console.log('Estoy enviando esto por mail: '+m);

	ws = window.localStorage.getItem("ws");
	console.log('WS: '+ws);
	db = window.localStorage.getItem("db");
	console.log('Base de datos: '+db);
	user = window.localStorage.getItem("user");
	console.log('Usuario: '+user);
	pass = window.localStorage.getItem("pass");
	console.log('Pass: '+pass);

	$.getJSON("http://leocondori.com.ar/app/inventario/enviarerrores.php", {errores:  m , ws: ws, db: db, user: user, pass: pass}, resultEnvMail, "json");
}

function resultEnvMail(respuesta){
	console.log('Este es el resultado del json '+respuesta.valor);
	console.log('Este es el resultado del json '+respuesta.msn);
	if (respuesta.valor == 0){
		$('#syncro').append('<div class="alert alert-success" role="alert"><p><b>'+respuesta.msn+'</b></p></div>');
		setTimeout(function() {
			$("#syncro").fadeOut(1500);
		},15000);
	}else{
		console.log(respuesta.msn);
		$('#syncro').append('<div class="alert alert-danger" role="alert"><p><b>'+respuesta.msn+'</b></p></div>');
		setTimeout(function() {
			$("#syncro").fadeIn(1500);
		},15000);
	}
}


//Función para verificar si el artículo recibido por JSON es para insertar o para actualizar.
function existeEnLaBase(){
	console.log('Vamos a ver si insertamos o modificamos.');
	searchFilterExiste();

	function searchFilterExiste(){
		console.log('Arrancó la función searchFilterExiste');
		var dbe = openDatabase("ERPITRISINV", "1.0", "TomaInventario", 200000);
		dbe.transaction(searchAllArtFilExiste, errorExisteDB);
	}
	function searchAllArtFilExiste(tx){
		console.log('Arrancó la función searchAllArtFillExiste');

		var codigo = recibi;
		console.log('Recibí esto para consultar ' + codigo);
		console.log("Buscando este valor ::: " + codigo + " ::: de la base de datos de la aplicación para saber si modifico o agrego.");
		tx.executeSql("select * from ERP_ARTICULOS where id = '" + codigo + "' ", [], searchAllFilExisteSuccess, errorExisteDB);
	}

	function searchAllFilExisteSuccess(tx, results){
		console.log('Arrancó la función searchAllFilExisteSuccess');
		if(results.rows.length == 0){
			var mns = 'No está tenés que insertar.';
			console.log(mns);
			return false;
		}else{
			console.log('Arrancó la función searchAllFilExisteSuccess porque el ID ya existe');

			console.log('Entro acá porque el ID ya existe.');
			return true;
		}
	}
}

function errorExisteDB(){
	console.log("Error procesando SQL:"  + err.code + '-' + err.message);
	alert("Error procesando SQL=> "  + err.code + '-' + err.message);
}