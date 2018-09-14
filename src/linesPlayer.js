import * as THREE from 'three';
import TweenMax from "gsap";
import Unit from './Unit';
import TyAudio from './TyAudio';
import TyLine from './TyLine';

const glslify = require('glslify');
const tool = new Unit();


let That;
class linesPlayer {

	constructor(_idStr, _lines, _linesObj, callback) {
		That = this;

		this.lines = _lines;
		this.linesObj = _linesObj;
		this.callback = callback;
		this.idStr = _idStr;

		this.loadLines();

	}

	loadLines() {
		tool.loadJson('./' + this.idStr + '.json').then(function(json) {
			console.log(json);

			That.initLines(json);

			That.callback(json.audios);

		}, function(error) {
			console.error('getUrl Erro', error);
		});
	}

	initLines(json) {

		json.lines.forEach(function(l, i) {
			let line = new TyLine(l.lineColor, lineTexture, "parabolic");
			line.detune = l.detune;
			line.order = l.order;
			line.audioName = l.audioName;
			line.haveEmoji = l.emoji;
			That.linesObj.add(line);
			That.lines.push(line);

			for (let j = 0; j < l.points.length; j += 3) {
				line.points.push(new THREE.Vector3(l.points[j], l.points[j + 1], l.points[j + 2]))
			}
			line.pointZ = line.points[line.points.length - 1].z;
			line.setPoints(line.points);
			line.show(i * 0.3, () => {
				if (l.emoji) line.addEmoji();
			});

		});
	}



	drawLine(_ps, callback) {
		let _num = 0;
		draw();

		function draw() {
			if (_num >= _ps._Points.length) {
				callback();

				line.smoothPoints();
				line.shake();
				///
				line.addEmoji();
				return;
			}

			let _p = new THREE.Vector3(_ps._Points[_num], _ps._Points[_num + 1], 0)
			line.addPoint(_p);

			_num += 2;
			setTimeout(draw, 20);
		}
	}



	removeThis() {}

}

export default linesPlayer;