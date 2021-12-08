import HrirList from './hrirList.js';

// .bin file layout: file[0]['L'] + file[0]['R'] + file[1]['L'] + file[1]['R'] + file[2]['L'] + ...
// hrirLength = 256
// hrirChannel = 2

export default class HRIRObject {
    constructor() {
        this.hrirList = HrirList;
        this.container = {};
        this.hrirLength = 256;
        this.loaded = false;
    }

    // Request H11_hrirList.bin file from server and add to nested object
    loadHrir(file) {
        let hReq = new XMLHttpRequest();
        let ir = {};
        ir.L = {};
        ir.R = {};

        hReq.open('GET', file, true);
        hReq.responseType = "arraybuffer";
        hReq.onload = () => {
            let arrayBuffer = hReq.response;
            
            if (arrayBuffer) {
                let audioData = new Float32Array(arrayBuffer);
                let i = 0;

                this.hrirList.forEach(hrir => {
                    let hrirStrings = hrir.split('_');
                    let azi = parseFloat(hrirStrings[1]);
                    let ele = parseFloat(hrirStrings[3].substring(0, (hrirStrings[3].length - 4)));
                    
                    if (typeof(ir.L[azi]) == "undefined" || typeof(ir.R[azi]) == "undefined") {
                        ir.L[azi] = {};
                        ir.R[azi] = {};
                    }
                    ir.L[azi][ele] = audioData.subarray(i, i + this.hrirLength);
                    i += this.hrirLength;
                    ir.R[azi][ele] = audioData.subarray(i, i + this.hrirLength);
                    i += this.hrirLength;
                });
            } else {
                throw new Error("Failed to load HRIR.")
            }
        };
        this.container = ir;
        hReq.send(null);
        this.loaded = true;
    }

    // Grab new hrir from hrir container object
    getNewHrir(azi, ele) {
        while (true) {
            let newHrirL = new Float32Array(256);
            let newHrirR = new Float32Array(256);

            if (this.loaded) {
                for (let i = 0; i < this.hrirLength; i++) {
                    newHrirL = this.container['L'][azi][ele];
                    newHrirR = this.container['R'][azi][ele];

                    // console.log([newHrirL, newHrirR]);
                }
                return [newHrirL, newHrirR]
            } else {
                throw new Error("HRIR not loaded, load with HRIRObject.loadHrir().")
            }
        }
    }
}
