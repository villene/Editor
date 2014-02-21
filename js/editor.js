var game = new Phaser.Game(800, 500, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});
var gridHeight = 35;
var gridWidth = 100;
var note=[];
var xmlNotes=[];
window.xmlDoc;
var locationX=0;
var locationY=0;
var cameraX=0;
var cameraY=0;
var label;
var lastNote;
//var alteration = document.getElementById('alteration');
//var lyrics = document.getElementById('lyrics');

function preload() {
        game.load.spritesheet('stance', 'assets/download.png', 20, 20, 2);
        game.load.image('labels', 'assets/labels_min.png');
}

function create() {
        game.world.setBounds(0, 0, gridWidth*20+60, gridHeight*20); 
        //game.camera.setPosition(0, 701);
        //create layers for buttons and note labels
        var noteLayer = game.add.group();
        noteLayer.z=0;
        var labelLayer = game.add.group();
        labelLayer.z=1;
        label = game.add.sprite(0,0, 'labels');
        //label.fixedToCamera=true;
        labelLayer.add(label);
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
}

function fillNote()
{
    if (game.input.x>60){
        //upon clicking another note, fills the optional values of the previous note
    if(lastNote!==undefined)
        {
            xmlNotes[lastNote].alteration=document.getElementById('alteration').value;
            xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
            alteration.value="0";
            lyrics.value="";
        }
    var y=this.hgt;
    var x=this.wdt;
    
    for (var i = 0; i<gridHeight; i++)
        {
            if(i===y)continue;
            if (note[i][x].on){
                note[i][x].on=false;
                note[i][x].setFrames(1, (note[i][x].on)?1:0, 1);
                note[i][x].frame = (note[i][x].on)?1:0;
                break;}
        }
    
    var oct = Math.floor((gridHeight-y)/7)+2;
    var step = (gridHeight-y)%7;
    
    switch(step){
        case 1: {step='C';break;}        
        case 2: {step='D';break;}        
        case 3: {step='E';break;}
        case 4: {step='F';break;}        
        case 5: {step='G';break;}        
        case 6: {step='A';break;}        
        case 0: {step='B'; oct--;break;}
    }
    
    xmlNotes[x]={step:step, octave:oct};
    lastNote=x;
    if (this.on) xmlNotes.splice(x,1);
    this.on = !this.on;
    this.setFrames(1, (this.on)?1:0, 1);
    this.frame = (this.on)?1:0;
    }
    else return;
    //alert(xmlNotes[x].step+xmlNotes[x].octave);
    
}

//document.getElementById("XMLgen").onclick = generateXML;

function generateXML()
{
    
            xmlNotes[lastNote].alteration=document.getElementById('alteration').value;
            xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
            alteration.value="0";
            lyrics.value="";
       
        
    xmlDoc = document.implementation.createDocument(null, "score-partwise", null);
    //alert(xmldoc2);

    for (var i=0; i<xmlNotes.length; i++){

        var xmlStep = xmlDoc.documentElement.appendChild(xmlDoc.createElement("step"));
        xmlStep.textContent = xmlNotes[i].step;
        var xmlOctave = xmlDoc.documentElement.appendChild(xmlDoc.createElement("octave"));
        xmlOctave.textContent = xmlNotes[i].octave;
        
        var xmlAlt = xmlDoc.documentElement.appendChild(xmlDoc.createElement("alter"));
        xmlAlt.textContent = xmlNotes[i].alteration;        
        
        var xmlLyrics = xmlDoc.documentElement.appendChild(xmlDoc.createElement("text"));
        if (xmlNotes[i].lyrics==="") xmlLyrics.textContent=" ";
        else xmlLyrics.textContent = xmlNotes[i].lyrics;
        
    }
    //alert((new XMLSerializer()).serializeToString(xmlDoc));

};

function update() {
    //game.input.disabled(game.input.x<60)?true:false;
    //else game.input.disabled=false;
    //camera drag
    if (game.input.mousePointer.isDown)
        {
            game.input.onDown.add(cameraDrag, this);     
            game.camera.setPosition(cameraX+locationX-game.input.x, cameraY+locationY-game.input.y);
            
        label.x=game.camera.x;
            //label.y=-cameraY-locationY+game.input.y;    
            //game.camera.x=cameraX+locationX-game.input.x;
            //game.camera.y=cameraY+locationY-game.input.y;                        
        }    
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

}
