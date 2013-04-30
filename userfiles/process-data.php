<?php

    $json = json_encode($_POST);

    if ($json) { /* sanity check */
        $file = fopen('data.json','w+');
        fwrite($file, $json);
        fclose($file);
	} else {
  	    echo 'JSON request not received';
	}

?>