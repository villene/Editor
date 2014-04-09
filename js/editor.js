var game = new Phaser.Game(800, 750, Phaser.CANVAS, 'phaser-canvas', { preload: preload, create: create, update: update, render:render});

var canvasHeight = 750;
var canvasWidth = 800;
var gridHeight = 36;
var gridWidth = 300;
var note=[];
var xmlNotes=[];
var cursorX=0;
var gridX=0;
var label;
var lastNote;
var activeNote;
var noteLayer;
var textLayer;
var lyricLabelLayer;
var t=[];
var cursors;
var space;


function preload() {
        game.load.spritesheet('stance', 'assets/note-state.png', 20, 20, 3);
        game.load.image('labels', 'assets/note-labels.png');
        game.load.image('text', 'assets/text.png');
        game.load.image('lyrtxt', 'assets/Lyric_label.png');
}

function create() {
        game.world.setBounds(0, 0, 800, gridHeight*20+30); 
        this.game.canvas.id = 'editor';
        
        cursors = game.input.keyboard.createCursorKeys();
        space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
                
        
        //create layers for buttons and labels 
        noteLayer = game.add.group();
        noteLayer.z=0;
        var labelLayer = game.add.group();
        labelLayer.z=1;
        label = game.add.sprite(0,0, 'labels');        
        labelLayer.add(label);
        lyricLabelLayer = game.add.group();
        lyricLabelLayer.z=1;
        var textSprite = game.add.sprite(0, canvasHeight-30,'text');
        lyricLabelLayer.add(textSprite);
        var LyricText = game.add.sprite(0, canvasHeight-30, 'lyrtxt');
        lyricLabelLayer.add(LyricText);
        
        
        textLayer = game.add.group();        
        textLayer.z=2;
        
        //set style for text
        var style = {font: "12px Arial", align: "center"};
               
	for (var j = 0; j<gridHeight; j++){                       
            note[j]=[];
            for (var i = 0; i < gridWidth; i++)
            {
                note[j][i] = game.add.button(60+i*20, j*20, 'stance', fillNote, note[j][i], 1,0,1,0);
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
    if (game.input.x>60 && game.input.y<canvasHeight-30 && gridX===noteLayer.x){
        var y=this.hgt;
        var x=this.wdt;        
        
        if (this.on){
            xmlNotes.splice(x,1);
            this.on = false;
            this.setFrames(1,0,1,0);
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
                        note[i][x].setFrames(1, (note[i][x].on)?1:0, 1, 0);
                        note[i][x].frame = (note[i][x].on)?1:0;
                        document.getElementById('lyrics').value = xmlNotes[x].lyrics;
                        break;}
                }
            if(activeNote){
            if(xmlNotes[activeNote.x]) note[activeNote.y][activeNote.x].frame = 1;
            else note[activeNote.y][activeNote.x].frame = 0;}

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

            xmlNotes[x]={step:step, octave:oct, alteration:alt, duration:2};
            console.log(xmlNotes[x]);
            lastNote=x;            
            this.on = true;
            this.setFrames(1, 1, 1, 0);
            this.frame = 1;
            
            activeNote={x:x, y:y};
            
            //shows text input box on click
            document.getElementById('lyrics').style.visibility = "visible";
            document.getElementById('lyrics').style.left = x*20+47+gridX+"px";
            document.getElementById('lyrics').style.top = (y+2)*20+"px";
            document.getElementById('lyrics').focus();
        }
    }
    else {
        this.frame=0;
        return;
    }        
}

function generateXML()
{
    var xmlDoc;
    var xmlData;
    var xmlName = document.getElementById("sheetName").value;
    
    if(lastNote!==undefined){            
            xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;            
            document.getElementById('lyrics').value="";}
       
        
    xmlDoc = document.implementation.createDocument(null, "score-partwise", null);
    xmlDoc.documentElement.appendChild(xmlDoc.createElement("movement-title")).textContent = xmlName;
    for (var i=0; i<xmlNotes.length; i++){
        
        var noteParent = xmlDoc.documentElement.appendChild(xmlDoc.createElement("note"));
        
        //creates a rest element, if grid left unchecked
        if (xmlNotes[i]===undefined)
            {
                noteParent.appendChild(xmlDoc.createElement("rest"));
                noteParent.appendChild(xmlDoc.createElement("duration")).textContent = 2; 
            }
            
        else{
            var pitchParent = noteParent.appendChild(xmlDoc.createElement("pitch"));
            pitchParent.appendChild(xmlDoc.createElement("step")).textContent = xmlNotes[i].step;
                        
            if (xmlNotes[i].alteration!==undefined)
                {
                    pitchParent.appendChild(xmlDoc.createElement("alter")).textContent = xmlNotes[i].alteration;                    
                }
                
            pitchParent.appendChild(xmlDoc.createElement("octave")).textContent = xmlNotes[i].octave;
            
            noteParent.appendChild(xmlDoc.createElement("duration")).textContent =  xmlNotes[i].duration;
            
            if ((xmlNotes[i].lyrics!=="" || xmlNotes[i].lyrics!==undefined) && xmlNotes[i].lyrics){
                var lyricParent = noteParent.appendChild(xmlDoc.createElement("lyric"));         
                lyricParent.appendChild(xmlDoc.createElement("text")).textContent = xmlNotes[i].lyrics;               
            }
        }
        
    }
    //alert (new XMLSerializer().serializeToString(xmlDoc));
    
    
    if (xmlName!==""){
        
        xmlData = vkbeautify.xml(new XMLSerializer().serializeToString(xmlDoc));
        $.post("xmlgen.php", { data: xmlData });
        /*$.ajax({
        url: "xmlgen.php",
        method: "get",
        data:   { 'xmlDoc' : xmlData, 'xmlName': xmlName}});*/
    }
   else alert("Please specify a file name!");
};

function resetGrid()
{
    if(!confirm("Are you sure?")){
        return;
    }
    else{
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
    activeNote = undefined;
    xmlNotes.splice(0, xmlNotes.length);
    document.getElementById('lyrics').style.visibility = "hidden";
    }
};

function loadFile(fileName){    
        if(!confirm("Any unsaved changes will be lost. Continue?")){
            return;
        }
        else{
            resetGrid();
            
            xmlhttp=new XMLHttpRequest();
            xmlhttp.open("GET","upload/xml/"+fileName,false);
            xmlhttp.send();
            var xmlDoc=xmlhttp.responseXML;
            
            var notes = xmlDoc.getElementsByTagName("note");
            for(var i= 0, l=notes.length; i<l; i++)
            {
                var step, octave, alteration, duration, lyrics = undefined;            
                if(notes[i].getElementsByTagName("rest")[0]) continue;
                
                if(notes[i].getElementsByTagName("step")[0]){
                    step = notes[i].getElementsByTagName("step")[0].childNodes[0].nodeValue;
                }
                if(notes[i].getElementsByTagName("octave")[0]){
                    octave = notes[i].getElementsByTagName("octave")[0].childNodes[0].nodeValue;
                }
                if(notes[i].getElementsByTagName("alter")[0]){
                     alteration = notes[i].getElementsByTagName("alter")[0].childNodes[0].nodeValue;
                }
                else alteration=undefined;
                
                if(notes[i].getElementsByTagName("duration")[0]){
                     duration = notes[i].getElementsByTagName("duration")[0].childNodes[0].nodeValue;
                }
                if(notes[i].getElementsByTagName("text")[0]){
                     lyrics = notes[i].getElementsByTagName("text")[0].childNodes[0].nodeValue;
                }
                else lyrics="";
                
                xmlNotes[i] = {step:step, octave:octave, alteration:alteration, duration:duration, lyrics:lyrics};
            }
        //console.log(xmlNotes);
        
        for(var x=0; x<notes.length; x++)
            {
                if (!xmlNotes[x]) continue;
                
                    var y;
                    switch(xmlNotes[x].step)
                    {
                        case 'C': {y=1; break;}
                        case 'D': {y=3; break;}
                        case 'E': {y=5; break;}
                        case 'F': {y=6; break;}
                        case 'G': {y=8; break;}
                        case 'A': {y=10; break;}
                        case 'B': {y=12; break;}
                    }
                    y+=(xmlNotes[x].octave-2)*12;
                    if(xmlNotes[x].alteration) y+=parseInt(xmlNotes[x].alteration);
                    y=gridHeight-y;                    
                    note[y][x].on = true;
                    note[y][x].setFrames(1, 1, 1);
                    note[y][x].frame = 1;
                    if (x===0) activeNote={y:y, x:x};
                    
                    t[x].setText(xmlNotes[x].lyrics);
                
            }
}}

function update() {
    cursors.up.onDown.add(moveUp, this);
    cursors.down.onDown.add(moveDown, this);
    cursors.left.onDown.add(moveLeft, this);
    cursors.right.onDown.add(moveRight, this);
    space.onDown.add(addRest, this);
    
    if (game.input.mousePointer.isDown)
        {
            game.input.onDown.add(cameraDrag, this);               
            if (cursorX!==0 && (noteLayer.x<=0 || noteLayer.x+gridWidth*20<canvasWidth)){
               // if (noteLayer.x>0) {noteLayer.x=0; gridX=0;}
                noteLayer.x = gridX+game.input.x-cursorX;
                textLayer.x = gridX+game.input.x-cursorX;   
                
            }
            
            if(activeNote){
            if(xmlNotes[activeNote.x]){
                note[activeNote.y][activeNote.x].frame=1;
                activeNote=undefined;
            }
            
            else {
                note[activeNote.y][activeNote.x].on=false;
                note[activeNote.y][activeNote.x].frame=0;
                activeNote=undefined;
                }
            }
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
    if(activeNote){    
    if (activeNote.x>gridWidth-(gridWidth-canvasWidth/20)-noteLayer.x/20-6){
        noteLayer.x-=200;
        gridX=noteLayer.x;
        textLayer.x-=200;
        document.getElementById('lyrics').style.left = activeNote.x*20+47+noteLayer.x+"px";
    }
    else if(activeNote.x<gridWidth-(gridWidth-canvasWidth/20)-noteLayer.x/20-30 && activeNote.x>10){
        noteLayer.x+=200;
        gridX=noteLayer.x;
        textLayer.x+=200;
    }
    }
        
    if(gridX!==noteLayer.x) document.getElementById('lyrics').style.visibility = "hidden";            
}
//get the pointer and camera coordinates in the moment of mouse click
function cameraDrag()
{
    if (noteLayer.x>0) {gridX=0; noteLayer.x=0;} 
    else if (noteLayer.x+gridWidth*20<canvasWidth) {gridX=-gridWidth*20+canvasWidth; noteLayer.x=-gridWidth*20+canvasWidth;}
    else gridX=noteLayer.x;
    cursorX=game.input.x;
}
function addRest(){
    if (activeNote){
        for(var i=xmlNotes.length; i>activeNote.x; i--){
            xmlNotes[i]=xmlNotes[i-1];
        }
        xmlNotes[activeNote.x]=undefined;
        note[activeNote.y][activeNote.x].on=false;
        note[activeNote.y][activeNote.x].frame = 0;
        document.getElementById('lyrics').style.visibility = "hidden";
        lastNote=undefined;
        
        activeNote.x++;
            if(activeNote.x!==xmlNotes.length){
                note[activeNote.y][xmlNotes.length-1].on=true;
                note[activeNote.y][xmlNotes.length-1].frame=1;
            }
            for (var i=0; i<gridHeight; i++){
                if(note[i][activeNote.x].on){
                    activeNote.y=i;
                }
            }
            note[activeNote.y][activeNote.x].on=true;
            //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
            note[activeNote.y][activeNote.x].frame = 2;
    }
    else {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
        note[activeNote.y][activeNote.x].frame = 2;       
    }     
}
function moveUp(){
    if (activeNote){
        if(activeNote.y===0) return;
        else {
            note[activeNote.y][activeNote.x].on=false;
            note[activeNote.y][activeNote.x].frame = 0;
            activeNote.y--;
            note[activeNote.y][activeNote.x].on=true;
            //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
            note[activeNote.y][activeNote.x].frame = 2;  
        }
    }
    else {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
        note[activeNote.y][activeNote.x].frame = 2;
        activateNote(activeNote.x, activeNote.y)
    }     
}

function moveDown(){
    if (activeNote){
        if(activeNote.y===gridHeight-1) return;
        else {
            note[activeNote.y][activeNote.x].on=false;
            note[activeNote.y][activeNote.x].frame = 0;
            activeNote.y++;
            note[activeNote.y][activeNote.x].on=true;
            //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
            note[activeNote.y][activeNote.x].frame = 2;  
        }
    }
    else {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
        note[activeNote.y][activeNote.x].frame = 2; 
        activateNote(activeNote.x, activeNote.y)
    }     
}

function moveLeft(){
    if (activeNote){
        if(activeNote.x===0) return;
        else {
            activeNote.x--;
            for (var i=0; i<gridHeight; i++){
                if(note[i][activeNote.x].on){
                    note[activeNote.y][activeNote.x+1].frame=1;
                    activeNote.y=i;
                }
            }
            note[activeNote.y][activeNote.x].on=true;
            //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
            note[activeNote.y][activeNote.x].frame = 2; 
            if(cursors.left.ctrlKey){
                if(xmlNotes[activeNote.x]) note[activeNote.y][activeNote.x].frame = 1;
            else {
                note[activeNote.y][activeNote.x].on=false;
                note[activeNote.y][activeNote.x].frame = 0;}
            }
            else activateNote(activeNote.x, activeNote.y);                 
        }
    }
    else {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
        note[activeNote.y][activeNote.x].frame = 2;
        activateNote(activeNote.x, activeNote.y);
    }  
}

function moveRight(){
     if (activeNote){
        if(activeNote.x===gridWidth-1) return;
        else {
            activeNote.x++;
            for (var i=0; i<gridHeight; i++){
                if(note[i][activeNote.x].on){
                    note[activeNote.y][activeNote.x-1].frame=1;
                    activeNote.y=i;
                    
                }
            }
            note[activeNote.y][activeNote.x].on=true;
            //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
            note[activeNote.y][activeNote.x].frame = 2; 
            if(cursors.right.ctrlKey){
                if(xmlNotes[activeNote.x]) note[activeNote.y][activeNote.x].frame = 1;
            else {
                note[activeNote.y][activeNote.x].on=false;
                note[activeNote.y][activeNote.x].frame = 0;}
            }
            else activateNote(activeNote.x, activeNote.y);                 
        }
    }
    else {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        //note[activeNote.y][activeNote.x].setFrames(1, 2, 1);
        note[activeNote.y][activeNote.x].frame = 2;
        activateNote(activeNote.x, activeNote.y);
    }
}

function activateNote(x, y){
    if(lastNote!==undefined)
                {
                    
                    xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
                    t[lastNote].setText(document.getElementById('lyrics').value);                    
                    document.getElementById('lyrics').value="";
                    note[y][x].setFrames(1, 1, 1);
                    if (note[y][lastNote].frame!==0)  note[y][lastNote].frame=1;                 
                    
                }


            for (var i = 0; i<gridHeight; i++)
                {
                    if(i===y)continue;
                    if (note[i][x].on){
                        note[i][x].on=false;
                        note[i][x].setFrames(1, (note[i][x].on)?1:0, 1, 0);
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

            xmlNotes[x]={step:step, octave:oct, alteration:alt, duration:2};
            console.log(xmlNotes[x]);
            lastNote=x;            
            note[y][x].on = true;
            //note[y][x].setFrames(1, 1, 1, 0);
            note[y][x].frame = 2;
            
            activeNote={x:x, y:y};
            
            //shows text input box on click
            document.getElementById('lyrics').style.visibility = "visible";
            document.getElementById('lyrics').style.left = x*20+47+noteLayer.x+"px";
            document.getElementById('lyrics').style.top = (y+2)*20+"px";
            document.getElementById('lyrics').focus();        
}

function render() {

    //game.debug.renderCameraInfo(game.camera, 32, 32);
    //game.debug.renderInputInfo(32, 32);
    //game.debug.renderSpriteInputInfo(label, 32, 32);

}