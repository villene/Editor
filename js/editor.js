//initializes phaser.js
var game = new Phaser.Game(800, 750, Phaser.CANVAS, 'phaser-canvas', { preload: preload, create: create, update: update, render:render});
//sets dimensions of canvas and the note sheet grid
var canvasHeight = 750;
var canvasWidth = 800;
var gridHeight = 36;
var gridWidth = 300;

var note=[]; //variable for saving note information on the grid
var xmlNotes=[]; //array for saving initialized notes that will be written in XML
var cursorX=0; //mouse pointer X coordinate
var gridX=0; //X coordinate for the current position of the grid

var lastNote;   //last note clicked/activated; used for saving lyrics
var activeNote; //currently highlighted note, when using keyboard

//different variables for initializing sprites and Z layers for use in phaser.js
var label;
var noteLayer;
var textLayer;
var lyricLabelLayer;

var t=[];   //array for storing song lyrics
var cursors;    //variable for default arrow keys in phaser.js
var space;  //variable for storing the SPACEBAR button
var del;

//preloads assets
function preload() {
        game.load.spritesheet('stance', 'assets/note-state.png', 20, 20, 3);
        game.load.image('labels', 'assets/note-labels.png');
        game.load.image('text', 'assets/text.png');
        game.load.image('lyrtxt', 'assets/Lyric_label.png');
}

//creaates the whole phaser.js work environment
function create() {
        game.world.setBounds(0, 0, 800, gridHeight*20+30); //creates canvas
        this.game.canvas.id = 'editor'; //gives ID for canvas in HTML DOM
        
        //initializes keyboard controls
        cursors = game.input.keyboard.createCursorKeys();
        space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);               
        del = game.input.keyboard.addKey(Phaser.Keyboard.DELETE);
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
        
        //set CSS styling for text
        var style = {font: "12px Arial", align: "center"};
        
        //creates 2D array for storing the informtion on the grid
        //each grid element is a button, which calls a funtion on-click
	for (var j = 0; j<gridHeight; j++){                       
            note[j]=[];
            for (var i = 0; i < gridWidth; i++)
            {
                note[j][i] = game.add.button(60+i*20, j*20, 'stance', activateNoteMouse, note[j][i], 1,0,1,0);
                note[j][i].hgt=j;   //height and width parameters of the button
                note[j][i].wdt=i;   
                note[j][i].on=false; //parameter, showing if button is initialized
                noteLayer.add(note[j][i]); //adds button to the layer group
            }
	}
        
        //adds horizontal text bar at the bottom and fills ir with empty values
        for (var i=0; i<gridWidth; i++)
            {
                t[i] = game.add.text(61+i*20,canvasHeight-15,'', style);
                textLayer.add(t[i]);
                t[i].anchor.setTo(0,0.5);                
            }
            
        //draws vertical lines
        for(var i=1; i<=gridWidth/8; i++)
            {
                var line = game.add.graphics(30+i*80, 0);
                noteLayer.add(line);
                line.lineStyle(2, 'black', 1);
                line.moveTo(30+i*80, 0);
                line.lineTo(30+i*80, gridHeight*20);
                line.endFill();
            }
            
       //draws horizontal lines
       for (var i=0; i<gridHeight; i+=12){
            var line = game.add.graphics(30, i*10);
            noteLayer.add(line);
            line.lineStyle(2, 'black', 1);
            line.moveTo(30, i*10);
            line.lineTo(gridWidth*20+60, i*10);
            line.endFill(); }
}

//function called when clicking a button on the grid
function activateNoteMouse()
{   
    //checks, if clicked int the grid area and not on one of the labels
    if (game.input.x>60 && game.input.y<canvasHeight-30 && gridX===noteLayer.x){
        var y=this.hgt;
        var x=this.wdt;        
        
        //deletes note from array, if clicked on a previously checked square
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

            //checks, if another note is clicked in the same column and if found, unchecks it
            for (var i = 0; i<gridHeight; i++)
                {
                    if(i===y) continue;
                    if (note[i][x].on){
                        note[i][x].on=false;
                        note[i][x].setFrames(1, (note[i][x].on)?1:0, 1, 0);
                        note[i][x].frame = (note[i][x].on)?1:0;
                        document.getElementById('lyrics').value = xmlNotes[x].lyrics;
                        break;}
                }
            
            //if keyboard is being used, de-highlights the highlighted square upon clicking            
            if(activeNote)
                {
                    if(xmlNotes[activeNote.x]) 
                        note[activeNote.y][activeNote.x].frame = 1;
                    else 
                        note[activeNote.y][activeNote.x].frame = 0;
                }
            
            //calculates the octave number, note and alteration, based on which square was clicked
            //and saves it in the array as object
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
            
            //sets the default duration as 2 (1/8 note) and Y coordinate for later use
            xmlNotes[x]={step:step, octave:oct, alteration:alt, duration:2, y:y};
            console.log(xmlNotes[x]);            
            
            //marks this square as clicked, changes sprite frames accordingly
            this.on = true;
            this.setFrames(1, 1, 1, 0);
            this.frame = 1;
            
            lastNote=x;
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

//function for marking notes when using keyboard
function activateNoteKeyboard(x, y){
    //writes lyric in the previously activated note for seamless transition
    if(lastNote!==undefined)
                {
                    
                    xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;
                    t[lastNote].setText(document.getElementById('lyrics').value);                    
                    document.getElementById('lyrics').value=undefined;
                    note[y][x].setFrames(1, 1, 1);
                    if (note[y][lastNote].frame!==0)  note[y][lastNote].frame=1;                 
                    
                }
    
    //if lyric already present, keeps it
    if(t[x].text)
        {
            document.getElementById('lyrics').value=t[x].text;
        }

    //checks, if another note is clicked in the same column and if found, unchecks it
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
        
    //calculates the octave number, note and alteration, based on which square was clicked
    //and saves it in the array as object
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
    
    //sets the default duration as 2 (1/8 note) and Y coordinate for later use
    xmlNotes[x]={step:step, octave:oct, alteration:alt, duration:2, y:y};
    console.log(xmlNotes[x]);
    
    //marks this square as activated, changes sprite frames accordingly
    note[y][x].on = true;            
    note[y][x].frame = 2;

    lastNote=x; 
    activeNote={x:x, y:y};

    //shows text input box on movement
    document.getElementById('lyrics').style.visibility = "visible";
    document.getElementById('lyrics').style.left = x*20+47+noteLayer.x+"px";
    document.getElementById('lyrics').style.top = (y+2)*20+"px";
    document.getElementById('lyrics').focus();        
}

//generates an XML structure from xmlNotes array
function generateXML()
{
    var xmlDoc;
    var xmlData;
    var xmlName = document.getElementById("sheetName").value;
    var xmlTempo = document.getElementById("tempo").value;
    
    //gets the last lyric value when generating XML
    if(lastNote!==undefined)
        {            
            xmlNotes[lastNote].lyrics=document.getElementById('lyrics').value;            
            document.getElementById('lyrics').value="";
        }
       
        
    xmlDoc = document.implementation.createDocument(null, "score-partwise", null);
    xmlDoc.documentElement.appendChild(xmlDoc.createElement("movement-title")).textContent = xmlName;
    
    //if Tempo value exists, writes it in, otherwise ignores (tempo is optional)
    if(xmlTempo)
        {
            xmlDoc.documentElement.appendChild(xmlDoc.createElement("sound"));
            var tempo=xmlDoc.getElementsByTagName('sound');
            tempo[0].setAttribute("tempo", xmlTempo);
        }
    
    //creates whole structure as defined if MusicXML documentation
    for (var i=0; i<xmlNotes.length; i++)
    {
        
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
            
            if (xmlNotes[i].lyrics!==" " && xmlNotes[i].lyrics){
                var lyricParent = noteParent.appendChild(xmlDoc.createElement("lyric"));         
                lyricParent.appendChild(xmlDoc.createElement("text")).textContent = xmlNotes[i].lyrics;               
            }
        }
        
    }
    
    //calls XML serializer and POST only if the Name field is filled
    if (xmlName!=="")
    {        
        xmlData = vkbeautify.xml(new XMLSerializer().serializeToString(xmlDoc));
        $.post("xmlgen.php", { data: xmlData });
        alert ("File generated succesfully!");
    }
   else alert("Please specify a file name!");
};

//function for clearing the whole grid
function resetGrid()
{
    if(!confirm("Are you sure?"))
        {
            return;
        }
    else
        {
            //sets all frames of the grid squares to the defaults
            for(var j=0; j<gridHeight; j++)
                {
                    for(var i=0; i<gridWidth; i++)
                        {
                            if(note[j][i].on){
                                note[j][i].on = false;
                                note[j][i].setFrames(1,0,1);
                                note[j][i].frame = 0;}
                        }
                }
            //clears the bottom lyrics bar
            for(var i=0; i<t.length; i++)
                t[i].setText('');
            
            //resets helper variables and note array
            lastNote = undefined;
            activeNote = undefined;
            xmlNotes.splice(0, xmlNotes.length);
            document.getElementById('lyrics').style.visibility = "hidden";
        }
};

//function for loading a MusicXML file for editing
function loadFile(fileName){    
        if(!confirm("Any unsaved changes will be lost. Continue?"))
            {
                return;
            }
        else
        {
            //resets grid to avoid overlapping and conflicts
            resetGrid();
            
            //opens XML in memory for parsing
            xmlhttp=new XMLHttpRequest();
            xmlhttp.open("GET","upload/xml/"+fileName,false);
            xmlhttp.send();
            var xmlDoc=xmlhttp.responseXML;
            
            //fills the Name field with the name of the loaded file
            //slice method to get rid of the '.xml' extension
            document.getElementById('sheetName').value=fileName.slice(0, -4);
            
            //if tempo found, fills the respective field, since Tempo is optional
            var loadTempo = xmlDoc.getElementsByTagName("sound");
            if(loadTempo[0])
            {
                document.getElementById('tempo').value = loadTempo[0].getAttribute('tempo');
            }
            
            //fills up the note array with data from XML
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
                if(notes[i].getElementsByTagName("text")[0] && notes[i].getElementsByTagName("text")[0].childNodes[0]){
                     lyrics = notes[i].getElementsByTagName("text")[0].childNodes[0].nodeValue;
                }
                else lyrics="";
                
                xmlNotes[i] = {step:step, octave:octave, alteration:alteration, duration:duration, lyrics:lyrics};
            }
        
        //marks all notes on the grid according to their pitch height
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
                    xmlNotes[x].y=y;
            }
            note[activeNote.y][activeNote.x].frame=2;
        }
}

//phaser.js function, constantly being called
function update() {
    //callbacks on using keyboard
    cursors.up.onDown.add(moveUp, this);
    cursors.down.onDown.add(moveDown, this);
    cursors.left.onDown.add(moveLeft, this);
    cursors.right.onDown.add(moveRight, this);
    space.onDown.add(addRest, this);
    del.onDown.add(deleteNote, this);
    
    //if left mouse button is down, grid dragging can proceed
    if (game.input.mousePointer.isDown)
        {
            //gets grid and pointer location data at the moment the button has been pressed
            game.input.onDown.add(cameraDrag, this); 
            //changes the X coordinate of the grid layers, when dragging the mouse
            if (cursorX!==0 && (noteLayer.x<=0 || noteLayer.x+gridWidth*20<canvasWidth)){
               // if (noteLayer.x>0) {noteLayer.x=0; gridX=0;}
                noteLayer.x = gridX+game.input.x-cursorX;
                textLayer.x = gridX+game.input.x-cursorX;   
                
            }
            
            //resets the activeNote variable upon clicking to avoid confusion
            if(activeNote)
                {
                    if(xmlNotes[activeNote.x])
                        {
                            note[activeNote.y][activeNote.x].frame=1;
                            activeNote=undefined;
                        }

                    else 
                        {
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
    
    //moves the grid layers accordingly, if the highlighted square if nearing the border
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
    if (noteLayer.x>0)
        {
            gridX=0; 
            noteLayer.x=0;
        } 
    else if (noteLayer.x+gridWidth*20<canvasWidth)
        {
            gridX=-gridWidth*20+canvasWidth; 
            noteLayer.x=-gridWidth*20+canvasWidth;
        }
    else gridX=noteLayer.x;
    
    cursorX=game.input.x;
}

//function called when SPACEBAR is pressed. Adds an empty square, simulating 'pause' symbol
function addRest(){
    //if activeNote is not undefined, i.e. keyboard is initialized
    if (activeNote){        
        //moves all notes after the highlighted one one square forward
        for(var i=xmlNotes.length; i>activeNote.x; i--)
            {
                xmlNotes[i]=xmlNotes[i-1];
                t[i].setText(t[i-1].text);
                for (var j=0; j<gridHeight; j++)
                    {
                        if(note[j][i-1].on)
                            {
                                note[j][i].on=true;
                                note[j][i].setFrames(1,1,1);
                                note[j][i].frame=1;
                                note[j][i-1].on=false;
                                note[j][i-1].setFrames(1,0,1);
                                note[j][i-1].frame=0;
                            }
                    }
            }
        //marks the higlighted note as 'undefined', so that it is considered
        //a 'rest' symbol upon XML generation
        xmlNotes[activeNote.x]=undefined;
        note[activeNote.y][activeNote.x].on=false;
        note[activeNote.y][activeNote.x].frame = 0;

        document.getElementById('lyrics').style.visibility = "hidden";
        lastNote=undefined;

        //highlights the next initialized note
        activeNote.x++;

        for (var i=0; i<gridHeight; i++)
            {
                if(note[i][activeNote.x].on)
                    {
                        activeNote.y=i;
                    }
            }
        note[activeNote.y][activeNote.x].on=true;
        note[activeNote.y][activeNote.x].frame = 2;

    }
    //if keyboard is not initialized, activates the first square
    else 
    {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        note[activeNote.y][activeNote.x].frame = 2;       
    }     
}

//called, when DELETE key is pressed
function deleteNote(){
    if (activeNote){                
            xmlNotes.splice(activeNote.x, 1);
            //moves all notes after the deleted note back one square
            for(var i=activeNote.x; i<=xmlNotes.length; i++)
                {
                    t[i].setText(t[i+1].text);
                    for (var j=0; j<gridHeight; j++)
                        {
                            if(note[j][i].on)
                                {
                                    note[j][i].on=false;
                                    note[j][i].setFrames(1,0,1);
                                    note[j][i].frame=0;
                                }
                        }
                    if(xmlNotes[i])
                        {
                            note[xmlNotes[i].y][i].on=true;
                            note[xmlNotes[i].y][i].setFrames(1,1,1);
                            note[xmlNotes[i].y][i].frame=1;
                        }
                }

            for (var i=0; i<gridHeight; i++)
                {
                    if(note[i][activeNote.x].on)
                        {
                            activeNote.y=i;
                        }
                }
           note[activeNote.y][activeNote.x].frame=2;
           document.getElementById('lyrics').style.visibility = "hidden";

           lastNote=undefined;          
    }   
        
    //if keyboard is not initialized, activates the first square
    else 
    {
        activeNote={x:0, y:gridHeight/2};
        note[activeNote.y][activeNote.x].on=true;
        note[activeNote.y][activeNote.x].frame = 2;       
    }     
}

//called when the UP key is pressed
function moveUp(){
    //if keyboard is initialized
    if (activeNote)
        {
            //returns, if the topmost square is already highlighted
            if(activeNote.y===0) return;
            //else highlights the square on top of the currently selected
            else 
                {
                    note[activeNote.y][activeNote.x].on=false;
                    note[activeNote.y][activeNote.x].frame = 0;
                    activeNote.y--;
                    note[activeNote.y][activeNote.x].on=true;            
                    note[activeNote.y][activeNote.x].frame = 2;
                    //saves this note in xmlNotes
                    activateNoteKeyboard(activeNote.x, activeNote.y);            
                }
        }
    //if keyboard uninitialized, highlights the first square
    else 
        {
            activeNote={x:0, y:gridHeight/2};
            note[activeNote.y][activeNote.x].on=true;
            note[activeNote.y][activeNote.x].frame = 2;
            activateNoteKeyboard(activeNote.x, activeNote.y);
        }     
}

//called when DOWN is pressed, analogous to moveUP, except moves down
function moveDown(){
    if (activeNote)
        {
            if(activeNote.y===gridHeight-1) return;
            else 
                {
                    note[activeNote.y][activeNote.x].on=false;
                    note[activeNote.y][activeNote.x].frame = 0;
                    activeNote.y++;
                    note[activeNote.y][activeNote.x].on=true;
                    note[activeNote.y][activeNote.x].frame = 2;
                    activateNoteKeyboard(activeNote.x, activeNote.y);
                }
        }
    else 
        {
            activeNote={x:0, y:gridHeight/2};
            note[activeNote.y][activeNote.x].on=true;
            note[activeNote.y][activeNote.x].frame = 2; 
            activateNoteKeyboard(activeNote.x, activeNote.y);
        }     
}

//called, when LEFT key is pressed
function moveLeft(){
    //if keyboard is initialized
    if (activeNote)
        {
            //returns, if X coordinate is already 0
            if(activeNote.x===0) return;
            //else highlights the next square
            else 
                {
                    //sets the sprite frame of the previoussly highlighted note back to black
                    if(xmlNotes[activeNote.x])
                        note[xmlNotes[activeNote.x].y][activeNote.x].frame=1;
                    else note[activeNote.y][activeNote.x].frame=0;

                    activeNote.x--;
                    //highlights the note, which is already initialized
                    for (var i=0; i<gridHeight; i++)
                        {
                            if(note[i][activeNote.x].on)
                            {
                                activeNote.y=i;  
                            }
                        }

                    //changes the sprite frame to green
                    note[activeNote.y][activeNote.x].on=true;
                    note[activeNote.y][activeNote.x].frame = 2;

                    //if CTRL is being held down, hides text input and highlights the note
                    //without actually saving it in xmlNotes array
                    if(cursors.left.ctrlKey)
                        {
                            document.getElementById('lyrics').style.visibility = "hidden";
                        }
                    else activateNoteKeyboard(activeNote.x, activeNote.y);                 
                }
        }
    //if keyboard uninitialized, marks the firstmost square of the grid
    else 
        {
            activeNote={x:0, y:gridHeight/2};
            note[activeNote.y][activeNote.x].on=true;
            note[activeNote.y][activeNote.x].frame = 2;
            activateNoteKeyboard(activeNote.x, activeNote.y);
        }  
}

//called, when RIGHT key is pressed, analogous to moveLeft
function moveRight(){
     if (activeNote)
        {
           if(activeNote.x===gridWidth-1) return;
           else 
                {
                    if(xmlNotes[activeNote.x])
                        note[xmlNotes[activeNote.x].y][activeNote.x].frame=1;
                    else note[activeNote.y][activeNote.x].frame=0;

                    activeNote.x++;
                    for (var i=0; i<gridHeight; i++)
                        {
                            if(note[i][activeNote.x].on)
                                {
                                    activeNote.y=i;
                                }
                        }

                    if(cursors.right.ctrlKey)
                        {
                            //prevents moving forward without saving, if there are no more
                            //marked notes ahead
                            if (activeNote.x>=xmlNotes.length) activeNote.x--;
                            else document.getElementById('lyrics').style.visibility = "hidden";
                        }
                    else activateNoteKeyboard(activeNote.x, activeNote.y); 

                    note[activeNote.y][activeNote.x].on=true;
                    note[activeNote.y][activeNote.x].frame = 2;
                }
       }
    else 
        {
            activeNote={x:0, y:gridHeight/2};
            note[activeNote.y][activeNote.x].on=true;
            note[activeNote.y][activeNote.x].frame = 2;
           activateNoteKeyboard(activeNote.x, activeNote.y);
        }
}

//phaser.js helper function for rendering debug data
function render() {

    //game.debug.renderCameraInfo(game.camera, 32, 32);
    //game.debug.renderInputInfo(32, 32);
    //game.debug.renderSpriteInputInfo(label, 32, 32);

}