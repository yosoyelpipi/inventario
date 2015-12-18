<?php
ini_set('max_execution_time', 900);

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
	}else{
		$login = $client->call('ItsLogin', array('DBName' => $bd, 'UserName' => $user, 'UserPwd' => $pass, 'LicType'=>'WS') );			
		$error = $login['ItsLoginResult'];
		$session = $login['UserSession'];
		if($error){
					$LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
					 $err = utf8_encode($LastErro['Error']);
					echo json_encode(array("ItsLoginResult"=>$error, "motivo"=>$err));
				}else{
				$empresas = $client->call('ItsGetData', array('UserSession' => $session, 'ItsClassName' => 'ERP_ARTICULOS', 'RecordCount' => '-1', 'SQLFilter'=>"VENTA = '1' and HABILITADO='1'and TIPO = 'P' and FEC_ULT_ACT > '".$fua."' ", 'SQLSort'=> '') );
				$ItsGetDataResult = $empresas["ItsGetDataResult"];
				$DataEmpresas = $empresas["XMLData"];

					if($ItsGetDataResult){
								$LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
								$err = utf8_encode($LastErro['Error']);
								echo json_encode(array("ItsGetDataResult"=>$ItsGetDataResult, "motivo"=>$err));
							}else{
								$erp_empresas=simplexml_load_string($DataEmpresas) or die("Error: No puedo crear objeto de articulos.");
								$array = json_decode( json_encode($erp_empresas) , 1);
								//Ahora comienzo a recorrer el XML para mostrar los atributos por pantalla.
								$langs = $array['ROWDATA']['ROW'];
								$count = sizeof($langs);
								if($count==''){$counts=0;}

					for ($i=0; $i<sizeof($langs); $i++){
							if($count == 1){
							$des_art = str_replace("'", "", $langs['@attributes']['DESCRIPCION']);	
							$datos = array('ID'=>$langs['@attributes']['ID'],'DESCRIPCION'=>$des_art);
							}else{
							$des_art = str_replace("'", "", $langs['@attributes']['DESCRIPCION']);	
							$datos = array('ID'=>$langs[$i]['@attributes']['ID'],'DESCRIPCION'=>$des_art);
							}									
									$salida[] = $datos;
								}
								echo json_encode(array("ItsLoginResult"=>$ItsGetDataResult, "ItsGetDate"=>$ItsGetDate, "Cantidad"=>$counts, "Data"=>$salida));
								$LogOut = $client->call('ItsLogout', array('UserSession' => $session) );
							}
				}		
		
	}
?>