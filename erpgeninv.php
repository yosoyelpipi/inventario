<?php
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("America/Argentina/Buenos_Aires");
$ItsGetDate = date("Y/m/d H:i:s");
require_once('lib/nusoap.php');

$ws = $_GET["ws"];
$bd = $_GET["base"];
$user = $_GET["usuario"];
$pass = $_GET["pass"];
//$fua = $_GET["fua_pre"];

/*
$ws = "http://200.55.245.171:3000/ITSWS/ItsCliSvrWS.asmx?WSDL";
$bd = "LM_10_09_14";
$user = "administrador";
$pass = "12348";
$fua = '';
*/
$client = new nusoap_client($ws,true);
	$sError = $client->getError();
	if ($sError) {
		echo json_encode(array("ItsLoginResult"=>1, "motivo"=>"No se pudo conectar al WebService indicado."));	
		//echo '<span class="label label-danger"> No se pudo realizar la conexión '.$sError.'</span>';
	}else{
		$login = $client->call('ItsLogin', array('DBName' => $bd, 'UserName' => $user, 'UserPwd' => $pass, 'LicType'=>'WS') );			
		$error = $login['ItsLoginResult'];
		$session = $login['UserSession'];

		if($error){
					$LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
					$err = utf8_encode($LastErro['Error']);
					echo json_encode(array("ItsLoginResult"=>$error, "motivo"=>$err));
				}else{
					//echo json_encode(array("ItsLoginResult"=>$error, "session"=>$session));
				$empresas = $client->call('ItsGetData', array('UserSession' => $session, 'ItsClassName' => 'ERP_GEN_INV', 'RecordCount' => '-1', 'SQLFilter'=>'' , 'SQLSort'=> '') );
				$ItsGetDataResult = $empresas["ItsGetDataResult"];
				$DataEmpresas = $empresas["XMLData"];

					if($ItsGetDataResult){
								$LastErro = $client->call('ItsGetLastError', array('UserSession' => $session) );
								$err = utf8_encode($LastErro['Error']);
								echo json_encode(array("ItsLoginResult"=>$ItsGetDataResult, "motivo"=>$err));
							}else{
								$erp_empresas=simplexml_load_string($DataEmpresas) or die("Error: Cannot create object");
								$array = json_decode( json_encode($erp_empresas) , 1);
								//Ahora comienzo a recorrer el XML para mostrar los atributos por pantalla.
								$langs = $array['ROWDATA']['ROW'];
								$count = sizeof($langs);
								if($count==''){$counts=0;} 
								for ($i=0; $i<sizeof($langs); $i++) {							
if($count == 1){
				$cadena = $langs['@attributes']['Z_FK_ERP_DEPOSITOS'];
				$des_dep = str_replace("'", "", $cadena);	
$datos = array('FECHA'=>$langs['@attributes']['FECHA'],'FK_ERP_DEPOSITOS'=>$langs['@attributes']['FK_ERP_DEPOSITOS'],'DES_DEP'=>$des_dep );
}else{
									$cadena = $langs[$i]['@attributes']['Z_FK_ERP_DEPOSITOS'];
									$des_dep = str_replace("'", "", $cadena);
$datos = array('FECHA'=>$langs[$i]['@attributes']['FECHA'],'FK_ERP_DEPOSITOS'=>$langs[$i]['@attributes']['FK_ERP_DEPOSITOS'],'DES_DEP'=>$des_dep );
}									
								$salida[] = $datos;
								}
								echo json_encode(array("ItsLoginResult"=>$ItsGetDataResult, "ItsGetDate"=>$ItsGetDate, "Cantidad"=>$counts, "Data"=>$salida));
								$LogOut = $client->call('ItsLogout', array('UserSession' => $session) );
							}
				}				
	}
?>