<?php

/*$file=fopen("welcome.txt","w");
$data = $_GET['data'];
fwrite($file, $data);
fclose($file);*/


    echo "HI! Ajax arrived here and this code it's being executed!";

    //I load a string to be the contents of the XML file
    $filename = $_GET['name'];
    $exemel = simplexml_load_string($_GET['data']);
    
    echo $exemel;
    // I save the file as following:
    $exemel->asXml("upload/xml/".$filename.'.xml');
    echo 1;



?>
