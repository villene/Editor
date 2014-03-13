var game = new Phaser.Game(800, 700, Phaser.CANVAS, 'phaser-canvas', { preload: preload, create: create, update: update, render:render});

//var gridHeight = 35; with alteration
var canvasHeight = 700;
var canvasWidth = 800;
var gridHeight = 60;
var gridWidth = 100;
var note=[];
var xmlNotes=[];
var locationX=0;
var locationY=0;
var cameraX=0;
var cameraY=0;
var label;
var textSprite;
var lastNote;
var LyricText;
var t=[];
//var alteration = document.getElementById('alteration');
//var lyrics = document.getElementById('lyrics');

function preload() {
        game.load.spritesheet('stance', 'assets/note-state.png', 20, 20, 2);
        game.load.image('labels', 'assets/note-labels.png');
        game.load.image('text', 'assets/text.png');
        game.load.image('lyrtxt', 'assets/Lyric_label.png');
}

function create() {
        game.world.setBounds(0, 0, gridWidth*20+60, gridHeight*20+30); 
        this.game.canvas.id = 'editor';
        //create layers for buttons and labels
        var noteLayer = game.add.group();
        noteLayer.z=0;
        var labelLayer = game.add.group();
        labelLayer.z=1;
        label = game.add.sprite(0,0, 'labels');        
        labelLayer.add(label);
        var textLayer = game.add.group();        
        textLayer.z=1;
        textSprite = game.add.sprite(0, canvasHeight-30,'text');
        textLayer.add(textSprite);
        var lyricTextLayer = game.add.group();
        lyricTextLayer.z=2;
        LyricText = game.add.sprite(0, canvasHeight-30, 'lyrtxt');
        lyricTextLayer.add(LyricText);
        
        //set style for text
        var style = {font: "12px Arial", align: "center"};
               
	for (var j = 0; j<gridHeight; j++){                       
            note[j]=[];
            for (var i = 0; i < gridWidth; i++)
            {
                note[j][i] = game.add.button(60+i*20, j*20, 'stance', fillNote, note[j][i], 1,0,1);
                note[j][i].hgt=j;
                note[j][i].wdt=i;
                note[j][i].on=false;
                noteLayer.add(note[j][i]);
            }            
	}
        
        for (var i=0; i<gridWidth; i++)
            {
                t[i] = game.add.text(61+i*20,canvasHeight-15,'', style);
                textLayer.add(t[i]);
                t[i].anchor.setTo(0,0.5);                
            }
            
        //draw vertical lines
        for(var i=1; i<=gridWidth/8; i++)
            {
                var line = game.add.graphics(30+i*80, 0);
                noteLayer.add(line);
                line.lineStyle(2, 'black', 1);
                line.moveTo(30+i*80, 0);
                line.lineTo(30+i*80, gridHeight*20);
                line.endFill();
            }
       //draw horizontal lines
       for (var i=0; i<gridHeight; i+=12){
            var line = game.add.graphics(30, i*10);
            noteLayer.add(line);
            line.lineStyle(2, 'black', 1);
            line.moveTo(30, i*10);
            line.lineTo(gridWidth*20+60, i*10);
            line.endFill(); }
}

function fillNote()
{
    if (game.input.x>60 && game.input.y<canvasHeight-30 && cameraX===game.camera.x && cameraY===game.camera.y){
        var y=this.hgt;
        var x=this.wdt;
        
        if (this.on){
            xmlNotes.splice(x,1);
            this.on = false;
            this.setFrames(1,0, 1);
            this.frame = 0;
            lastNote=undefined;
            t[x].setText('');
            document.getElementById('lyrics').style.visibility = "hidden";
        }
        else{
        //upon clicking another note, fills the optional values of the previous note
            if(lastNote!==undefined)
                {
                    
                    xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
                    t[lastNote].setText(document.getElementById('lyrics').value);                    
                    document.getElementById('lyrics').value="";
                    
                }


            for (var i = 0; i<gridHeight; i++)
                {
                    if(i===y)continue;
                    if (note[i][x].on){
                        note[i][x].on=false;
                        note[i][x].setFrames(1, (note[i][x].on)?1:0, 1);
                        note[i][x].frame = (note[i][x].on)?1:0;
                        document.getElementById('lyrics').value = xmlNotes[x].lyrics;
                        break;}
                }

            var oct = Math.floor((gridHeight-y)/12)+2;
            var step = (gridHeight-y)%12;            
            var alt;
                switch(step){
                    case 1: {step='C';break;}
                    case 2: {step='C'; alt=1; break;}
                    case 3: {step='D';break;}
                    case 4: {step='D'; alt=1; break;}
                    case 5: {step='E';break;}
                    case 6: {step='F';break;}
                    case 7: {step='F'; alt=1; break;}
                    case 8: {step='G';break;}
                    case 9: {step='G'; alt=1; break;}
                    case 10: {step='A';break;}
                    case 11: {step='A'; alt=1; break;}
                    case 0: {step='B'; oct--;break;}

            }

            xmlNotes[x]={step:step, octave:oct, alteration:alt};
            lastNote=x;
            this.on = true;
            this.setFrames(1, 1, 1);
            this.frame = 1;
            
            //shows text input box on click
            document.getElementById('lyrics').style.visibility = "visible";
            document.getElementById('lyrics').style.left = x*20+47-game.camera.x+"px";
            document.getElementById('lyrics').style.top = (y+2)*20-game.camera.y+"px";
            document.getElementById('lyrics').focus();
        }
    }
    else return;
    
    //alert(xmlNotes[x].step+xmlNotes[x].octave);
    
}

function generateXML()
{
    var xmlDoc;
    var xmlData;
    var xmlName = document.getElementById("sheetName").value;
    
    if(lastNote!==undefined){
            //xmlNotes[lastNote].alteration=document.getElementById('alteration').value;
            xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
            //document.getElementById('alteration').value="0";
            document.getElementById('lyrics').value="";}
       
        
    xmlDoc = document.implementation.createDocument(null, "score-partwise", null);
 
    for (var i=0; i<xmlNotes.length; i++){
        
        var noteParent = xmlDoc.documentElement.appendChild(xmlDoc.createElement("note"));
        
        //creates a rest element, if grid left unchecked
        if (xmlNotes[i]===undefined)
            {
                noteParent.appendChild(xmlDoc.createElement("rest"));
                noteParent.appendChild(xmlDoc.createElement("duration")).textContent = 4; 
            }
            
        else{
            var pitchParent = noteParent.appendChild(xmlDoc.createElement("pitch"));
            pitchParent.appendChild(xmlDoc.createElement("step")).textContent = xmlNotes[i].step;
                        
            if (xmlNotes[i].alteration!==undefined)
                {
                    pitchParent.appendChild(xmlDoc.createElement("alter")).textContent = xmlNotes[i].alteration;                    
                }
                
            pitchParent.appendChild(xmlDoc.createElement("octave")).textContent = xmlNotes[i].octave;
            
            noteParent.appendChild(xmlDoc.createElement("duration")).textContent = 4;
            
            if (xmlNotes[i].lyrics!==""){
                var lyricParent = noteParent.appendChild(xmlDoc.createElement("lyric"));         
                lyricParent.appendChild(xmlDoc.createElement("text")).textContent = xmlNotes[i].lyrics;               
            }
        }
        
    }
    //alert (new XMLSerializer().serializeToString(xmlDoc));
    
    
    if (xmlName!==""){
        
        xmlData = vkbeautify.xml(new XMLSerializer().serializeToString(xmlDoc));
        console.log(xmlData);
        $.ajax({
        url: "xmlgen.php",
        method: "get",
        data:   { 'xmlDoc' : xmlData, 'xmlName': xmlName}});
    }
   else alert("Please specify a file name!");
    
    //xmlURL="'"+xmlURL+"'";
    //window.location.href = "http://localhost/Phasr/public_html/Editor/page.php?name=" + xmlName + "&data=" + xmlURL;

 



};

function update() {
    if (game.input.mousePointer.isDown)
        {
            game.input.onDown.add(cameraDrag, this);     
            game.camera.setPosition(cameraX+locationX-game.input.x, cameraY+locationY-game.input.y);
            
        label.x=game.camera.x;
        textSprite.y=game.camera.y+canvasHeight-30;
        LyricText.x=game.camera.x;
        LyricText.y=game.camera.y+canvasHeight-30;
        for(var i=0; i<t.length; i++)
        t[i].y=game.camera.y+canvasHeight-15;                        
        }
        
    //accepts text input and hides input box on ENTER
    if(document.getElementById('lyrics').style.visibility === "visible")
        {
            if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
                {
                    xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
                    t[lastNote].setText(document.getElementById('lyrics').value);
                    document.getElementById('lyrics').value='';
                    document.getElementById('lyrics').style.visibility = "hidden";
                    lastNote = undefined;
                }
        }
    if(cameraX!==game.camera.x || cameraY!==game.camera.y) document.getElementById('lyrics').style.visibility = "hidden";    
        
}
//get the pointer and camera coordinates in the moment of mouse click
function cameraDrag()
{
    locationX=game.input.x;
    locationY=game.input.y;
    cameraX=game.camera.x;
    cameraY=game.camera.y;
    
}

function render() {

    //game.debug.renderCameraInfo(game.camera, 32, 32);
    //game.debug.renderSpriteInputInfo(label, 32, 32);

}

function resetGrid()
{
    for(var j=0; j<gridHeight; j++)
        {
            for(var i=0; i<gridWidth; i++)
                {
                    if(note[j][i].on){
                        note[j][i].on = false;
                        note[j][i].setFrames(1,0, 1);
                        note[j][i].frame = 0;}
                }
        }
    for(var i=0; i<t.length; i++)
        t[i].setText('');
    lastNote = undefined;
    xmlDoc = undefined;
    xmlNotes.splice(0, xmlNotes.length);
    NoteObject.splice(0, xmlNotes.length);
    document.getElementById('lyrics').style.visibility = "hidden";
    
}


