import Tone from 'Tone';


let That;

class bgWaveform extends THREE.Object3D {

	constructor() {
		super();
		
		That = this;

		this.waveform = new Tone.Waveform(1024);


		var waveformValues = this.waveform.getValue();


	}


}

export default bgWaveform;