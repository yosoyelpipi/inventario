<?php
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

$ws = $_GET["ws"];
$bd = $_GET["base"];
$user = $_GET["usuario"];
$pass = $_GET["pass"];
$fua = $_GET["fua_cliente"];

/*
$ws = "http://itris.no-ip.com:3000/ITSWS/ItsCliSvrWS.asmx?WSDL";
$bd = "TOMA_INVENTARIO";
$user = "lcondori";
$pass = "123";
$fua = '';
*/
$client = new nusoap_client($ws,true);
	$sError = $client->getError();
	if ($sError) {
		echo json_encode(array("ItsLoginResult"=>1, "motivo"=>"No se pudo conectar al WebService indicado."));
		$texto = $ItsGetDate.' - '.$ws.' | '.$user.' | No se pudo conectar al WebService indicado.';
		GrabarTXT($texto,"ItsExceptions");
	}else{
		$login = $client->call('ItsLogin', array('DBName' => $bd, 'UserName' => $user, 'UserPwd' => $pass, 'LicType'=>'WS') );			
		$error = $login['ItsLoginResult'];
		$session = $login['UserSession'];
		if($error<>0){
					$LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
					 $err = utf8_encode($LastErro['Error']);
					echo json_encode(array("ItsLoginResult"=>$error, "motivo"=>$err));
					$texto = $ItsGetDate.' - '.$ws.' | '.$user.' | '.$err;
					GrabarTXT($texto,"ItsExceptions");
				}else{
				$empresas = $client->call('ItsGetData', array('UserSession' => $session, 'ItsClassName' => '_ERP_ARTICULOS_APP', 'RecordCount' => '3000', 'SQLFilter'=>"FEC_ULT_ACT > '".$fua."' ", 'SQLSort'=> '') );
				$ItsGetDataResult = $empresas["ItsGetDataResult"];
				$DataEmpresas = $empresas["XMLData"];

					if($ItsGetDataResult<>0){
								$LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
								$err = utf8_encode($LastErro['Error']);
								echo json_encode(array("ItsGetDataResult"=>$ItsGetDataResult, "motivo"=>$err));
								$texto = $ItsGetDate.' - '.$ws.' | '.$user.' | '.$err;
								GrabarTXT($texto,"ItsExceptions");
							}else{
							//GrabarXML($DataEmpresas, 'empresas');
								$erp_empresas=simplexml_load_string($DataEmpresas) or die("Error: No puedo crear objeto de articulos.");
								$array = json_decode( json_encode($erp_empresas) , 1);
								//Ahora comienzo a recorrer el XML para mostrar los atributos por pantalla.
								$langs = $array['ROWDATA']['ROW'];
								$count = sizeof($langs);
								if($count==''){$counts=0;}else{$counts=$count;}

					for ($i=0; $i<sizeof($langs); $i++){
							if($count == 1){
								$des_art = str_replace("'", "", $langs['@attributes']['DESCRIPCION']);	
								$datos = array('ID'=>$langs['@attributes']['ID'],'DESCRIPCION'=>$des_art,'COD_BARRA'=>$langs['@attributes']['COD_BARRA']);
							}else{
								$des_art = str_replace("'", "", $langs[$i]['@attributes']['DESCRIPCION']);	
								$datos = array('ID'=>$langs[$i]['@attributes']['ID'],'DESCRIPCION'=>$des_art,'COD_BARRA'=>$langs[$i]['@attributes']['COD_BARRA']);
							}									
									$salida[] = $datos;
								}
								echo json_encode(array("ItsLoginResult"=>$ItsGetDataResult, "ItsGetDate"=>$ItsGetDate, "Cantidad"=>$counts, "Data"=>$salida));
								$texto = $ItsGetDate.' - '.$ws.' | '.$user.' | '.$salida;
								GrabarTXT($texto,"ItsClientAsync");
								$LogOut = $client->call('ItsLogout', array('UserSession' => $session) );
							}
				}		
		
	}
?>