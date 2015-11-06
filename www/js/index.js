var existe_db;
var db;

function OnBodyLoad(){
	console.log("Ejecuté el onBodyLoad");	
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady(){
	
	existe_db = window.localStorage.getItem("existe_db");	
	
	db = window.openDatabase("ERPITRIS", "1.0", "Pedidos Offline", 200000);
	
	if(existe_db == null){
	    console.log("la BD es null");
		creaDB();
	}else{
		console.log("la BD está definida");
		cargaDatos();
	}

	//Habilita la función del botón atrás.
	document.addEventListener("backbutton", onBackKeyDown, false);	

	//Habilita la función del botón menú.
	document.addEventListener("menubutton", onMenuKeyDown, false);
	
	//Depuro los pedidos para migrar
	depuraIniDatos();
	
}//Fin OnReadyDevice


function codBarras(){
	window.plugins.barcodeScanner.scan( function(result) {
			alert("We got a barcode\n" +
					"Result: " + result.text + "\n" +
					"Format: " + result.format + "\n" +
					"Cancelled: " + result.cancelled);
		}, function(error) {
			alert("Scanning failed: " + error);
					}
		);
}


function creaDB(){
	console.log('Se ejecutó crearDB');
}

function cargaDatos(){
	console.log('Se ejecutó cargarDatos');
}

function depuraIniDatos(){
	console.log('Se ejecutó depurarIniDatos');
}

function onBackKeyDown() {
            if( confirm("Realmente desea salir de la aplicación? Para navegar por esta app utilice los enlaces internos.") )
            {
                  navigator.app.exitApp();
            }
}

function onMenuKeyDown(){
	console.log('Se ejecutó depurarIniDatos');
}

/* Inicializo la función codigo de barras */