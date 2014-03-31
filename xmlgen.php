<?php  
  $exemel = simplexml_load_string($_POST['data']);
  $filename = $exemel->{'movement-title'};
  $exemel->asXml("upload/xml/".$filename.'.xml');
  
  
?>
