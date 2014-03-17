<!doctype html> 
<html lang="en"> 
<head> 
	<meta charset="UTF-8" />
	<title>Editor</title>
        <link rel="stylesheet" type="text/css" href="css/style.css" />
	<script type="text/javascript" src="js/phaser.min.js"></script>	
	<script type="text/javascript" src="js/jquery-2.1.0.min.js"></script>
	<script type="text/javascript" src="js/editor.js"></script>
	<script type="text/javascript" src="js/vkbeautify.0.99.00.beta.js"></script>
        <!--<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript" src="js/windowing.js"></script>!-->
    
</head>
<body>
<!--<button id="switch" onclick="getXML();">Pitch test</button>
    
    
    <canvas id="graph" width="800" height="500"></canvas>!-->
    
	
    <header id="main">
	
	
    
	<aside id="upload">
            <div>
            <h3>File Upload</h3>
		<form action="upload.php" method="post"
		enctype="multipart/form-data">
		<label for="file">Filename:</label>
		<input type="file" name="file" id="file"><br>
		<input type="submit" name="submit" value="Submit">
		</form>
            </div>
            <div>
                <h3>File list</h3>
            <?php
            
                //$dir    = 'upload/xml/';
                $files1 = array_filter(glob('upload/xml/*'),'is_file');
                //$files1 = scandir($dir, 0);
                echo '<ul id="filelist">';
                foreach ($files1 as $item){
                    echo '<li class="file"><button class="loadfile" onclick="loadFile(&#34'.basename($item).'&#34);">Load</button>'.basename($item).'</li>';
                }
                echo '</ul>';
                //echo($files1);
               // print_r($files2);
            ?>
            </div>
	</aside>
	
	<button id="XMLgen" onclick="generateXML();">Generate XML</button>
    <input  type="text" id="sheetName" placeholder="XML name">
    <button id="reset" onclick="resetGrid();">Reset grid</button>
	</header>
	<div id="phaser-canvas">   
        <input type="text" id="lyrics"/>
    </div>
	
	


</body>
</html>