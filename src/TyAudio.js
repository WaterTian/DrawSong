import Tone from 'Tone';


let That;
const names = 'asdfghjklqwertyuiopzxcvbnm'

class TyAudio {

	constructor() {
		That = this;


		let namesArr = names.split("");

		this.players = [];

		namesArr.forEach(function(n, i) {
			let player = new Tone.Player({
				"url": "./assets/audio/" + n + ".[mp3|ogg]",
				"loop": false
			}).toMaster();

			That.players.push(player);

		});
	}

	play(name) {
		let num = names.indexOf(name);

		if (num >= 0) {
			this.players[num].start();
		}

	}


}

export default TyAudio;