window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var audioInput = null,
    inputPoint = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var Note = null;
var NoteObject = new Array();
var noteLocation=0;
var correctNotes=0;
var heardPitchArray = new Array();
var heardPitchCount=0;
var chopper = new Image();
chopper.src = "assets/heli.png";
var coin = new Image();
coin.src = "assets/coin.png";
var thresholdSilence = Math.pow(10,-2.5);
var noteLines = [48, 50, 52, 53, 55, 57, 59, 60];

/*function generateWave()
{
    var arr=[];
    var frekvence=440;
    var l=2048;
    for(var i=0; i<l; i++){
        
        //arr[i]=Math.sin(i/17);
       arr[i]=Math.sin(2 * Math.PI * (i/48000)*frekvence);
    }
    return arr;
}    

function windowing (buf){
    var gauswin=[];
    for(var i=0, l=buf.length; i<l; i++)
        {
            gauswin[i]=Math.pow(Math.E, -0.5*(Math.pow((i-(l-1)/2)/(0.45*(l-1)/2), 2)));
            buf[i]=buf[i]*gauswin[i];
}
        return buf;
}*/
var testArr2 = [187,194,199,206,211,216,222,227,231,236,240,243,246,249,252,254,254,254,254,254,254,254,254,254,254,253,251,248,245,242,238,234,229,224,219,214,208,202,196,190,183,177,170,163,156,149,142,135,128,121,114,107,100,93,86,80,74,67,62,56,51,45,41,36,32,28,25,22,19,17,15,13,12,12,11,12,12,13,14,16,18,21,23,27,31,35,39,44,49,54,60,66,72,78,85,91,99,105,112,120,127,134,141,148,155,163,170,177,184,190,197,203,209,215,220,226,231,236,240,244,248,251,254,254,254,254,254,254,254,254,254,254,254,254,254,254,252,249,245,241,237,232,227,222,216,211,205,198,192,185,178,171,164,157,150,143,135,128,121,113,106,99,92,85,79,72,66,60,54,48,43,38,34,30,26,22,19,16,14,12,10,9,9,8,8,9,10,11,13,15,17,20,24,27,31,36,41,46,51,57,62,69,75,81,88,95,102,109,116,123,130,137,144,152,159,166,173,179,186,192,198,204,210,216,221,226,230,234,239,242,245,248,250,252,254,254,254,254,254,254,254,254,253,251,249,246,243,239,235,231,226,222,216,211,205,199,193,187,180,173,167,159,152,145,138,131,124,117,110,103,95,89,82,75,69,63,57,51,46,41,36,32,28,24,20,17,14,12,10,9,8,7,6,6,7,8,9,11,13,15,18,21,25,29,33,37,42,47,52,58,64,70,77,83,90,97,103,110,117,124,131,138,145,151,158,165,172,178,184,190,196,202,207,212,217,222,226,230,233,236,239,242,244,246,247,248,248,248,248,248,246,245,243,241,238,235,232,228,224,220,215,210,205,199,193,187,181,174,168,161,154,147,140,133,126,118,111,104,97,90,84,77,70,64,58,52,47,41,36,31,26,22,18,15,11,9,6,4,2,1,0,0,0,0,1,2,4,6,8,11,14,18,21,25,30,35,40,45,51,57,63,70,76,83,90,96,104,111,118,125,132,139,146,153,160,167,173,179,186,192,198,203,209,214,218,223,227,231,234,237,240,242,244,245,246,247,247,247,246,245,244,242,239,237,234,230,227,223,218,214,208,203,197,191,185,179,172,165,158,151,144,136,129,122,114,107,100,93,86,78,72,65,58,52,46,40,35,30,24,20,15,11,7,4,1,0,0,0,0,0,0,1,1,1,1,1,1,1,3,7,10,14,19,23,28,34,39,45,51,57,64,71,78,84,92,99,106,113,121,128,135,142,149,156,163,170,177,183,189,195,201,206,211,216,221,225,229,232,235,238,240,242,243,244,245,245,245,244,243,242,240,238,235,232,229,225,221,217,212,207,202,196,190,184,177,170,164,157,150,143,136,128,121,114,106,99,92,85,78,72,65,59,53,47,41,36,30,25,21,16,12,9,6,3,1,1,1,1,1,1,1,1,1,1,1,1,3,6,9,12,16,21,25,30,35,41,47,52,58,65,72,78,85,92,99,106,113,120,128,135,141,149,156,162,169,175,182,188,194,199,204,210,214,218,223,226,229,233,235,237,239,241,242,242,243,243,242,241,240,238,236,234,231,228,224,221,216,212,207,202,196,190,185,178,172,166,159,152,145,138,131,124,117,110,104,97,90,83,77,70,64,58,52,46,41,36,31,27,22,19,15,12,9,7,5,3,2,1,1,1,1,2,3,4,6,9,11,14,18,22,26,31,35,40,46,52,57,64,70,76,83,90,96,104,111,117,125,132,139,146,153,160,167,173,180,186,192,198,204,209,214,219,223,227,231,235,238,240,243,245,246,248,248,249,249,249,248,247,245,243,241,238,235,232,228,223,219,214,209,204,198,192,186,180,173,166,159,152,145,138,131,124,117,110,103,96,89,82,76,69,63,57,51,46,41,36,31,27,23,19,16,13,11,9,7,5,5,4,4,4,5,6,8,10,12,15,18,22,26,30,35,40,45,51,56,63,69,75,82,89,96,103,110,117,125,132,139,147,154,161,168,175,182,189,195,201,207,213,218,224,229,233,238,242,245,248,251,253,254,254,254,254,254,254,254,254,254,254,254,251,248,245,242,238,234,229,224,219,213,207,201,195,188,182,175,168,161,153,146,139,132,124,117,110,103,96,89,83,76,70,64,58,52,47,42,37,33,29,25,22,19,16,14,12,11,10,10,10,10,11,12,14,16,18,21,24,28,32,36,40,45,50,56,62,68,74,81,87,94,101,108,115,123,130,137,144,151,158,165,172,179,186,192,198,205,211,216,222,227,231,236,240,244,248,251,253,254,254,254,254,254,254,254,254,254,254,254,254,253,250,247,243,240,235,231,226,221,215,209,204,197,191,185,178,171,164,157,150,143,136,129,122,115,108,101,94,88,82,75,69,64,58,53,48,43,39,35,32,28,25,23,21,19,18,17,16,16,16,17,18,19,21,23,26,29,32,36,40,44,49,54,59,65,71,77,83,89,96,102,109,116,123,130,137,144,151,158,164,171,178,184,190,197,203,208,214,219,224,229,233,237,241,244,247,250,252,254,254,254,254,254,254,254,254,254,254,252,250,248,245,241,238,233,229,224,219,214,208,202,196,190,183,177,170,163,156,149,142,135,128,121,114,107,100,94,87,81,74,68,62,57,52,47,42,38,33,30,26,23,21,18,16,15,14,13,13,13,13,14,15,17,19,22,25,28,31,36,40,44,49,55,60,66,72,78,85,91,98,105,111,118,126,133,140,147,154,161,168,174,181,188,194,200,206,212,217,222,227,231,236,239,243,246,249,251,253,254,254,254,254,254,254,254,254,254,252,250,247,244,241,237,232,228,223,218,212,206,200,194,187,181,174,167,160,153,145,138,130,123,116,109,101,94,87,80,74,67,61,55,49,44,38,34,29,24,21,17,14,11,9,6,5,4,3,2,3,3,4,5,7,9,12,15,18,22,26,30,35,40,45,51,57,63,70,76,83,90,97,104,111,118,125,133,140,147,154,161,168,175,182,188,194,200,206,211,217,221,226,230,234,238,241,243,246,248,250,251,252,252,252,252,251,250,248,246,244,241,238,234,230,226,221,216,211,205,200,194,187,181,174,167,160,153,145,138,131,123,116,109,101,94,88,80,74,67,61,55,49,43,38,33,28,23,19,15,11,8,6,3,1,0,0,0,0,0,0,0,0,2,4,7,10,13,17,21,25,30,34,40,45,51,57,63,70,77,83,90,97,104,111,118,125,132,139,146,153,160,166,172,179,185,190,196,202,207,212,216,220,224,227,230,233,236,237,239,240,241,242,242,241,241,240,238,236,234,231,228,225,221,217,213,208,203,198,192,186,180,174,167,160,154,146,140,133,125,118,112,104,98,91,84,77,71,64,58,53,47,41,36,31,26,22,17,13,10,7,4,2,0,0,0,0,0,0,0,0,0,1,2,5,8,11,14,18,23,27,32,37,43,48,54,60,67,73,79,86,93,100,107,114,121,128,135,141,148,155,161,168,174,180,186,192,197,203,208,212,216,220,224,227,230,232,235,236,238,239,239,239,239,239,238,237,235,233,230,228,224,220,217,212,207,203,197,191,186,180,173,167,160,153,146,139,132,125,118,111,104,97,90,83,76,70,63,57,51,45,40,34,29,24,19,15,11,7,4,1,0,0,0,0,0,1,1,1,1,1,1,1,1,4,7,11,15,19,24,29,34,40,46,52,58,65,71,78,85,92,99,106,113,121,128,135,143,150,156,164,170,177,183,190,195,201,207,211,216,221,225,229,232,235,238,240,242,244,245,245,246,246,245,244,243,241,239,237,234,230,227,223,218,213,208,203,197,191,185,179,172,165,158,151,144,137,130,122,115,108,100,93,87,80,73,67,60,54,48,42,36,31,26,22,18,13,10,7,4,1,1,1,1,1,1,1,1,1,1,1,2,4,7,11,14,18,23,27,32,38,43,49,56,62,68,75,82,89,96,103,110,118,125,132,140,147,154,161,168,175,181,188,194,200,205,210,216,220,225,229,233,236,239,242,244,246,248,249,249,250,249,249,248,247,245,243,240,237,234,231,227,222,218,213,208,202,196,190,184,177,171,164,157,150,143,136,129,122,115,108,101,94,87,81,74,68,62,56,51,46,40,36,31,27,23,20,16,14,11,9,7,6,6,5,5,6,6,8,9,11,14,17,20,24,28,32,36,41,46,52,58,63,70,76,83,89,96,103,110,117,124,131,139,146,152,160,166,173,180,186,192,198,204,209,214,219,224,228,233,236,240,243,245,247,249,251,252,252,253,253,252,251,250,249,247,244,242,239,235,231,227,223,218,213,207,202,196,190,183,177,170,163,157,149,142,136,128,122,115,108,101,95,88,82,76,69,63,58,52,47,42,38,33,30,26,23,20,18,15,14,12,11,11,11,11,12,13,15,17,19,22,25,29,32,37,41,46,51,57,62,68,75,81,87,94,101,108,115,122,129,137,144,151,158,165,172,179,185,192,198,204,210,216,221,226,231,236,240,244,247,250,253,254,254,254,254,254,254,254,254,254,254,254,254,253,250,247,243,239,235,230,225,220,214,209,202,196,190,183,176,169,162,155,148,140,133,126,119,112,105,98,91,85,78,71,65,59,54,48,43,38,34,30,26,23,20,17,15,14,12,11,11,10,11,12,13,14,16,18,21,24,28];


function getXML(){
    
    if (rafID) {
       cancelAnalyserUpdates();
       noteLocation=0;
       heardPitchArray.splice(0, heardPitchArray.length);
       heardPitchCount=0;
    }
    
    //xmlhttp=new XMLHttpRequest();  
    //xmlhttp.open("GET","sample.xml",false); //būtu kruta iespēja izvēlēties failu
    //xmlhttp.send();
    //xmlDoc=xmlhttp.responseXML;
    NoteObject.splice(0,NoteObject.length);
    if (analyserContext) analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    var steplist = xmlDoc.getElementsByTagName("step"); 
    var octlist = xmlDoc.getElementsByTagName("octave");
    var altlist = xmlDoc.getElementsByTagName("alter");
    var textlist = xmlDoc.getElementsByTagName("text");
    
    for(var i=0; i<steplist.length; i++)
        {
            NoteObject[i]={step:steplist[i].childNodes[0].nodeValue, 
                           octave:octlist[i].childNodes[0].nodeValue,
                           alter:altlist[i].childNodes[0].nodeValue,
                           lyric:textlist[i].childNodes[0].nodeValue,
                           correct:null};
        }
        updateAnalysers();
};

function updateAnalysers(time) {
    {
        var freqData = new Uint8Array(2048);
        analyserNode.getByteTimeDomainData(freqData);
                 
        //var FreqElem = document.getElementById('frequency');
        //var NoteElem = document.getElementById('note');
        //var CorrectElem = document.getElementById('correct');
        //var CurrDB = document.getElementById('decibels');
       // var HarmElem = document.getElementById('mjau');
        var frekvence = testRealTime(freqData);
       // freqData = windowing(freqData);
        Note = frequencyToNote(frekvence.frequency);
        //console.log(testRealTime(freqData));
        //FreqElem.innerText=frekvence.frequency;
        //NoteElem.innerText=Note.string;
        //CurrDB.innerText=frekvence.decibels + "/" + thresholdSilence;
        //HarmElem.innerText=frekvence.harmony;
        
        /*if (frekvence.frequency >70 && isFinite(frekvence.frequency) && frekvence.decibels > thresholdSilence)
            {//heardPitchArray[heardPitchCount]=(canvasHeight-((Note.oct*7+Note.note)*10)+100);     
                heardPitchArray[heardPitchCount]=(canvasHeight-(Note.midi-36)*10);
            heardPitchCount+=1;}*/
        drawData(frekvence);
        //CorrectElem.innerText=correctNotes + '/' + NoteObject.length;
                
    }    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function drawData(frequency){
    
    if (!analyserContext) {
        var canvas = document.getElementById("graph");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
        
    }
    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);

    var NoteDraw;
    analyserContext.strokeStyle='black';
    analyserContext.moveTo(canvasWidth,canvasHeight);
    analyserContext.lineTo(0,canvasHeight);
    analyserContext.lineTo(0,0);    
    analyserContext.lineWidth = 3;    
    analyserContext.stroke();
    
    /*for (var i=0; i<canvasHeight; i+=20)
        {
            analyserContext.moveTo(0,i);
            analyserContext.lineTo(canvasWidth,i);
        }
    analyserContext.lineWidth = 1;    
    analyserContext.stroke(); */      
        
     
    /*analyserContext.beginPath();
    analyserContext.moveTo(canvasWidth/2-heardPitchCount*2, heardPitchArray[i]);
    for (var i=0; i<heardPitchArray.length; i++){
    analyserContext.lineTo(canvasWidth/2-heardPitchCount*2+2*i, heardPitchArray[i]);}
    analyserContext.lineWidth=2;     
    analyserContext.stroke();*/
    
    analyserContext.beginPath();
    if (frequency.frequency>70 && isFinite(frequency.frequency) && frequency.decibels>thresholdSilence)
    analyserContext.drawImage(chopper, canvasWidth/2-54, drawMidi(Note.midi));
    //else analyserContext.drawImage(chopper, canvasWidth/2-54, heardPitchArray[heardPitchCount-1]++);
    //analyserContext.arc(canvasWidth/2, canvasHeight-((Note.oct*7+Note.note)*10)-10, 5, 0,2*Math.PI);
    analyserContext.stroke();
    
    analyserContext.font="12px Arial";
    
    //Note = frequencyToNote(autoCorrelate(freqData));
    
    for(var i=0; i<NoteObject.length; i++)
        {                       
    switch (NoteObject[i].step)
    {
	case 'C': NoteDraw=7*NoteObject[i].octave; break;
        case 'D': NoteDraw=7*NoteObject[i].octave+2; break;
        case 'E': NoteDraw=7*NoteObject[i].octave+4; break;
        case 'F': NoteDraw=7*NoteObject[i].octave+5; break;
        case 'G': NoteDraw=7*NoteObject[i].octave+7; break;
        case 'A': NoteDraw=7*NoteObject[i].octave+9; break;
        case 'B': NoteDraw=7*NoteObject[i].octave+11; break;
      }
      if(NoteObject[i].alter==='1')NoteDraw+=1;
        else if(NoteObject[i].alter==='-1')NoteDraw-=1;
      
    analyserContext.beginPath();
    analyserContext.strokeStyle='black';
    //var freq=noteToFrequency(NoteObject[i].octave, NoteObject[i].step);
    var freq=noteToFrequency(NoteObject[i].octave, NoteObject[i].step, NoteObject[i].alter);
    var fullnote=frequencyToNote(freq);
    
    if (canvasWidth-noteLocation+60*i<canvasWidth/2+27 && canvasWidth-noteLocation+60*i>canvasWidth/2-27  && frequency.decibels > thresholdSilence && NoteObject[i].correct!==true)
        if(fullnote.string===Note.string){
            
            NoteObject[i].correct=true;
            correctNotes++;
        }
            
    if (canvasWidth-noteLocation+60*i<=canvasWidth/2-10 && NoteObject[i].correct===null)
            NoteObject[i].correct=false;
        
    if (NoteObject[i].correct===false || NoteObject[i].correct===null){
    //analyserContext.arc(canvasWidth-noteLocation+60*i,canvasHeight-(NoteDraw*10)-10,10,0,2*Math.PI);
    
   // analyserContext.drawImage(coin, canvasWidth-noteLocation+60*i-10, canvasHeight-(NoteDraw*10)+100);
   analyserContext.drawImage(coin, canvasWidth-noteLocation+60*i-10, drawMidi(fullnote.midi));
   analyserContext.fillText(NoteObject[i].lyric, canvasWidth-noteLocation-14+60*i, drawMidi(fullnote.midi)+32);
    analyserContext.fillText(freq, canvasWidth-noteLocation-14+60*i, drawMidi(fullnote.midi)+48);   
    analyserContext.fillText(fullnote.string, canvasWidth-noteLocation-14+60*i, drawMidi(fullnote.midi)+64);
    analyserContext.stroke();}
        }
         
    noteLocation+=2;
}

function drawMidi(midi)
{
    var maxMidi = 90;
    var minMidi = 36;
    return canvasHeight-(midi-minMidi)*(canvasHeight/(maxMidi-minMidi));
}

function frequencyToNote(freq){
    
    var note;
    var oct;
    var step;
    var diff=12*Math.log(freq/440)/Math.log(2);
    diff=Math.round(diff);
    
    note=58+diff;
    oct=Math.floor(note/12);
    note%=12;

    switch(note)
    {
        case 1: {step='C'; note=1; break;}
        case 2: {step='C♯';break;}
        case 3: {step='D'; note=2; break;}
        case 4: {step='D♯';break;}
        case 5: {step='E'; note=3; break;}
        case 6: {step='F'; note=4; break;}
        case 7: {step='F♯';break;}
        case 8: {step='G'; note=5; break;}
        case 9: {step='G♯';break;}
        case 10: {step='A'; note=6; break;}
        case 11: {step='A♯';break;}
        case 0: {step='B'; oct--; note=7; break;}
    }
    var midi = 12*(Math.log(freq/440)/Math.log(2))+69;
    return {step:step, oct:oct, note:note, string:step+oct, midi: midi};
}

/*function noteToFrequency(oct, step){

    var freq;
    switch (step)
    {
        case 'C': step=oct*12+1; break;
        case 'D': step=oct*12+3; break;
        case 'E': step=oct*12+5; break;
        case 'F': step=oct*12+6; break;
        case 'G': step=oct*12+8; break;
        case 'A': step=oct*12+10; break;
        case 'B': step=oct*12+12; break;
    }   
    
        if (step===58) freq=440;
        else{ step-=58; freq=440*Math.pow(1.059463, step);}        
   
    return freq.toFixed(2);
}*/

function noteToFrequency(oct, step, alter){
    var freq;
    switch (step)
    {
        case 'C': step=oct*12+1; break;
        case 'C♯': step=oct*12+2; break;
        case 'D': step=oct*12+3; break;
        case 'D♯': step=oct*12+4; break;
        case 'E': step=oct*12+5; break;
        case 'F': step=oct*12+6; break;
        case 'F♯': step=oct*12+7; break;
        case 'G': step=oct*12+8; break;
        case 'G♯': step=oct*12+9; break;
        case 'A': step=oct*12+10; break;
        case 'A♯': step=oct*12+11; break;
        case 'B': step=oct*12+12; break;
    }   
        if(alter==='1')step+=1;
        else if(alter==='-1')step-=1;
        
        if (step===58) freq=440;
        else { step-=58; freq=440*Math.pow(1.059463, step);}        
   
    return freq.toFixed(2);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    
    audioInput = audioContext.createMediaStreamSource(stream);
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 1;
    inputPoint.connect( analyserNode );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    //getXML();
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia({audio:true}, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);            
        });
}

window.addEventListener('load', initAudio );