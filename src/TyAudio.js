import Tone from 'Tone';


const StartAudioContext = require('./StartAudioContext.js');


let That;
const names = 'asdfghjklqwertyuiopzxcvbnm'

class TyAudio {

	constructor() {
		That = this;


		//mobile start
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			$("body").addClass("Mobile");
			var element = $("<div>", {
				"id": "MobileStart"
			}).appendTo("body");
			var button = $("<div>").attr("id", "Button").text("Enter").appendTo(element);

			StartAudioContext(Tone.context, element, function() {
				element.remove();
			});
		}



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


		this.drawBtnWave();
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
		console.log("playMarimba " + num);
		this.marimbas[num].start();
	}



	drawBtnWave() {

		let soundValue = this.waveform.getValue();


		let _size = 136;

		let radius = _size * .35;
		let num = 128;
		let inc = Math.PI * 2 / num;
		let angle = 0;


		let btnPath;
		for (let i = 0; i < num; i += 2) {

			let random = soundValue[i] * 10;
			if (i > num / 2) random = soundValue[num - i] * 10;

			let x1 = (radius + random) * Math.cos(angle) + _size / 2;
			let y1 = (radius + random) * Math.sin(angle) + _size / 2;
			angle += inc;

			let x2 = (radius + random) * Math.cos(angle) + _size / 2;
			let y2 = (radius + random) * Math.sin(angle) + _size / 2;
			angle += inc;

			if (i == 0) btnPath = "M" + x1 + " " + y1;

			btnPath += "Q " + x1.toFixed(8) + " " + y1.toFixed(8) + " ";
			btnPath += x2.toFixed(8) + " " + y2.toFixed(8);
		}

		document.getElementById('BtnPath').setAttribute("d", btnPath);


		let soundPath;
		for (let i = 0; i < num; i += 2) {

			let random = soundValue[i] * 50;
			if (i > num / 2) random = soundValue[num - i] * 50;

			let x1 = (radius + random) * Math.cos(angle) + _size / 2;
			let y1 = (radius + random) * Math.sin(angle) + _size / 2;
			angle += inc;

			let x2 = (radius + random) * Math.cos(angle) + _size / 2;
			let y2 = (radius + random) * Math.sin(angle) + _size / 2;
			angle += inc;

			if (i == 0) soundPath = "M" + x1 + " " + y1;

			soundPath += "Q " + x1.toFixed(8) + " " + y1.toFixed(8) + " ";
			soundPath += x2.toFixed(8) + " " + y2.toFixed(8);
		}

		// soundPath += "Q " + (radius+_size/2).toFixed(8) + " " + (_size / 2).toFixed(8) + " ";
		// soundPath += (radius+_size/2).toFixed(8) + " " + (_size/2).toFixed(8);

		document.getElementById('SoundPath').setAttribute("d", soundPath);



		let linePath;
		for (let i = 0; i < 68; i++) {

			let _y = 140 + soundValue[i] * 50;
			let _x = i + 34;
			if (i == 0) linePath = "M " + _x + " " + _y;
			linePath += "L" + _x + " ";
			linePath += _y + " ";
		}
		document.getElementById('LinePath').setAttribute("d", linePath);


	}

	update() {

		this.drawBtnWave();

	}


}

export default TyAudio;