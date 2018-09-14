<?php
    $userName = $_POST['userName'];
    $jsonStr = $_POST['jsonStr'];
	// $json = json_encode($jsonStr);
	
	$idStr = md5(uniqid(rand()));
	$file = fopen($idStr. '.json','w+');
	fwrite($file,$jsonStr);
	fclose($file);


    $raw_success = array('code' => 1,'idStr' => $idStr, 'msg' => '保存成功');
    $res_success = json_encode($raw_success);

    $raw_fail = array('code' => 0, 'msg' => '保存失败');
    $res_fail = json_encode($raw_fail);

    echo $res_success;
?>