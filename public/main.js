import HRIRObject from "./modules/HRIRObject.js";
import BinauralPanner from "./modules/BinauralPanner.js";
import { apple } from "./modules/process.js";
import aziList from "./modules/aziList.js";
import eleList from "./modules/eleList.js";

const hrirBin = "./HRIR/H11_hrir.bin";
const hrirDir = "../HRIR/H11_48K_24bit/";

let audioContext = null;
let hrirObject;
let source = null;
let panner = null;
let fileBuffer = null;

let azimuth;
let elevation;
let distance;

let playing;

// select html elements
const playButton = $('#play');
const stopButton = $('#stop');
const fileUpload = $('#upload');
const aziSlider = $('#azi-slider');
const eleSlider = $('#ele-slider');
const distSlider = $('#dist-slider');
const loopBox = $('input:checkbox');


const initialize = async () => {
    await $(document).ready(() => {
        hrirObject = new HRIRObject(hrirDir);
        hrirObject.loadHrir(hrirBin);
        
        aziSlider.val(96);
        eleSlider.val(12)
        distSlider.val(0);
        azimuth = aziSlider.val();
        elevation = eleSlider.val();
        distance = 1 - distSlider.val();
        console.log(hrirObject.container);
        console.log(aziList);
        console.log(eleList);
    });
}


const initAudioContext = () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
        console.log(err);
    };
}


const connectAudioContext = async () => {
    source = audioContext.createBufferSource();
    source.buffer = fileBuffer;
    source.loop = false;
    source.onended = reload;
    panner = new BinauralPanner(audioContext, source, hrirObject);
    panner.update(aziList[azimuth], eleList[elevation], distance);
    panner.connect(audioContext.destination);
    console.log('AudioContext connected');
}


const sliderValueToPanner = (event) => {
    let value = event.target.value;
    let slider = event.target.id;

    switch (slider) {
        case 'azi-slider':
            azimuth = value;
            break;
        case 'ele-slider':
            elevation = value;
            break;
        case 'dist-slider':
            distance = 1 - value;
            break;
        default:
            break;
    }

    try {
        panner.update(aziList[azimuth], eleList[elevation], distance);
    } catch (err) {
        // console.log(event.target.value);
        console.log(err);
    }
}


// Get user file when uploaded
const getUserFiles = async (event) => {
    initAudioContext();

    const fileList = await event.target.files;
    const fileReader = new FileReader();
    fileReader.onload = decodeFile;
    fileReader.readAsArrayBuffer(fileList[0]);

    console.log('File decoded');
    playButton.prop('disabled', false);
}


const decodeFile = (event) => {
    let file = event.target.result;
    audioContext.decodeAudioData(file).then((data) => {
        fileBuffer = data;
        playing = false;
    }).catch(err => {
        console.log(err);
        console.log('Failed to decode file');
    });
}


const playAudio = (event) => {
    if (!playing) {
        try {
            connectAudioContext();
            loopBox.prop('disabled', false);
            stopButton.prop('disabled', false);
            
            if (!playing) {
                source.start();
                playing = true;
                console.log('playing');
            }
        } catch (err) {
            console.log(err);
            alert('Please choose file to load!');
            playing = false;
        }
    }
}


const toggleLoop = (event) => {
    source.loop = !source.loop;
}


const reload = () => {
    playing = false;
    stopButton.prop('disabled', true);
    loopBox.prop('checked', false);
    loopBox.prop('disabled', true);
}


const stopAudio = (event) => {
    if (playing) {
        source.stop();
    }
}


// Main process:

initialize();

fileUpload.on('change', getUserFiles);
playButton.on('click', playAudio);
stopButton.on('click', stopAudio);
loopBox.on('change', toggleLoop);
aziSlider.on('input', sliderValueToPanner);
eleSlider.on('input', sliderValueToPanner);
distSlider.on('input', sliderValueToPanner);
