var game = new Phaser.Game(800, 500, Phaser.AUTO, '', { preload: preload, create: create});
var gridHeight = 25;
var gridWidth = 40;
var note=[];
var xmlNotes=[];
window.xmlDoc;

function preload() {
        game.load.spritesheet('stance', 'assets/download.png', 20, 20, 2);
}

function create() {
	for (var j = 0; j<gridHeight; j++){
            note[j]=[];
        for (var i = 0; i < gridWidth; i++)
    {
        note[j][i] = game.add.button(i*20, j*20, 'stance', fillNote, note[j][i], 1,0,1);
        note[j][i].hgt=j;
        note[j][i].wdt=i;
        note[j][i].on=false;
    }
	}
}
function fillNote()
{
    var y=this.hgt;
    var x=this.wdt;
    
    for (var i = 0; i<gridHeight; i++)
        {
            if(i===y)continue;
            if (note[i][x].on){note[i][x].on=false;
            note[i][x].setFrames(1, (note[i][x].on)?1:0, 1);
            note[i][x].frame = (note[i][x].on)?1:0;
            break;}
        }
    
    var oct = Math.floor((25-y)/7);
    var step = (25-y)%7;
    
    switch(step)
    {
        case 1: step='C'; break;
        case 2: step='D'; break;
        case 3: step='E'; break;
        case 4: step='F'; break;
        case 5: step='G'; break;
        case 6: step='A'; break;
        case 7: step='B'; oct--; break;
    }
    
    xmlNotes[x]={step:step, octave:oct};
    
    if (this.on) xmlNotes.splice(x,1);
    //{xmlNotes[x].step=null; xmlNotes[x].octave=null;}
    this.on = !this.on;
    this.setFrames(1, (this.on)?1:0, 1);
    this.frame = (this.on)?1:0;
    //alert(xmlNotes[x].step+xmlNotes[x].octave);
    
}

//document.getElementById("XMLgen").onclick = generateXML;

function generateXML()
{
    xmlDoc = document.implementation.createDocument(null, "score-partwise", null);
    //alert(xmldoc2);

    for (var i=0; i<xmlNotes.length; i++){

        var xmlStep = xmlDoc.documentElement.appendChild(xmlDoc.createElement("step"));
        xmlStep.textContent = xmlNotes[i].step;
        var xmlOctave = xmlDoc.documentElement.appendChild(xmlDoc.createElement("octave"));
        xmlOctave.textContent = xmlNotes[i].octave;
    }
    //alert((new XMLSerializer()).serializeToString(xmlDoc));

};
