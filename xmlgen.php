<?php


  echo "WHAT IS HAPPENING....";
  $filename = "test"; //$_GET['xmlName'];
  $exemel = simplexml_load_string($_POST['data']);
  
  $exemel->asXml("upload/xml/".$filename.'.xml');


    /*echo "XML saved";

    //I load a string to be the contents of the XML file
    
    
    
    echo $exemel;
    // I save the file as following:
    $exemel->asXml("upload/xml/".$filename.'.xml');
    echo 1;*/



?>
