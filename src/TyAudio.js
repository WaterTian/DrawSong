import Tone from 'Tone';


let That;
const names = 'asdfghjklqwertyuiopzxcvbnm'

let svgLine = document.getElementById('soundSVG');


class TyAudio {

	constructor() {
		That = this;


		let namesArr = names.split("");
		this.players = [];
		this.waveform = new Tone.Waveform(128);

		namesArr.forEach(function(n, i) {
			let player = new Tone.Player({
				"url": "./assets/audio/" + n + ".mp3",
				"loop": false,
				// "grainSize" : 0.1,
				// "overlap" : 0.05,
			}).fan(That.waveform).toMaster();

			That.players.push(player);
		});


		this.marimbas = [];
		for (var i = 0; i < 8; i++) {
			let player = new Tone.Player({
				"url": "./assets/audio/marimba/tonal_marimba0" + i + ".mp3",
				"loop": false,
			}).fan(That.waveform).toMaster();

			That.marimbas.push(player);
		}



		svgLine.addEventListener('touchmove', EventPreventDefault);
		svgLine.addEventListener('mousemove', EventPreventDefault);

		function EventPreventDefault(event) {
			event.preventDefault();
		}

	}

	play(name) {
		let num = names.indexOf(name);

		if (num >= 0) {

			// this.players[num].detune = detune*3000;
			this.players[num].start();

			// console.log(this.players[num].detune);


			// setTimeout(()=>{
			// 	That.players[num].stop();
			// },1000);
		}
	}

	playMarimba(num) {
		console.log("playMarimba "+num);
		this.marimbas[num].start();
	}


	update() {
		let soundValue = this.waveform.getValue();



		let path;
		for (let i = 0; i < 128; i++) {
			let _y = soundValue[i] * 100 + 50;
			if (i == 0) path = "M0 " + _y;
			path += "L" + i + " ";
			path += _y + " ";
		}
		svgLine.setAttribute('d', path);
	}


}

export default TyAudio;