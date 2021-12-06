import {HRIRObject, HRIRConvolver} from "./modules/HRTF.js"

const hrirBin = "./HRIR/H11_hrir.bin";
const hrirDir = "../HRIR/H11_48K_24bit/";

let audioContext;
let fileBuffer = null;
let playing;

const getUserFiles = async (event) => {
    startWebAudio();

    const fileList = await event.target.files;
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
        audioContext.decodeAudioData(e.target.result).then((data) => {
            fileBuffer = data;
            playing = false;
        }).catch(err => {console.log(err)});
    };

    fileReader.readAsArrayBuffer(fileList[0]);
    const hrirObject = new HRIRObject(hrirDir);
    hrirObject.loadHrir(hrirBin);
    console.log(hrirObject.allHrir);
};

const startWebAudio = () => {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
        console.log(err);
    };
}

// The main process
const playAudio = () => {
    try {
        const source = audioContext.createBufferSource();
        source.buffer = fileBuffer;
        source.connect(audioContext.destination);
        if (!playing) {
            source.start();
            playing = !playing;
        }
    } catch (err) {
        console.log(err);
    }
};

$('#upload').on('change', getUserFiles);
$('#play').on('click', playAudio);
