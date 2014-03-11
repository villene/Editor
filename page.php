<?php

/*$file=fopen("welcome.txt","w");
$data = $_GET['data'];
fwrite($file, $data);
fclose($file);*/


    echo "XML saved";

    //I load a string to be the contents of the XML file
    $filename = $_GET['name'];
    $exemel = simplexml_load_string($_GET['data']);
    
    echo $exemel;
    // I save the file as following:
    $exemel->asXml("upload/xml/".$filename.'.xml');
    echo 1;



?>
