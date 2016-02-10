<?php
/**
 * Created by PhpStorm.
 * User: Leo
 * Date: 7/2/2016
 * Time: 11:53 AM
 */

ini_set('max_execution_time', 99000);
ini_set('memory_limit', '-1');
ini_set('max_input_vars','-1');

//Función para ser usada para grabar los archivos que vayan entregando los métodos de Itris.
function GrabarXML($XMLData,$nombre){
    $now = date('Ymd-H-i-s');
    $fp = fopen($nombre.$now.".xml", "a");
    fwrite($fp, $XMLData. PHP_EOL);
    fclose($fp);
}

//Función para ser usada para grabar los archivos que vayan entregando los métodos de Itris.
function GrabarTXT($String,$name){
    $now = date('Ymd-H-i-s');
    $fpt = fopen($name.".log", "a");
    fwrite($fpt, $String. PHP_EOL);
    fclose($fpt);
}

header("Access-Control-Allow-Origin: *");
date_default_timezone_set("America/Argentina/Buenos_Aires");
$ItsGetDate = date("Y/m/d H:i:s");
require_once('lib/nusoap.php');

//Datos de Conexión del WS

$ws = $_GET["ws"];
$db = $_GET["db"];
$user = $_GET["user"];
$pass = $_GET["pass"];

$todo='';
$iderr='';
$todOK='';
/*
$ws= "http://itris.no-ip.com:3000/ITSWS/ItsCliSvrWS.asmx?WSDL";
$db="TOMA_INVENTARIO";
$user="lcondori";
$pass="123";
*/
//Recibo todo el inventario en un JSON
$Strings = $_GET["string"];
//$Strings= '[{"Datos":{"id":1,"articulo":"0000013","deposito":"1","cantidad":"5","fecha":20151209}},{"Datos":{"id":2,"articulo":"0000013","deposito":"1","cantidad":"8","fecha":20151209}},{"Datos":{"id":3,"articulo":"0000013","deposito":"1","cantidad":"6","fecha":20151209}},{"Datos":{"id":4,"articulo":"0000013","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":5,"articulo":"0000013","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":6,"articulo":"0000013","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":7,"articulo":"0000013","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":8,"articulo":"0000013","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":9,"articulo":"0000013","deposito":"1","cantidad":"9","fecha":20151209}},{"Datos":{"id":10,"articulo":"0000013","deposito":"1","cantidad":"6","fecha":20151209}},{"Datos":{"id":11,"articulo":"0000013","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":12,"articulo":"0000013","deposito":"1","cantidad":"8","fecha":20151209}},{"Datos":{"id":13,"articulo":"0000013","deposito":"1","cantidad":"77","fecha":20151209}},{"Datos":{"id":14,"articulo":"0000013","deposito":"1","cantidad":"88","fecha":20151209}},{"Datos":{"id":15,"articulo":"0002222","deposito":"1","cantidad":"1","fecha":20151209}},{"Datos":{"id":16,"articulo":"0002222","deposito":"1","cantidad":"1","fecha":20151209}},{"Datos":{"id":17,"articulo":"0022200222","deposito":"1","cantidad":"1","fecha":20151209}},{"Datos":{"id":18,"articulo":"0022200222","deposito":"1","cantidad":"1","fecha":20151209}},{"Datos":{"id":19,"articulo":"01050100","deposito":"1","cantidad":"33","fecha":20151209}},{"Datos":{"id":20,"articulo":"01310340","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":21,"articulo":"01310340","deposito":"1","cantidad":"null","fecha":20151209}},{"Datos":{"id":22,"articulo":"01310340","deposito":"1","cantidad":"55","fecha":20151209}},{"Datos":{"id":23,"articulo":"01310340","deposito":"1","cantidad":"","fecha":20151209}},{"Datos":{"id":24,"articulo":"01310340","deposito":"1","cantidad":"","fecha":20151209}},{"Datos":{"id":25,"articulo":"010540010400001","deposito":"1","cantidad":"","fecha":20151209}},{"Datos":{"id":26,"articulo":"0000661","deposito":"1","cantidad":"","fecha":20151209}},{"Datos":{"id":27,"articulo":"0000661","deposito":"1","cantidad":"33","fecha":20151209}},{"Datos":{"id":28,"articulo":"0000014","deposito":"1","cantidad":"77","fecha":20151209}},{"Datos":{"id":29,"articulo":"0000661","deposito":"1","cantidad":"444","fecha":20151209}}]';

//Lo decodifico y obtengo un array.
$String = json_decode($Strings);

//Cuento los resultados, pero por ahora no hago nada. solo guardo en la variable $resultados para pasarlo por el JSON al cliente, pero nada más.
$resultados = count($String);

$client = new nusoap_client($ws,true);
$sError = $client->getError();
if ($sError) {
    echo json_encode(array("valor"=>1, "motivo"=>"No se pudo conectar al WebService indicado."));
}else{
    $login = $client->call('ItsLogin', array('DBName' => $db, 'UserName' => $user, 'UserPwd' => $pass, 'LicType'=>'WS') );
    $error = $login['ItsLoginResult'];
    $session = $login['UserSession'];
    if($error){
        $LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
        $err = utf8_encode($LastErro['Error']);
        echo json_encode(array("valor"=>$error, "motivo"=>$err));
    }else {
        //Recorro el array
        for ($i = 0; $i < count($String); $i++) {

            $ItsPrepareAppend = $client->call('ItsPrepareAppend', array('UserSession' => $session, 'ItsClassName' => 'ERP_CON_INV'));
            $ItsPrepareAppendResult = $ItsPrepareAppend ["ItsPrepareAppendResult"];

        //Debo controlar si el ItsPrepareAppend se ejecutó correctamente.
        if ($ItsPrepareAppendResult <> 0) {
            //Si es distinto de 0 (cero) entonces campturo el último error mediante el método ItsGetLastError.

            //Este método recibe un parámetro; la variable de la sesión.
            $LastErro = $client->call('ItsGetLastError', array('UserSession' => $session));

            //Me guardo el resultado en una variable.
            $resp = utf8_encode($LastErro['Error']);

            //Muestro el error por pantalla.
            //echo json_encode(array("valor" => $ItsPrepareAppendResult, "motivo" => $resp));
            GrabarTXT($resp,'ItsExceptions');
        } else {
            $XMLData = $ItsPrepareAppend["XMLData"];
            //GrabarXML($XMLData,'ERP_CON_INV.XML');

            //DataSession: Me devuelve un string con los datos de sessión del usuario y la clase a modificar.
            $DataSession = $ItsPrepareAppend["DataSession"];

            $ITS = new SimpleXMLElement($XMLData);

            //Grabo la variable.
            $ITS->ROWDATA->ROW['FECHA'] = $String[$i]->Datos->fecha;
            $ITS->ROWDATA->ROW['FK_ERP_ARTICULOS'] = $String[$i]->Datos->articulo;
            $ITS->ROWDATA->ROW['FK_ERP_DEPOSITOS'] = $String[$i]->Datos->deposito;
            $ITS->ROWDATA->ROW['CANTIDAD'] = $String[$i]->Datos->cantidad;
            //Lo grabo y lo asigno en una variable.
            $iXMLData = $ITS->asXML();

            //Ahora envío las modificaciones correspondientes. Usando el Método ItsSetData, que recibe 3 (tres) parámetros.
            $ItsSetData = $client->call('ItsSetData', array('UserSession' => $session, 'DataSession' => $DataSession, 'iXMLData' => $iXMLData));
            $ItsSetDataResult = $ItsSetData["ItsSetDataResult"];
            if ($ItsSetDataResult <> 0) {
                $LastErro = $client->call('ItsGetLastError', array('UserSession' => $session));
                //Me guardo el resultado en una variable.
                $resp = utf8_encode($LastErro['Error']);
                //echo json_encode(array("valor" => $ItsSetDataResult, "motivo" => $resp));
                GrabarTXT($resp,'ItsExceptions');
            } else {
                $oXMLData = $ItsSetData["oXMLData"];
                //Ahora acepto los cambios, y guardo el pedido.
                $ItsPost = $client->call('ItsPost', array('UserSession' => $session, 'DataSession' => $DataSession));
                $ItsPostResult = $ItsPost["ItsPostResult"];
                if ($ItsPostResult <> 0) {//Si es distinto de 0 (cero) entonces campturo el último error mediante el método ItsGetLastError.
                    //Este método recibe un parámetro; la variable de la sesión.
                    $LastErro = $client->call('ItsGetLastError', array('UserSession' => $session));
                    //Me guardo el resultado en una variable.
                    $resp = utf8_encode($LastErro['Error']);
                    $todo.= $ItsGetDate." WS: ".$ws." | Usuario: ".$user." | Articulo: ".$String[$i]->Datos->articulo." Cantidad:".$String[$i]->Datos->cantidad." Motivo:".$resp. PHP_EOL;
                    $iderr.='{"idError":{"id":"'.$String[$i]->Datos->articulo.'","motivo":"'.$resp.'}}';
                    $ArrayError=array('ID'=>$String[$i]->Datos->id,'Motivo'=>$resp);
                     //$datos = array('ID'=>$langs['@attributes']['ID'],'DESCRIPCION'=>$des_art,'COD_BARRA'=>$langs['@attributes']['COD_BARRA']);
                    $salida[] = $ArrayError;
                }else{
                    $todOK.= $ItsGetDate." WS: ".$ws." | Usuario: ".$user." | Articulo: ".$String[$i]->Datos->articulo." Cantidad:".$String[$i]->Datos->cantidad. PHP_EOL;
                }

            }
        }
    }//Fin del bucle for
        $ItsLogOut = $client->call('ItsLogout', array('UserSession' => $session));
        $ItsLogOutResult = $ItsLogOut["ItsLogoutResult"];
        GrabarTXT($todo,'ItsExceptions');
        GrabarTXT($todOK,'ItsClientAsync');
        $out = json_encode($salida);
        GrabarTXT($out,'arraysalida');
        echo json_encode(array("valor" => 0, "contenido" => $Strings, "cantidad" => $resultados, "fecha" => $ItsGetDate, "ws" => $ws, "db" => $db, "user" => $user, "pass" => $pass, "iderr"=>$iderr, "OutPutJson"=>$salida,"LogOut" => $ItsLogOutResult));
    }
}

?>