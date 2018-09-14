<?php
    $raw_success = array('code' => 1, 'msg' => '成功' ,'idStr' => 'α17°42′δ28°59′' ,'jsonStr' =>'{"name":"星系名称1","position":[[17,42],[28,59]],"owner":"探索者1","content":[{"sun":{"name":"恒星名称1","position":[-500,0],"owner":"探索者1","radius":120},"stars":[{"name":"星球名称1","position":[79,11],"owner":"探索者1","radius":20,"materialNum":12,"speed":2},{"name":"星球名称2","position":[130,36],"owner":"探索者2","radius":4,"materialNum":2,"speed":10},{"name":"星球名称3","position":[190,110],"owner":"探索者3","radius":5,"materialNum":4,"speed":1},{"name":"星球名称4","position":[290,120],"owner":"探索者4","radius":17,"materialNum":7,"speed":17},{"name":"","position":[580,180],"owner":"","radius":31,"materialNum":9,"speed":25},{"name":"","position":[800,210],"owner":"","radius":9,"materialNum":17,"speed":26},{"name":"","position":[1100,220],"owner":"","radius":21,"materialNum":27,"speed":40},{"name":"","position":[1500,260],"owner":"","radius":32,"materialNum":37,"speed":30},{"name":"","position":[1800,330],"owner":"","radius":29,"materialNum":44,"speed":10},{"name":"","position":[1900,350],"owner":"","radius":27,"materialNum":51,"speed":50}]},{"sun":{"name":"恒星名称2","position":[1000,500],"owner":"探索者1","radius":80},"stars":[{"name":"星球名称","position":[79,31],"owner":"探索者3","radius":20,"materialNum":11,"speed":2},{"name":"星球名称","position":[100,96],"owner":"探索者2","radius":4,"materialNum":12,"speed":10},{"name":"星球名称","position":[190,210],"owner":"探索者3","radius":5,"materialNum":13,"speed":1},{"name":"星球名称4","position":[300,340],"owner":"探索者4","radius":17,"materialNum":14,"speed":17}]}]}');
    $res_success = json_encode($raw_success);


    $raw_fail = array('code' => 0, 'msg' => '失败');
    $res_fail = json_encode($raw_fail);

    echo $res_success;
?>