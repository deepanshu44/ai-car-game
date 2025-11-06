import * as THREE from 'three';

export class AudioController {
    constructor(camera) {
        // Create audio sources
	this.listener = new THREE.AudioListener();
	camera.add(this.listener);
	this.audioLoader = new THREE.AudioLoader();
	this.buffers = {
	    accelerateBuffer : null,
	    brakeBuffer : null,
	    cruiseBuffer : null
	}
	this.audioContext = this.listener.context;
	this.sounds = new Map()
	// const backgroundMusic = new THREE.Audio(listener);
	// const crashSound = new THREE.Audio(listener);

	this.loadAudio()
    }

    loadAudio() {
	this.audioLoader.load('/static/car-run.mp3', (buffer) => {
	    this.buffers.accelerateBuffer = buffer;
	});
	this.audioLoader.load('/static/car-cruise.mp3', (buffer) => {
	    this.buffers.cruiseBuffer = buffer;
	});
	this.audioLoader.load('/static/car-slow.mp3', (buffer) => {
	    this.buffers.brakeBuffer = buffer;
	    // this.engineSound2.play()
	});
    }
    play(name,options) {
	if (name === "accelerate") {
	    this.loadAccelerateSound(options.percSpeed)
	} else if (name === "brake") {
	    this.loadBrakeSound(options.percSpeed)
	} else if (name === "cruise") {
	    this.loadCruiseSound()
	}
	// if (!this.sounds.get(name)) {
	// }
	
    }

    stop(name){
	this.sounds.get(name)
	    .then((sound) => sound.stop())
    }

    loadAccelerateSound(pSpeed){
	this.pSpeed = pSpeed
	const accelerate = this.audioContext.createBufferSource();
	const gainNode = this.audioContext.createGain()
	accelerate.buffer = this.buffers.accelerateBuffer
	accelerate.connect(gainNode);
	gainNode.connect(this.audioContext.destination);

	// fade-in sound (to start audio smoothly)
	gainNode.gain.setValueAtTime(0.5,this.audioContext.currentTime)
	gainNode.gain.linearRampToValueAtTime(1,this.audioContext.currentTime+1)

	accelerate.addEventListener("ended",() => {
	    gainNode.gain.value = 0
	    if (this.pSpeed>99) {
		this.loadCruiseSound()
	    }
	})
	// stop the brakes sound before accelerating
	if (this.sounds.get("brake")) {
	    this.sounds.get("brake").stop()
	    this.sounds.delete("brake")
	}
	if (!this.sounds.get("accelerate")) {
	    // this.sounds.delete("accelerate")
	    this.sounds.set("accelerate",accelerate)
	    // console.log("accelerate",pSpeed*11/100)
	    accelerate.start(0, pSpeed*11/100)
	    // accelerate.start(0, 1)
	}
    }

    loadBrakeSound(pSpeed) {
	const brakeSound = this.audioContext.createBufferSource();
	const gainNode = this.audioContext.createGain()
	brakeSound.buffer = this.buffers.brakeBuffer
	brakeSound.connect(gainNode)
	gainNode.connect(this.audioContext.destination);
	brakeSound.addEventListener("ended",() => this.sounds.delete("brake"))
	if (this.sounds.get("accelerate")) {
	    this.sounds.get("accelerate").stop()
	    this.sounds.delete("accelerate")
	}
	if (this.sounds.get("cruise")) {
	    this.sounds.get("cruise").stop()
	    this.sounds.delete("cruise")
	}
	if (!this.sounds.get("brake")) {
	    // this.sounds.delete("brake")
	    this.sounds.set("brake",brakeSound)
	    //  for a smooth audio start, start brake sound with
	    // volume 50% (0.5) and then increase it in 0.1s
	    
	    gainNode.gain.setValueAtTime(0.5,this.audioContext.currentTime)
	    if (pSpeed<19) {
		// car nearing to halt and audio increased 200% to make
		// engine sound louder, because in audio file, sound is slow
		// at the end
		gainNode.gain.linearRampToValueAtTime(2,this.audioContext.currentTime+0.1)
	    } else {
		gainNode.gain.linearRampToValueAtTime(1,this.audioContext.currentTime+0.1)
	    }
	    // gainNode.gain.value = 2
	    brakeSound.start(0, 6-pSpeed*6/100)
	    // brakeSound.start(0, 5.4)
	}
    }

    loadCruiseSound() {
	const cruise = this.audioContext.createBufferSource();
	const gainNode = this.audioContext.createGain()
	cruise.buffer = this.buffers.cruiseBuffer
	cruise.connect(gainNode);
	cruise.playbackRate.value = 1.2; // Play at 1.5x speed (higher pitch)
	cruise.loop = true
	cruise.loopStart = 0
	cruise.loopEnd = 0
	gainNode.connect(this.audioContext.destination);

	// fade-in sound (to start audio smoothly)
	gainNode.gain.setValueAtTime(0.5,this.audioContext.currentTime)
	gainNode.gain.linearRampToValueAtTime(1,this.audioContext.currentTime+1)
	// cruise.play()
	// cruise.start(0, 0)
	// if (this.sounds.get("brake")) {
	//     this.sounds.get("brake").stop()
	//     this.sounds.delete("brake")
	// }
	// if (this.sounds.get("accelerate")) {
	//     this.sounds.get("accelerate").stop()
	//     this.sounds.delete("accelerate")
	//     // console.log("accelerate",pSpeed*11/100)
	//     // accelerate.start(0, 1)
	// }
	if (!this.sounds.get("cruise")) {
	    // this.sounds.delete("brake")
	    this.sounds.set("cruise",cruise)
	    cruise.start(0, 0)
	}
    }

    update(){

    } 
}
