/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be
 * used to cite it, is:
 *
 *  Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without
 *	   libraries, toolkits or training: A $1 recognizer for user interface
 *	   prototypes. Proceedings of the ACM Symposium on User Interface
 *	   Software and Technology (UIST '07). Newport, Rhode Island (October
 *	   7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed
 * here by Jacob O. Wobbrock:
 *
 *  Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/



//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}

//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = TyResample(points, NumPoints);

	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor

}


//
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}


//
// Private helper functions from here on down
//
function Resample(points, n) {
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = [points[0]];
	for (var i = 1; i < points.length; i++) {
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I) {
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		} else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
//tyadd
function TyResample(points, n) {

//tyadd
	var pos = [];
	for (var i = 0; i < points.length; i += 2) {
		var po = new Point(points[i], points[i + 1]);
		pos.push(po);
	}
	points = pos;
//tyadd

	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;

	var newpoints = [points[0]];
	for (var i = 1; i < points.length; i++) {
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I) {
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		} else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}

function IndicativeAngle(points) {
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}

function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}

function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}

function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}

function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}

function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
		b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}

function DistanceAtBestAngle(points, T, a, b, threshold) {
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold) {
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}

function DistanceAtAngle(points, T, radians) {
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}

function Centroid(points) {
	var x = 0.0,
		y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}

function BoundingBox(points) {
	var minX = +Infinity,
		maxX = -Infinity,
		minY = +Infinity,
		maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}

function PathDistance(pts1, pts2) {
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}

function PathLength(points) {
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}

function Distance(p1, p2) {
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}

function Deg2Rad(d) {
	return (d * Math.PI / 180.0);
}



//
// DollarRecognizer constants
//
const NumPoints = 64;
const SquareSize = 250.0;
const Origin = new Point(0, 0);
const Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
const HalfDiagonal = 0.5 * Diagonal;
const AngleRange = Deg2Rad(45.0);
const AnglePrecision = Deg2Rad(2.0);
const Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class


class TyRecognizer {

	constructor() {
		//
		// one built-in unistroke per gesture type
		//
		this.Unistrokes = new Array();
		this.Unistrokes[0] = new Unistroke("a", [22.5, 83.5, 22.5, 85.5, 19.5, 99.5, 2.5, 115.5, -10.5, 123.5, -23.5, 128.5, -42.5, 130.5, -53.5, 130.5, -64.5, 126.5, -73.5, 119.5, -83.5, 112.5, -92.5, 102.5, -98.5, 93.5, -104.5, 83.5, -110.5, 69.5, -116.5, 51.5, -122.5, 32.5, -123.5, 9.5, -123.5, -26.5, -121.5, -45.5, -114.5, -60.5, -106.5, -70.5, -91.5, -79.5, -73.5, -74.5, -62.5, -68.5, -47.5, -55.5, -33.5, -38.5, -21.5, -21.5, -7.5, 3.5, -0.5, 19.5, 4.5, 37.5, 7.5, 47.5, 9.5, 61.5, 8.5, 45.5, 8.5, 34.5, 9.5, 13.5, 14.5, -1.5, 19.5, -13.5, 24.5, -26.5, 29.5, -37.5, 35.5, -46.5, 44.5, -56.5, 57.5, -62.5, 67.5, -63.5]);
		this.Unistrokes[1] = new Unistroke("s", [6.5, 127.5, 3.5, 127.5, -11.5, 131.5, -27.5, 132.5, -38.5, 132.5, -48.5, 123.5, -52.5, 111.5, -54.5, 99.5, -54.5, 86.5, -50.5, 76.5, -43.5, 67.5, -33.5, 59.5, -23.5, 52.5, -11.5, 44.5, 0.5, 37.5, 8.5, 29.5, 11.5, 16.5, 11.5, 4.5, 7.5, -6.5, -4.5, -16.5, -13.5, -21.5, -27.5, -24.5, -38.5, -24.5, -52.5, -21.5, -65.5, -14.5, -76.5, -8.5]);
		this.Unistrokes[2] = new Unistroke("d", [-12.5, 241.5, -12.5, 238.5, -12.5, 216.5, -12.5, 197.5, -12.5, 175.5, -11.5, 133.5, -7.5, 81.5, -4.5, 1.5, -0.5, -38.5, 0.5, -65.5, 0.5, -88.5, 0.5, -103.5, 0.5, -83.5, 0.5, -68.5, 0.5, -51.5, -3.5, -31.5, -11.5, -8.5, -19.5, 17.5, -26.5, 38.5, -35.5, 55.5, -41.5, 65.5, -48.5, 74.5, -61.5, 82.5, -78.5, 85.5, -99.5, 85.5, -109.5, 82.5, -122.5, 72.5, -131.5, 58.5, -138.5, 45.5, -141.5, 34.5, -145.5, 15.5, -147.5, 4.5, -147.5, -8.5, -147.5, -19.5, -145.5, -29.5, -137.5, -48.5, -124.5, -64.5, -107.5, -74.5, -85.5, -81.5, -70.5, -82.5, -59.5, -82.5, -47.5, -81.5, -33.5, -75.5, -24.5, -68.5, -15.5, -58.5]);
		this.Unistrokes[3] = new Unistroke("f", [74.5, 126.5, 74.5, 126.5, 60.5, 118.5, 53.5, 109.5, 46.5, 96.5, 45.5, 86.5, 43.5, 76.5, 43.5, 65.5, 43.5, 54.5, 43.5, 42.5, 46.5, 26.5, 49.5, 10.5, 51.5, -6.5, 54.5, -31.5, 58.5, -48.5, 62.5, -67.5, 64.5, -83.5, 65.5, -102.5, 65.5, -119.5, 65.5, -136.5, 65.5, -149.5, 62.5, -163.5, 57.5, -183.5, 52.5, -192.5, 41.5, -189.5, 31.5, -178.5, 23.5, -154.5, 15.5, -125.5, 15.5, -109.5, 15.5, -94.5, 18.5, -79.5, 23.5, -66.5, 29.5, -54.5, 35.5, -45.5, 44.5, -31.5, 52.5, -20.5, 56.5, -10.5]);
        this.Unistrokes[4] = new Unistroke("g", [32.5, 64.5, 33.5, 64.5, 32.5, 79.5, 27.5, 88.5, 17.5, 95.5, 7.5, 96.5, -7.5, 94.5, -16.5, 87.5, -24.5, 76.5, -34.5, 62.5, -41.5, 47.5, -43.5, 36.5, -43.5, 25.5, -38.5, 6.5, -29.5, -2.5, -17.5, -7.5, -2.5, -9.5, 16.5, -5.5, 26.5, 2.5, 34.5, 11.5, 38.5, 23.5, 43.5, 36.5, 44.5, 49.5, 44.5, 33.5, 44.5, 21.5, 44.5, 7.5, 44.5, -6.5, 44.5, -24.5, 44.5, -42.5, 41.5, -61.5, 38.5, -81.5, 34.5, -96.5, 31.5, -107.5, 25.5, -120.5, 16.5, -130.5, 1.5, -134.5, -9.5, -136.5, -22.5, -136.5, -33.5, -128.5, -41.5, -120.5, -49.5, -112.5, -55.5, -103.5]);
		this.Unistrokes[5] = new Unistroke("h", [-23.5, 169.5, -24.5, 167.5, -22.5, 150.5, -20.5, 133.5, -19.5, 109.5, -19.5, 89.5, -19.5, 69.5, -19.5, 50.5, -19.5, 33.5, -19.5, 10.5, -20.5, -3.5, -23.5, -24.5, -25.5, -40.5, -27.5, -57.5, -28.5, -69.5, -28.5, -81.5, -32.5, -91.5, -31.5, -74.5, -29.5, -60.5, -22.5, -38.5, -17.5, -18.5, -13.5, 0.5, -6.5, 15.5, -0.5, 33.5, 10.5, 43.5, 21.5, 46.5, 34.5, 41.5, 42.5, 26.5, 47.5, 8.5, 49.5, -2.5, 51.5, -13.5, 53.5, -25.5, 55.5, -36.5, 56.5, -46.5, 58.5, -58.5, 59.5, -68.5, 62.5, -78.5, 69.5, -96.5, 74.5, -106.5]);
		this.Unistrokes[6] = new Unistroke("j", [-24.5, 139.5, -22.5, 138.5, -5.5, 137.5, 5.5, 135.5, 15.5, 136.5, 18.5, 125.5, 18.5, 106.5, 18.5, 84.5, 20.5, 74.5, 21.5, 61.5, 21.5, 47.5, 21.5, 28.5, 21.5, 11.5, 22.5, -4.5, 22.5, -22.5, 22.5, -41.5, 22.5, -55.5, 22.5, -70.5, 19.5, -83.5, 15.5, -98.5, 12.5, -111.5, 7.5, -124.5, 2.5, -133.5, -7.5, -137.5, -19.5, -135.5, -33.5, -127.5, -46.5, -116.5, -58.5, -105.5, -65.5, -95.5, -71.5, -86.5]);
		this.Unistrokes[7] = new Unistroke("k", [-24.5, 148.5, -24.5, 141.5, -24.5, 117.5, -24.5, 99.5, -24.5, 81.5, -24.5, 54.5, -22.5, 26.5, -22.5, -2.5, -22.5, -31.5, -20.5, -57.5, -20.5, -73.5, -20.5, -92.5, -25.5, -79.5, -26.5, -59.5, -21.5, -41.5, -14.5, -30.5, -6.5, -14.5, 5.5, -0.5, 19.5, 11.5, 30.5, 21.5, 39.5, 28.5, 25.5, 14.5, 11.5, 2.5, 1.5, -6.5, -5.5, -15.5, 12.5, -28.5, 29.5, -39.5, 46.5, -52.5, 60.5, -67.5, 71.5, -79.5, 80.5, -86.5]);
		this.Unistrokes[8] = new Unistroke("l", [-25.47,168.82,-25.47,152.41,-25.47,136.00,-25.47,114.42,-25.47,83.33,-25.47,60.01,-25.47,29.79,-25.47,3.02,-25.47,-20.29,-28.06,-44.47,-28.06,-59.15,-28.06,-71.24,-28.06,-83.33,-28.06,-85.92,-28.06,-86.78,-27.20,-86.78,-26.34,-86.78,-24.61,-86.78,-19.43,-86.78,-9.07,-86.78,7.34,-86.78,25.47,-86.78,43.61,-85.92,55.70,-85.06,72.10,-85.06,78.15,-84.19,80.74,-83.33,81.60,-83.33,82.47,-83.33,82.47,-82.47,83.33,-82.47,83.33,-82.47,84.19,-82.47]);
		
		this.Unistrokes[9] = new Unistroke("q", [14.5, 59.5, 14.5, 60.5, 14.5, 74.5, 13.5, 88.5, 8.5, 101.5, 0.5, 109.5, -13.5, 108.5, -22.5, 103.5, -39.5, 94.5, -48.5, 87.5, -59.5, 72.5, -64.5, 62.5, -67.5, 52.5, -69.5, 37.5, -66.5, 18.5, -55.5, 6.5, -41.5, 1.5, -25.5, 0.5, -5.5, 8.5, 3.5, 16.5, 11.5, 24.5, 18.5, 36.5, 21.5, 46.5, 24.5, 64.5, 15.5, 45.5, 12.5, 33.5, 8.5, 21.5, 5.5, 10.5, 2.5, -0.5, -0.5, -17.5, -1.5, -36.5, -0.5, -58.5, 4.5, -72.5, 9.5, -84.5, 16.5, -92.5, 26.5, -93.5, 38.5, -92.5]);
		this.Unistrokes[10] = new Unistroke("w", [-99.5, 63.5, -100.5, 61.5, -103.5, 48.5, -104.5, 19.5, -104.5, 0.5, -99.5, -37.5, -91.5, -53.5, -83.5, -63.5, -72.5, -69.5, -62.5, -70.5, -44.5, -62.5, -32.5, -47.5, -27.5, -37.5, -22.5, -21.5, -14.5, 7.5, -12.5, 19.5, -10.5, 31.5, -9.5, 42.5, -4.5, 30.5, 1.5, 9.5, 7.5, -8.5, 10.5, -23.5, 17.5, -45.5, 21.5, -55.5, 31.5, -61.5, 44.5, -60.5, 55.5, -53.5, 65.5, -41.5, 73.5, -29.5, 79.5, -15.5, 82.5, -0.5, 84.5, 14.5, 84.5, 29.5, 84.5, 42.5, 84.5, 56.5, 83.5, 67.5]);
		this.Unistrokes[11] = new Unistroke("e", [-28.5, 44.5, -28.5, 44.5, -16.5, 43.5, -1.5, 43.5, 14.5, 42.5, 36.5, 42.5, 54.5, 42.5, 67.5, 42.5, 77.5, 43.5, 92.5, 49.5, 106.5, 55.5, 118.5, 62.5, 128.5, 71.5, 131.5, 85.5, 132.5, 96.5, 128.5, 106.5, 121.5, 114.5, 111.5, 121.5, 100.5, 126.5, 88.5, 129.5, 72.5, 134.5, 58.5, 136.5, 43.5, 136.5, 30.5, 136.5, 10.5, 131.5, -1.5, 124.5, -10.5, 117.5, -18.5, 108.5, -27.5, 94.5, -32.5, 83.5, -34.5, 71.5, -34.5, 57.5, -34.5, 41.5, -33.5, 28.5, -27.5, 11.5, -22.5, 2.5, -14.5, -9.5, -1.5, -21.5, 16.5, -33.5, 35.5, -40.5, 49.5, -42.5, 62.5, -41.5, 73.5, -39.5, 86.5, -35.5, 100.5, -31.5, 110.5, -28.5, 121.5, -23.5, 133.5, -17.5]);
		this.Unistrokes[12] = new Unistroke("r", [-54.5, 94.5, -54.5, 94.5, -48.5, 84.5, -40.5, 72.5, -29.5, 57.5, -20.5, 39.5, -12.5, 22.5, -7.5, 6.5, -5.5, -6.5, -3.5, -23.5, -3.5, -34.5, -3.5, -45.5, -6.5, -64.5, -9.5, -74.5, -14.5, -91.5, -18.5, -106.5, -20.5, -117.5, -16.5, -107.5, -13.5, -95.5, -10.5, -82.5, -7.5, -71.5, -1.5, -51.5, -0.5, -39.5, 1.5, -23.5, 4.5, -6.5, 8.5, 5.5, 11.5, 16.5, 14.5, 26.5, 17.5, 38.5, 23.5, 48.5, 30.5, 59.5, 39.5, 67.5, 49.5, 69.5, 61.5, 69.5, 72.5, 67.5, 82.5, 61.5]);
		this.Unistrokes[13] = new Unistroke("t", [-68.5, 35.5, -64.5, 35.5, -49.5, 35.5, -34.5, 37.5, -22.5, 39.5, -12.5, 40.5, -1.5, 48.5, 2.5, 59.5, 6.5, 72.5, 6.5, 87.5, 6.5, 101.5, 1.5, 117.5, -5.5, 129.5, -16.5, 119.5, -17.5, 105.5, -19.5, 84.5, -19.5, 67.5, -19.5, 49.5, -20.5, 31.5, -20.5, 16.5, -20.5, -2.5, -20.5, -18.5, -20.5, -34.5, -20.5, -46.5, -20.5, -60.5, -20.5, -72.5, -19.5, -84.5, -12.5, -104.5, -0.5, -112.5, 23.5, -112.5, 43.5, -112.5, 69.5, -104.5, 91.5, -91.5, 116.5, -69.5, 129.5, -53.5, 141.5, -37.5, 150.5, -23.5, 157.5, -8.5]);
		
		this.Unistrokes[14] = new Unistroke("y", [-43.5, 83.5, -42.5, 81.5, -30.5, 60.5, -19.5, 44.5, -10.5, 31.5, -3.5, 22.5, 4.5, 14.5, 18.5, 22.5, 30.5, 37.5, 36.5, 48.5, 39.5, 58.5, 41.5, 71.5, 41.5, 87.5, 41.5, 71.5, 41.5, 56.5, 41.5, 40.5, 41.5, 27.5, 41.5, 12.5, 38.5, -0.5, 33.5, -15.5, 31.5, -30.5, 27.5, -48.5, 23.5, -62.5, 17.5, -80.5, 10.5, -91.5, 3.5, -99.5, -10.5, -109.5, -23.5, -113.5, -38.5, -113.5, -50.5, -106.5, -60.5, -93.5, -69.5, -79.5]);
		this.Unistrokes[15] = new Unistroke("u", [-72.5, 104.5, -73.5, 104.5, -74.5, 92.5, -74.5, 80.5, -76.5, 70.5, -78.5, 56.5, -79.5, 43.5, -80.5, 26.5, -76.5, 8.5, -72.5, -5.5, -66.5, -18.5, -61.5, -28.5, -54.5, -38.5, -42.5, -49.5, -32.5, -53.5, -21.5, -57.5, -8.5, -57.5, 5.5, -54.5, 18.5, -41.5, 28.5, -23.5, 32.5, -10.5, 37.5, 5.5, 43.5, 24.5, 49.5, 36.5, 53.5, 48.5, 58.5, 60.5, 62.5, 71.5, 65.5, 82.5, 69.5, 96.5, 70.5, 110.5, 69.5, 120.5, 66.5, 110.5, 62.5, 93.5, 60.5, 82.5, 59.5, 71.5, 56.5, 47.5, 56.5, 28.5, 56.5, 7.5, 60.5, -2.5, 65.5, -15.5, 75.5, -33.5, 84.5, -44.5, 92.5, -53.5, 102.5, -55.5]);
		this.Unistrokes[16] = new Unistroke("i", [0.5, 115.5, 0.5, 115.5, 0.5, 102.5, 0.5, 85.5, 0.5, 70.5, 0.5, 56.5, 0.5, 42.5, 0.5, 31.5, 0.5, 19.5, 0.5, 5.5, 0.5, -7.5, 0.5, -20.5, 0.5, -33.5, 0.5, -47.5, 0.5, -59.5]);
		this.Unistrokes[17] = new Unistroke("o", [15.5, 85.5, 15.5, 85.5, 6.5, 92.5, -5.5, 96.5, -22.5, 101.5, -35.5, 102.5, -45.5, 97.5, -55.5, 89.5, -67.5, 70.5, -72.5, 60.5, -79.5, 40.5, -81.5, 30.5, -81.5, 18.5, -80.5, -1.5, -76.5, -18.5, -71.5, -27.5, -56.5, -47.5, -47.5, -57.5, -36.5, -63.5, -27.5, -68.5, -12.5, -70.5, 0.5, -70.5, 12.5, -63.5, 22.5, -53.5, 27.5, -39.5, 30.5, -23.5, 31.5, -13.5, 32.5, 5.5, 30.5, 24.5, 25.5, 41.5, 18.5, 59.5, 13.5, 70.5, 5.5, 82.5, -6.5, 90.5, -17.5, 92.5]);
		this.Unistrokes[18] = new Unistroke("p", [1.5, 118.5, 1.5, 118.5, -1.5, 98.5, -3.5, 71.5, -3.5, 48.5, -1.5, 24.5, 1.5, -3.5, 3.5, -30.5, 5.5, -55.5, 7.5, -73.5, 7.5, -89.5, 7.5, -100.5, 4.5, -112.5, 5.5, -102.5, 6.5, -88.5, 6.5, -65.5, 6.5, -37.5, 6.5, 8.5, 9.5, 28.5, 12.5, 47.5, 15.5, 60.5, 21.5, 74.5, 28.5, 87.5, 39.5, 93.5, 57.5, 95.5, 75.5, 93.5, 85.5, 87.5, 94.5, 72.5, 98.5, 62.5, 100.5, 52.5, 101.5, 40.5, 95.5, 23.5, 85.5, 13.5, 71.5, 4.5, 51.5, -5.5, 22.5, -14.5, 11.5, -17.5, -1.5, -18.5]);
		
		this.Unistrokes[19] = new Unistroke("z", [-47.5, 91.5, -47.5, 92.5, -26.5, 94.5, -12.5, 95.5, 38.5, 99.5, 57.5, 100.5, 99.5, 101.5, 115.5, 102.5, 132.5, 102.5, 143.5, 102.5, 132.5, 91.5, 120.5, 85.5, 107.5, 77.5, 87.5, 64.5, 77.5, 55.5, 62.5, 43.5, 49.5, 29.5, 34.5, 12.5, 23.5, -1.5, 13.5, -12.5, -1.5, -25.5, -17.5, -32.5, -27.5, -37.5, -37.5, -44.5, -44.5, -52.5, -30.5, -56.5, 0.5, -55.5, 45.5, -55.5, 78.5, -55.5, 114.5, -53.5, 133.5, -51.5, 154.5, -48.5, 167.5, -47.5]);
		this.Unistrokes[20] = new Unistroke("x", [-61.5, 87.5, -61.5, 87.5, -41.5, 75.5, -27.5, 59.5, 2.5, 26.5, 21.5, 2.5, 38.5, -21.5, 52.5, -41.5, 69.5, -62.5, 80.5, -74.5, 90.5, -83.5, 98.5, -76.5, 103.5, -66.5, 106.5, -55.5, 109.5, -39.5, 110.5, -17.5, 110.5, 8.5, 109.5, 29.5, 107.5, 51.5, 107.5, 66.5, 107.5, 82.5, 107.5, 93.5, 100.5, 108.5, 92.5, 116.5, 77.5, 107.5, 65.5, 97.5, 52.5, 82.5, 36.5, 66.5, 18.5, 49.5, -2.5, 23.5, -15.5, 4.5, -27.5, -10.5, -42.5, -29.5, -54.5, -44.5, -62.5, -55.5, -68.5, -64.5, -73.5, -73.5]);
		this.Unistrokes[21] = new Unistroke("c", [24.5, 109.5, 23.5, 111.5, 10.5, 121.5, -7.5, 122.5, -22.5, 120.5, -38.5, 116.5, -53.5, 111.5, -66.5, 103.5, -75.5, 97.5, -84.5, 89.5, -99.5, 71.5, -110.5, 56.5, -116.5, 44.5, -122.5, 32.5, -125.5, 22.5, -128.5, 12.5, -129.5, -1.5, -130.5, -12.5, -130.5, -27.5, -127.5, -37.5, -120.5, -50.5, -112.5, -65.5, -106.5, -75.5, -97.5, -84.5, -87.5, -91.5, -68.5, -103.5, -57.5, -107.5, -45.5, -110.5, -27.5, -110.5, -10.5, -108.5, 0.5, -105.5, 11.5, -100.5, 24.5, -95.5, 36.5, -89.5]);
		this.Unistrokes[22] = new Unistroke("v", [-53.5, 90.5, -53.5, 89.5, -50.5, 71.5, -43.5, 58.5, -37.5, 46.5, -30.5, 31.5, -25.5, 20.5, -17.5, 3.5, -8.5, -15.5, -2.5, -30.5, 3.5, -42.5, 9.5, -54.5, 17.5, -69.5, 26.5, -61.5, 31.5, -44.5, 36.5, -30.5, 43.5, -12.5, 51.5, 6.5, 57.5, 25.5, 60.5, 41.5, 62.5, 54.5, 64.5, 69.5, 65.5, 82.5]);
		this.Unistrokes[23] = new Unistroke("b", [-19.5, 186.5, -19.5, 185.5, -19.5, 172.5, -19.5, 149.5, -19.5, 137.5, -19.5, 123.5, -19.5, 112.5, -18.5, 102.5, -17.5, 87.5, -17.5, 75.5, -17.5, 64.5, -17.5, 52.5, -17.5, 36.5, -17.5, 20.5, -16.5, 7.5, -17.5, -2.5, -18.5, 15.5, -18.5, 36.5, -18.5, 47.5, -18.5, 64.5, -18.5, 79.5, -14.5, 92.5, -4.5, 103.5, 6.5, 106.5, 17.5, 108.5, 30.5, 108.5, 46.5, 104.5, 60.5, 96.5, 72.5, 87.5, 85.5, 72.5, 93.5, 58.5, 96.5, 46.5, 96.5, 35.5, 91.5, 25.5, 85.5, 16.5, 75.5, 10.5, 60.5, 4.5, 47.5, -0.5, 37.5, -1.5, 24.5, -2.5, 13.5, -2.5, 3.5, -1.5, -11.5, -1.5, -26.5, -1.5]);
		this.Unistrokes[24] = new Unistroke("n", [-75.5, -52.5, -75.5, -50.5, -75.5, -36.5, -75.5, -15.5, -75.5, -1.5, -73.5, 19.5, -72.5, 43.5, -69.5, 58.5, -66.5, 71.5, -64.5, 84.5, -60.5, 97.5, -53.5, 107.5, -39.5, 119.5, -28.5, 124.5, -15.5, 123.5, -1.5, 114.5, 9.5, 105.5, 17.5, 94.5, 24.5, 81.5, 30.5, 62.5, 34.5, 48.5, 36.5, 35.5, 37.5, 25.5, 38.5, 11.5, 40.5, -1.5, 40.5, -19.5, 40.5, -33.5, 40.5, -46.5]);
		this.Unistrokes[25] = new Unistroke("m", [-90.5, -42.5, -91.5, -42.5, -90.5, -24.5, -89.5, -14.5, -86.5, -0.5, -85.5, 24.5, -85.5, 44.5, -85.5, 58.5, -83.5, 70.5, -80.5, 80.5, -70.5, 96.5, -58.5, 108.5, -48.5, 114.5, -38.5, 117.5, -29.5, 102.5, -24.5, 91.5, -21.5, 79.5, -16.5, 64.5, -12.5, 50.5, -11.5, 38.5, -9.5, 25.5, -6.5, -2.5, -6.5, -19.5, -4.5, -32.5, -6.5, -16.5, -7.5, 5.5, -7.5, 28.5, -5.5, 43.5, -1.5, 59.5, 2.5, 71.5, 8.5, 84.5, 12.5, 94.5, 21.5, 110.5, 31.5, 118.5, 41.5, 121.5, 54.5, 121.5, 67.5, 118.5, 78.5, 113.5, 83.5, 104.5, 91.5, 87.5, 97.5, 65.5, 103.5, 50.5, 105.5, 38.5, 107.5, 25.5, 109.5, 12.5, 110.5, 0.5, 111.5, -11.5, 113.5, -28.5, 114.5, -42.5, 117.5, -52.5]);

		
		this.Unistrokes[26] = new Unistroke("a", [38.43,130.82,34.97,121.32,27.20,104.92,15.97,81.60,2.16,42.74,-22.02,-30.65,-36.70,-71.24,-43.61,-99.74,-45.33,-119.60,-46.20,-129.10,-46.20,-132.55,-46.20,-133.41,-46.20,-133.41,-44.47,-129.96,-40.15,-112.69,-35.84,-82.47,-32.38,-41.02,-22.02,18.57,-15.11,51.38,-7.34,73.83,0.43,91.96,6.48,103.19,9.93,105.78,11.66,106.64,12.52,106.64,15.97,106.64,19.43,103.19,28.06,92.83,38.43,79.87,56.56,51.38,68.65,26.34,78.15,0.43,86.78,-34.11,88.51,-63.47,90.24,-83.33,88.51,-99.74,83.33,-114.42,79.01,-123.05,74.69,-129.10,71.24,-131.69,65.20,-132.55,52.24,-126.50,43.61,-116.14,33.25,-104.92,19.43,-85.06,9.93,-70.38,3.02,-55.70,1.30,-48.79,1.30,-43.61,2.16,-39.29,7.34,-34.11,19.43,-28.93,38.43,-22.02,58.29,-14.25,62.60,-11.66,63.47,-10.79,64.33,-9.93,64.33,-9.93]);
		this.Unistrokes[27] = new Unistroke("b", [-27.20,66.06,-26.34,56.56,-23.75,43.61,-23.75,28.06,-22.88,8.20,-22.88,-24.61,-24.61,-40.15,-26.34,-50.52,-27.20,-54.83,-27.20,-56.56,-27.20,-56.56,-27.20,-55.70,-26.34,-47.92,-26.34,-34.11,-26.34,0.43,-26.34,21.16,-26.34,39.29,-22.88,54.83,-17.70,71.24,-12.52,82.47,-8.20,91.10,-4.75,97.15,-2.16,100.60,0.43,101.46,3.89,101.46,13.38,101.46,21.16,98.01,32.38,89.37,37.56,83.33,41.02,76.42,42.74,67.79,43.61,59.15,45.33,53.11,43.61,45.33,39.29,38.43,28.93,31.52,14.25,27.20,-9.07,23.75,-20.29,23.75,-24.61,23.75,-25.47,23.75,-23.75,23.75,-9.07,21.16,10.79,11.66,22.02,3.02,32.38,-3.89,37.56,-9.93,37.56,-12.52,38.43,-15.97,40.15,-20.29,41.02,-25.47,41.88,-31.52,41.88,-39.29,41.88,-44.47,38.43,-49.65,30.65,-55.70,16.84,-58.29,-8.20,-59.15,-22.02,-59.15,-30.65,-57.42,-35.84,-57.42,-37.56,-56.56,-38.43,-56.56,-40.15,-56.56,-41.88,-55.70,-43.61,-54.83,-45.33,-53.97,-45.33,-53.97]);
		this.Unistrokes[28] = new Unistroke("d", [-36.70,74.69,-36.70,71.24,-35.84,67.79,-34.97,59.15,-33.25,50.52,-32.38,36.70,-30.65,22.02,-28.06,4.75,-26.34,-12.52,-26.34,-25.47,-24.61,-38.43,-24.61,-47.92,-24.61,-61.74,-25.47,-69.51,-26.34,-75.56,-26.34,-77.28,-26.34,-79.01,-27.20,-79.87,-27.20,-75.56,-28.06,-55.70,-29.79,-39.29,-29.79,-21.16,-29.79,-4.75,-30.65,9.07,-30.65,24.61,-30.65,39.29,-29.79,50.52,-27.20,59.15,-25.47,65.20,-22.88,70.38,-20.29,75.56,-15.97,82.47,-10.79,85.06,-3.89,87.65,2.16,87.65,11.66,87.65,21.16,87.65,28.93,87.65,34.97,85.06,44.47,78.15,49.65,72.97,54.83,68.65,62.60,60.01,72.97,45.33,77.28,34.11,81.60,23.75,82.47,13.38,82.47,3.02,79.87,-8.20,74.69,-21.16,63.47,-36.70,52.24,-49.65,35.84,-60.88,21.16,-69.51,0.43,-75.56,-12.52,-78.15,-23.75,-78.15,-34.11,-78.15,-41.02,-77.28,-47.92,-76.42,-52.24,-74.69,-52.24,-73.83,-52.24,-73.83,-53.11,-73.83,-53.11,-73.83,-53.11,-73.83]);
		// this.Unistrokes[26] = new Unistroke("m", []);

		// this.Unistrokes[0] = new Unistroke("triangle", new Array(new Point(137, 139), new Point(135, 141), new Point(133, 144), new Point(132, 146), new Point(130, 149), new Point(128, 151), new Point(126, 155), new Point(123, 160), new Point(120, 166), new Point(116, 171), new Point(112, 177), new Point(107, 183), new Point(102, 188), new Point(100, 191), new Point(95, 195), new Point(90, 199), new Point(86, 203), new Point(82, 206), new Point(80, 209), new Point(75, 213), new Point(73, 213), new Point(70, 216), new Point(67, 219), new Point(64, 221), new Point(61, 223), new Point(60, 225), new Point(62, 226), new Point(65, 225), new Point(67, 226), new Point(74, 226), new Point(77, 227), new Point(85, 229), new Point(91, 230), new Point(99, 231), new Point(108, 232), new Point(116, 233), new Point(125, 233), new Point(134, 234), new Point(145, 233), new Point(153, 232), new Point(160, 233), new Point(170, 234), new Point(177, 235), new Point(179, 236), new Point(186, 237), new Point(193, 238), new Point(198, 239), new Point(200, 237), new Point(202, 239), new Point(204, 238), new Point(206, 234), new Point(205, 230), new Point(202, 222), new Point(197, 216), new Point(192, 207), new Point(186, 198), new Point(179, 189), new Point(174, 183), new Point(170, 178), new Point(164, 171), new Point(161, 168), new Point(154, 160), new Point(148, 155), new Point(143, 150), new Point(138, 148), new Point(136, 148)));
		// this.Unistrokes[1] = new Unistroke("x", new Array(new Point(87, 142), new Point(89, 145), new Point(91, 148), new Point(93, 151), new Point(96, 155), new Point(98, 157), new Point(100, 160), new Point(102, 162), new Point(106, 167), new Point(108, 169), new Point(110, 171), new Point(115, 177), new Point(119, 183), new Point(123, 189), new Point(127, 193), new Point(129, 196), new Point(133, 200), new Point(137, 206), new Point(140, 209), new Point(143, 212), new Point(146, 215), new Point(151, 220), new Point(153, 222), new Point(155, 223), new Point(157, 225), new Point(158, 223), new Point(157, 218), new Point(155, 211), new Point(154, 208), new Point(152, 200), new Point(150, 189), new Point(148, 179), new Point(147, 170), new Point(147, 158), new Point(147, 148), new Point(147, 141), new Point(147, 136), new Point(144, 135), new Point(142, 137), new Point(140, 139), new Point(135, 145), new Point(131, 152), new Point(124, 163), new Point(116, 177), new Point(108, 191), new Point(100, 206), new Point(94, 217), new Point(91, 222), new Point(89, 225), new Point(87, 226), new Point(87, 224)));
		// this.Unistrokes[2] = new Unistroke("rectangle", new Array(new Point(78, 149), new Point(78, 153), new Point(78, 157), new Point(78, 160), new Point(79, 162), new Point(79, 164), new Point(79, 167), new Point(79, 169), new Point(79, 173), new Point(79, 178), new Point(79, 183), new Point(80, 189), new Point(80, 193), new Point(80, 198), new Point(80, 202), new Point(81, 208), new Point(81, 210), new Point(81, 216), new Point(82, 222), new Point(82, 224), new Point(82, 227), new Point(83, 229), new Point(83, 231), new Point(85, 230), new Point(88, 232), new Point(90, 233), new Point(92, 232), new Point(94, 233), new Point(99, 232), new Point(102, 233), new Point(106, 233), new Point(109, 234), new Point(117, 235), new Point(123, 236), new Point(126, 236), new Point(135, 237), new Point(142, 238), new Point(145, 238), new Point(152, 238), new Point(154, 239), new Point(165, 238), new Point(174, 237), new Point(179, 236), new Point(186, 235), new Point(191, 235), new Point(195, 233), new Point(197, 233), new Point(200, 233), new Point(201, 235), new Point(201, 233), new Point(199, 231), new Point(198, 226), new Point(198, 220), new Point(196, 207), new Point(195, 195), new Point(195, 181), new Point(195, 173), new Point(195, 163), new Point(194, 155), new Point(192, 145), new Point(192, 143), new Point(192, 138), new Point(191, 135), new Point(191, 133), new Point(191, 130), new Point(190, 128), new Point(188, 129), new Point(186, 129), new Point(181, 132), new Point(173, 131), new Point(162, 131), new Point(151, 132), new Point(149, 132), new Point(138, 132), new Point(136, 132), new Point(122, 131), new Point(120, 131), new Point(109, 130), new Point(107, 130), new Point(90, 132), new Point(81, 133), new Point(76, 133)));
		// this.Unistrokes[3] = new Unistroke("circle", new Array(new Point(127, 141), new Point(124, 140), new Point(120, 139), new Point(118, 139), new Point(116, 139), new Point(111, 140), new Point(109, 141), new Point(104, 144), new Point(100, 147), new Point(96, 152), new Point(93, 157), new Point(90, 163), new Point(87, 169), new Point(85, 175), new Point(83, 181), new Point(82, 190), new Point(82, 195), new Point(83, 200), new Point(84, 205), new Point(88, 213), new Point(91, 216), new Point(96, 219), new Point(103, 222), new Point(108, 224), new Point(111, 224), new Point(120, 224), new Point(133, 223), new Point(142, 222), new Point(152, 218), new Point(160, 214), new Point(167, 210), new Point(173, 204), new Point(178, 198), new Point(179, 196), new Point(182, 188), new Point(182, 177), new Point(178, 167), new Point(170, 150), new Point(163, 138), new Point(152, 130), new Point(143, 129), new Point(140, 131), new Point(129, 136), new Point(126, 139)));
		// this.Unistrokes[4] = new Unistroke("check", new Array(new Point(91, 185), new Point(93, 185), new Point(95, 185), new Point(97, 185), new Point(100, 188), new Point(102, 189), new Point(104, 190), new Point(106, 193), new Point(108, 195), new Point(110, 198), new Point(112, 201), new Point(114, 204), new Point(115, 207), new Point(117, 210), new Point(118, 212), new Point(120, 214), new Point(121, 217), new Point(122, 219), new Point(123, 222), new Point(124, 224), new Point(126, 226), new Point(127, 229), new Point(129, 231), new Point(130, 233), new Point(129, 231), new Point(129, 228), new Point(129, 226), new Point(129, 224), new Point(129, 221), new Point(129, 218), new Point(129, 212), new Point(129, 208), new Point(130, 198), new Point(132, 189), new Point(134, 182), new Point(137, 173), new Point(143, 164), new Point(147, 157), new Point(151, 151), new Point(155, 144), new Point(161, 137), new Point(165, 131), new Point(171, 122), new Point(174, 118), new Point(176, 114), new Point(177, 112), new Point(177, 114), new Point(175, 116), new Point(173, 118)));
		// this.Unistrokes[5] = new Unistroke("caret", new Array(new Point(79, 245), new Point(79, 242), new Point(79, 239), new Point(80, 237), new Point(80, 234), new Point(81, 232), new Point(82, 230), new Point(84, 224), new Point(86, 220), new Point(86, 218), new Point(87, 216), new Point(88, 213), new Point(90, 207), new Point(91, 202), new Point(92, 200), new Point(93, 194), new Point(94, 192), new Point(96, 189), new Point(97, 186), new Point(100, 179), new Point(102, 173), new Point(105, 165), new Point(107, 160), new Point(109, 158), new Point(112, 151), new Point(115, 144), new Point(117, 139), new Point(119, 136), new Point(119, 134), new Point(120, 132), new Point(121, 129), new Point(122, 127), new Point(124, 125), new Point(126, 124), new Point(129, 125), new Point(131, 127), new Point(132, 130), new Point(136, 139), new Point(141, 154), new Point(145, 166), new Point(151, 182), new Point(156, 193), new Point(157, 196), new Point(161, 209), new Point(162, 211), new Point(167, 223), new Point(169, 229), new Point(170, 231), new Point(173, 237), new Point(176, 242), new Point(177, 244), new Point(179, 250), new Point(181, 255), new Point(182, 257)));
		// this.Unistrokes[6] = new Unistroke("zig-zag", new Array(new Point(307, 216), new Point(333, 186), new Point(356, 215), new Point(375, 186), new Point(399, 216), new Point(418, 186)));
		// this.Unistrokes[7] = new Unistroke("arrow", new Array(new Point(68, 222), new Point(70, 220), new Point(73, 218), new Point(75, 217), new Point(77, 215), new Point(80, 213), new Point(82, 212), new Point(84, 210), new Point(87, 209), new Point(89, 208), new Point(92, 206), new Point(95, 204), new Point(101, 201), new Point(106, 198), new Point(112, 194), new Point(118, 191), new Point(124, 187), new Point(127, 186), new Point(132, 183), new Point(138, 181), new Point(141, 180), new Point(146, 178), new Point(154, 173), new Point(159, 171), new Point(161, 170), new Point(166, 167), new Point(168, 167), new Point(171, 166), new Point(174, 164), new Point(177, 162), new Point(180, 160), new Point(182, 158), new Point(183, 156), new Point(181, 154), new Point(178, 153), new Point(171, 153), new Point(164, 153), new Point(160, 153), new Point(150, 154), new Point(147, 155), new Point(141, 157), new Point(137, 158), new Point(135, 158), new Point(137, 158), new Point(140, 157), new Point(143, 156), new Point(151, 154), new Point(160, 152), new Point(170, 149), new Point(179, 147), new Point(185, 145), new Point(192, 144), new Point(196, 144), new Point(198, 144), new Point(200, 144), new Point(201, 147), new Point(199, 149), new Point(194, 157), new Point(191, 160), new Point(186, 167), new Point(180, 176), new Point(177, 179), new Point(171, 187), new Point(169, 189), new Point(165, 194), new Point(164, 196)));
		// this.Unistrokes[8] = new Unistroke("left square bracket", new Array(new Point(140, 124), new Point(138, 123), new Point(135, 122), new Point(133, 123), new Point(130, 123), new Point(128, 124), new Point(125, 125), new Point(122, 124), new Point(120, 124), new Point(118, 124), new Point(116, 125), new Point(113, 125), new Point(111, 125), new Point(108, 124), new Point(106, 125), new Point(104, 125), new Point(102, 124), new Point(100, 123), new Point(98, 123), new Point(95, 124), new Point(93, 123), new Point(90, 124), new Point(88, 124), new Point(85, 125), new Point(83, 126), new Point(81, 127), new Point(81, 129), new Point(82, 131), new Point(82, 134), new Point(83, 138), new Point(84, 141), new Point(84, 144), new Point(85, 148), new Point(85, 151), new Point(86, 156), new Point(86, 160), new Point(86, 164), new Point(86, 168), new Point(87, 171), new Point(87, 175), new Point(87, 179), new Point(87, 182), new Point(87, 186), new Point(88, 188), new Point(88, 195), new Point(88, 198), new Point(88, 201), new Point(88, 207), new Point(89, 211), new Point(89, 213), new Point(89, 217), new Point(89, 222), new Point(88, 225), new Point(88, 229), new Point(88, 231), new Point(88, 233), new Point(88, 235), new Point(89, 237), new Point(89, 240), new Point(89, 242), new Point(91, 241), new Point(94, 241), new Point(96, 240), new Point(98, 239), new Point(105, 240), new Point(109, 240), new Point(113, 239), new Point(116, 240), new Point(121, 239), new Point(130, 240), new Point(136, 237), new Point(139, 237), new Point(144, 238), new Point(151, 237), new Point(157, 236), new Point(159, 237)));
		// this.Unistrokes[9] = new Unistroke("right square bracket", new Array(new Point(112, 138), new Point(112, 136), new Point(115, 136), new Point(118, 137), new Point(120, 136), new Point(123, 136), new Point(125, 136), new Point(128, 136), new Point(131, 136), new Point(134, 135), new Point(137, 135), new Point(140, 134), new Point(143, 133), new Point(145, 132), new Point(147, 132), new Point(149, 132), new Point(152, 132), new Point(153, 134), new Point(154, 137), new Point(155, 141), new Point(156, 144), new Point(157, 152), new Point(158, 161), new Point(160, 170), new Point(162, 182), new Point(164, 192), new Point(166, 200), new Point(167, 209), new Point(168, 214), new Point(168, 216), new Point(169, 221), new Point(169, 223), new Point(169, 228), new Point(169, 231), new Point(166, 233), new Point(164, 234), new Point(161, 235), new Point(155, 236), new Point(147, 235), new Point(140, 233), new Point(131, 233), new Point(124, 233), new Point(117, 235), new Point(114, 238), new Point(112, 238)));
		// this.Unistrokes[10] = new Unistroke("v", new Array(new Point(89, 164), new Point(90, 162), new Point(92, 162), new Point(94, 164), new Point(95, 166), new Point(96, 169), new Point(97, 171), new Point(99, 175), new Point(101, 178), new Point(103, 182), new Point(106, 189), new Point(108, 194), new Point(111, 199), new Point(114, 204), new Point(117, 209), new Point(119, 214), new Point(122, 218), new Point(124, 222), new Point(126, 225), new Point(128, 228), new Point(130, 229), new Point(133, 233), new Point(134, 236), new Point(136, 239), new Point(138, 240), new Point(139, 242), new Point(140, 244), new Point(142, 242), new Point(142, 240), new Point(142, 237), new Point(143, 235), new Point(143, 233), new Point(145, 229), new Point(146, 226), new Point(148, 217), new Point(149, 208), new Point(149, 205), new Point(151, 196), new Point(151, 193), new Point(153, 182), new Point(155, 172), new Point(157, 165), new Point(159, 160), new Point(162, 155), new Point(164, 150), new Point(165, 148), new Point(166, 146)));
		// this.Unistrokes[11] = new Unistroke("delete", new Array(new Point(123, 129), new Point(123, 131), new Point(124, 133), new Point(125, 136), new Point(127, 140), new Point(129, 142), new Point(133, 148), new Point(137, 154), new Point(143, 158), new Point(145, 161), new Point(148, 164), new Point(153, 170), new Point(158, 176), new Point(160, 178), new Point(164, 183), new Point(168, 188), new Point(171, 191), new Point(175, 196), new Point(178, 200), new Point(180, 202), new Point(181, 205), new Point(184, 208), new Point(186, 210), new Point(187, 213), new Point(188, 215), new Point(186, 212), new Point(183, 211), new Point(177, 208), new Point(169, 206), new Point(162, 205), new Point(154, 207), new Point(145, 209), new Point(137, 210), new Point(129, 214), new Point(122, 217), new Point(118, 218), new Point(111, 221), new Point(109, 222), new Point(110, 219), new Point(112, 217), new Point(118, 209), new Point(120, 207), new Point(128, 196), new Point(135, 187), new Point(138, 183), new Point(148, 167), new Point(157, 153), new Point(163, 145), new Point(165, 142), new Point(172, 133), new Point(177, 127), new Point(179, 127), new Point(180, 125)));
		// this.Unistrokes[12] = new Unistroke("left curly brace", new Array(new Point(150, 116), new Point(147, 117), new Point(145, 116), new Point(142, 116), new Point(139, 117), new Point(136, 117), new Point(133, 118), new Point(129, 121), new Point(126, 122), new Point(123, 123), new Point(120, 125), new Point(118, 127), new Point(115, 128), new Point(113, 129), new Point(112, 131), new Point(113, 134), new Point(115, 134), new Point(117, 135), new Point(120, 135), new Point(123, 137), new Point(126, 138), new Point(129, 140), new Point(135, 143), new Point(137, 144), new Point(139, 147), new Point(141, 149), new Point(140, 152), new Point(139, 155), new Point(134, 159), new Point(131, 161), new Point(124, 166), new Point(121, 166), new Point(117, 166), new Point(114, 167), new Point(112, 166), new Point(114, 164), new Point(116, 163), new Point(118, 163), new Point(120, 162), new Point(122, 163), new Point(125, 164), new Point(127, 165), new Point(129, 166), new Point(130, 168), new Point(129, 171), new Point(127, 175), new Point(125, 179), new Point(123, 184), new Point(121, 190), new Point(120, 194), new Point(119, 199), new Point(120, 202), new Point(123, 207), new Point(127, 211), new Point(133, 215), new Point(142, 219), new Point(148, 220), new Point(151, 221)));
		// this.Unistrokes[13] = new Unistroke("right curly brace", new Array(new Point(117, 132), new Point(115, 132), new Point(115, 129), new Point(117, 129), new Point(119, 128), new Point(122, 127), new Point(125, 127), new Point(127, 127), new Point(130, 127), new Point(133, 129), new Point(136, 129), new Point(138, 130), new Point(140, 131), new Point(143, 134), new Point(144, 136), new Point(145, 139), new Point(145, 142), new Point(145, 145), new Point(145, 147), new Point(145, 149), new Point(144, 152), new Point(142, 157), new Point(141, 160), new Point(139, 163), new Point(137, 166), new Point(135, 167), new Point(133, 169), new Point(131, 172), new Point(128, 173), new Point(126, 176), new Point(125, 178), new Point(125, 180), new Point(125, 182), new Point(126, 184), new Point(128, 187), new Point(130, 187), new Point(132, 188), new Point(135, 189), new Point(140, 189), new Point(145, 189), new Point(150, 187), new Point(155, 186), new Point(157, 185), new Point(159, 184), new Point(156, 185), new Point(154, 185), new Point(149, 185), new Point(145, 187), new Point(141, 188), new Point(136, 191), new Point(134, 191), new Point(131, 192), new Point(129, 193), new Point(129, 195), new Point(129, 197), new Point(131, 200), new Point(133, 202), new Point(136, 206), new Point(139, 211), new Point(142, 215), new Point(145, 220), new Point(147, 225), new Point(148, 231), new Point(147, 239), new Point(144, 244), new Point(139, 248), new Point(134, 250), new Point(126, 253), new Point(119, 253), new Point(115, 253)));
		// this.Unistrokes[14] = new Unistroke("star", new Array(new Point(75, 250), new Point(75, 247), new Point(77, 244), new Point(78, 242), new Point(79, 239), new Point(80, 237), new Point(82, 234), new Point(82, 232), new Point(84, 229), new Point(85, 225), new Point(87, 222), new Point(88, 219), new Point(89, 216), new Point(91, 212), new Point(92, 208), new Point(94, 204), new Point(95, 201), new Point(96, 196), new Point(97, 194), new Point(98, 191), new Point(100, 185), new Point(102, 178), new Point(104, 173), new Point(104, 171), new Point(105, 164), new Point(106, 158), new Point(107, 156), new Point(107, 152), new Point(108, 145), new Point(109, 141), new Point(110, 139), new Point(112, 133), new Point(113, 131), new Point(116, 127), new Point(117, 125), new Point(119, 122), new Point(121, 121), new Point(123, 120), new Point(125, 122), new Point(125, 125), new Point(127, 130), new Point(128, 133), new Point(131, 143), new Point(136, 153), new Point(140, 163), new Point(144, 172), new Point(145, 175), new Point(151, 189), new Point(156, 201), new Point(161, 213), new Point(166, 225), new Point(169, 233), new Point(171, 236), new Point(174, 243), new Point(177, 247), new Point(178, 249), new Point(179, 251), new Point(180, 253), new Point(180, 255), new Point(179, 257), new Point(177, 257), new Point(174, 255), new Point(169, 250), new Point(164, 247), new Point(160, 245), new Point(149, 238), new Point(138, 230), new Point(127, 221), new Point(124, 220), new Point(112, 212), new Point(110, 210), new Point(96, 201), new Point(84, 195), new Point(74, 190), new Point(64, 182), new Point(55, 175), new Point(51, 172), new Point(49, 170), new Point(51, 169), new Point(56, 169), new Point(66, 169), new Point(78, 168), new Point(92, 166), new Point(107, 164), new Point(123, 161), new Point(140, 162), new Point(156, 162), new Point(171, 160), new Point(173, 160), new Point(186, 160), new Point(195, 160), new Point(198, 161), new Point(203, 163), new Point(208, 163), new Point(206, 164), new Point(200, 167), new Point(187, 172), new Point(174, 179), new Point(172, 181), new Point(153, 192), new Point(137, 201), new Point(123, 211), new Point(112, 220), new Point(99, 229), new Point(90, 237), new Point(80, 244), new Point(73, 250), new Point(69, 254), new Point(69, 252)));
		// this.Unistrokes[15] = new Unistroke("pigtail", new Array(new Point(81, 219), new Point(84, 218), new Point(86, 220), new Point(88, 220), new Point(90, 220), new Point(92, 219), new Point(95, 220), new Point(97, 219), new Point(99, 220), new Point(102, 218), new Point(105, 217), new Point(107, 216), new Point(110, 216), new Point(113, 214), new Point(116, 212), new Point(118, 210), new Point(121, 208), new Point(124, 205), new Point(126, 202), new Point(129, 199), new Point(132, 196), new Point(136, 191), new Point(139, 187), new Point(142, 182), new Point(144, 179), new Point(146, 174), new Point(148, 170), new Point(149, 168), new Point(151, 162), new Point(152, 160), new Point(152, 157), new Point(152, 155), new Point(152, 151), new Point(152, 149), new Point(152, 146), new Point(149, 142), new Point(148, 139), new Point(145, 137), new Point(141, 135), new Point(139, 135), new Point(134, 136), new Point(130, 140), new Point(128, 142), new Point(126, 145), new Point(122, 150), new Point(119, 158), new Point(117, 163), new Point(115, 170), new Point(114, 175), new Point(117, 184), new Point(120, 190), new Point(125, 199), new Point(129, 203), new Point(133, 208), new Point(138, 213), new Point(145, 215), new Point(155, 218), new Point(164, 219), new Point(166, 219), new Point(177, 219), new Point(182, 218), new Point(192, 216), new Point(196, 213), new Point(199, 212), new Point(201, 211)));


		//
		// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
		//
		this.Recognize = function(points, useProtractor) {
			var t0 = Date.now();
			points = TyResample(points, NumPoints);

			var radians = IndicativeAngle(points);
			points = RotateBy(points, -radians);
			points = ScaleTo(points, SquareSize);
			points = TranslateTo(points, Origin);
			var vector = Vectorize(points); // for Protractor

			var b = +Infinity;
			var u = -1;
			for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
			{
				var d;
				if (useProtractor) // for Protractor
					d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
				else // Golden Section Search (original $1)
					d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
				if (d < b) {
					b = d; // best (least) distance
					u = i; // unistroke index
				}
			}
			var t1 = Date.now();
			return (u == -1) ? new Result("No match.", 0.0, t1 - t0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal, t1 - t0);
		}
		this.AddGesture = function(name, points) {
			this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
			var num = 0;
			for (var i = 0; i < this.Unistrokes.length; i++) {
				if (this.Unistrokes[i].Name == name)
					num++;
			}
			return num;
		}
	}


}


export default TyRecognizer;