import HRIRObject from "./modules/HRIRObject.js";
import BinauralPanner from "./modules/BinauralPanner.js";
import { apple } from "./modules/process.js";

const hrirBin = "./HRIR/H11_hrir.bin";
const hrirDir = "../HRIR/H11_48K_24bit/";

let audioContext;
let hrirObject;
let source = null;
let panner;
let fileBuffer = null;

let azimuth = 0;
let elevation = 0;
let distance = 1;

let playing;

// select html elements
const playButton = $('#play');
const fileUpload = $('#upload');
const aziSlider = $('#azi-slider');
const eleSlider = $('#ele-slider');
const distSlider = $('#dist-slider');




const initialize = async () => {
    await $(document).ready(() => {
        hrirObject = new HRIRObject(hrirDir);
        hrirObject.loadHrir(hrirBin);
        console.log(hrirObject.container);

        // alert('Upload mono audio file.');
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
    source.loop = true;
    panner = new BinauralPanner(audioContext, source, hrirObject);
    panner.update(azimuth, elevation);
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
            distance = value;
            break;
        default:
            break;
    }

    try {
        panner.update(azimuth, elevation);
    } catch (err) {
        console.log(event.target.value);
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
    try {
        connectAudioContext();
        
        if (!playing) {
            source.start();
            playing = true;
            console.log('Playing');
        }
    } catch (err) {
        console.log(err);
        alert('Please choose file to load!');
        playing = false;
    }
}


const logChange = (event) => {
    // console.log(event.target.value);
    console.log(event);
}


const restartPlay = () => {
    //
}



// Main process:

initialize();

fileUpload.on('change', getUserFiles);
playButton.on('click', playAudio);

aziSlider.on('input', sliderValueToPanner);
eleSlider.on('input', sliderValueToPanner);
distSlider.on('input', sliderValueToPanner);