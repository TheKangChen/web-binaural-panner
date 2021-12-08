export default class BinauralPanner {
    constructor(audioContext, source, hrirObject) {
        this.audioContext = audioContext;
        this.hrirObject = hrirObject;

        this.currentAzimuth = 0;
        this.currentElevation = 0;

        this.voulumeNode = new this.CreateGainNode(audioContext, 1);

        this.currentConvolver = new this.CreateIRConvolver(audioContext);
        this.nextConvolver = new this.CreateIRConvolver(audioContext);

        this.source = source;

        this.source.connect(this.voulumeNode.gain);
        this.voulumeNode.gain.connect(this.currentConvolver.convolver);
        this.voulumeNode.gain.connect(this.nextConvolver.convolver);
    }

    CreateIRConvolver = class CreateConvolver {
        constructor(audioContext) {
            this.frameCount = 256;
            this.channel = 2;
            this.buffer = audioContext.createBuffer(this.channel, this.frameCount, audioContext.sampleRate);
            this.convolver = audioContext.createConvolver();
            this.convolver.normalize = false;
            this.convolver.buffer = this.buffer;

            this.gainNode = audioContext.createGain();
            this.convolver.connect(this.gainNode);
        }

        fillBuffer(hrirLR) {
            this.bufferL = this.buffer.getChannelData(0);
            this.bufferR = this.buffer.getChannelData(1);
            for (let i = 0; i < this.buffer.length; i++) {
                this.bufferL[i] = hrirLR[0][i];
                this.bufferR[i] = hrirLR[1][i];
            }
            this.convolver.buffer = this.buffer;
        }
    }

    CreateGainNode = class GainNode {
        constructor(audioContext, initialGain) {
            this.gain = audioContext.createGain();
            this.gain.gain.value = initialGain;
        }

        updateGain(newGainValue) {
            this.gain.gain.value = newGainValue;
        }
    }

    swapConvolver(currentConvolver, newConvolver) {
        let fadeTime = 0.025;
        currentConvolver.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        currentConvolver.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        newConvolver.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        newConvolver.gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + fadeTime);

        let n = newConvolver;
        newConvolver = currentConvolver;
        currentConvolver = n;
    }

    update(azi, ele, dist) {
        this.voulumeNode.updateGain(dist);

        if (azi in this.hrirObject.container['L']) {
            this.currentAzimuth = azi;

            if (ele in this.hrirObject.container['L'][this.currentAzimuth]){
                this.currentElevation = ele;
                this.nextConvolver.fillBuffer(this.hrirObject.getNewHrir(this.currentAzimuth, this.currentElevation));
                this.swapConvolver(this.currentConvolver, this.nextConvolver);
            } else {
                this.nextConvolver.fillBuffer(this.hrirObject.getNewHrir(this.currentAzimuth, this.currentElevation));
                this.swapConvolver(this.currentConvolver, this.nextConvolver);
            }
        } else {
            this.nextConvolver.fillBuffer(this.hrirObject.getNewHrir(this.currentAzimuth, this.currentElevation));
            this.swapConvolver(this.currentConvolver, this.nextConvolver);
        }
        // console.log([this.currentAzimuth, this.currentElevation, dist])
    }

    connect(destination) {
        this.currentConvolver.convolver.connect(destination);
        this.nextConvolver.convolver.connect(destination);
    }
}
