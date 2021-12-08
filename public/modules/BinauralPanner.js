export default class BinauralPanner {
    // Creates the panner object with source, gain, convolver connected
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

    // Creates convolver node
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

        // Fill node buffer with sample in sequence
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

    // Creates gain node
    CreateGainNode = class GainNode {
        constructor(audioContext, initialGain) {
            this.gain = audioContext.createGain();
            this.gain.gain.value = initialGain;
        }

        // Update gain value
        updateGain(newGainValue) {
            this.gain.gain.value = newGainValue;
        }
    }

    // Switch current convolver with new convolver to avoid clicks
    swapConvolver(currentConvolver, newConvolver) {
        let fadeTime = 0.025;
        currentConvolver.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        currentConvolver.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        newConvolver.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        newConvolver.gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + fadeTime);

        // Swap names to ensure current convolver is always the one in use
        let n = newConvolver;
        newConvolver = currentConvolver;
        currentConvolver = n;
    }

    // Update convolver with new azimuth, elevation, and distance
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

    // Overwrite WebAudio connect method to connect two convolver nodes to destination
    connect(destination) {
        this.currentConvolver.convolver.connect(destination);
        this.nextConvolver.convolver.connect(destination);
    }
}
