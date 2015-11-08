/* global $ */
var ws;
var db;
var user;
var pass;

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
        verificarWS('configurado', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS para comenzar.');
    }   
};


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
        //Si no, pues ejecuta la función error.
        function (error) {
            notificacion("Ha ocurrido un error al escanear.");
        }
    );
};

//Verifico si el usuario definió o no el WS
function verificarWS(c,m){
    
    if ((!ws) || (!db) || (!user) || (!pass) ){
        console.log('no definiste el ws, por lo tanto no puedo mostrar el div '+ c);
        $('#error').show();
        $('#mgnalert').html('<p class="lead">'+ m +'</p>');
    }else{
        console.log('ok si esta definido.');
        $('#'+ c +'').show();
    } 
}

function genInventario(){
    verificarWS('genInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar generar una toma de inventario.');
}
function tomaInventario(){
    verificarWS('tomaInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelvé toma de inventario.');
}
function depInventario(){
    verificarWS('depInventario', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar depurar una toma de inventario.');
}
function configWS(){
    console.log('Muenstro la configuración de WS.');
    //verificarWS('configInven', 'No tenés configurado los parámetros de conexión. Andá a la sección Parámetros/Configurar WS y vuelve a intentar generar una toma de inventario.');
}
function helpNow(){
    console.log('Muestro la ayuda.');
}