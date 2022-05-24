window.onload = function() {
	var okt1 = document.getElementById("okt1")
	,	okt1text = document.getElementById("okt1text")
	,	pers1 = document.getElementById("pers1")
	,	pers1text = document.getElementById("pers1text")
	,	gain1 = document.getElementById("gain1")
	,	gain1text = document.getElementById("gain1text")
	,	okt2 = document.getElementById("okt2")
	,	okt2text = document.getElementById("okt2text")
	,	pers2 = document.getElementById("pers2")
	,	pers2text = document.getElementById("pers2text")
	,	gain2 = document.getElementById("gain2")
	,	gain2text = document.getElementById("gain2text")
	,	gen_button = document.getElementById("generate")
	;
	
	okt1.onchange = function() {okt1text.innerHTML = okt1.value;}
	pers1.onchange = function() {pers1text.innerHTML = pers1.value;}
	gain1.onchange = function() {gain1text.innerHTML = gain1.value;}	
	okt2.onchange = function() {okt2text.innerHTML = okt2.value;}
	pers2.onchange = function() {pers2text.innerHTML = pers2.value;}
	gain2.onchange = function() {gain2text.innerHTML = gain2.value;}
	
	function myCanvas(html_id) {
		this.elem = document.getElementById(html_id);
		if (!(this.elem && this.elem.getContext)) {
			console.log("Canvas does not created.");
			return 0;
		}
		this.ctx = this.elem.getContext('2d');
		if (!this.ctx) {
			console.log("Canvas context does not created.");
			return 0;
		}
		this.w = this.ctx.canvas.width;
		this.h = this.ctx.canvas.height;
		this.imgData = this.ctx.createImageData(this.w, this.h);
		if (!(this.imgData && this.imgData.data)) {
			console.log("Canvas data does not created.");
			return 0;
		}
		
		this.getPoint = function(x,y) {
			var	posCount = 4*(y*this.w + x)
			,	r = this.imgData.data[posCount+0]
			,	g = this.imgData.data[posCount+1]
			,	b = this.imgData.data[posCount+2]
			,	a = this.imgData.data[posCount+3]
			;
			return [r,g,b,a];
		}
		this.setPoint = function(x,y,r,g,b,a) {
			var	posCount = 4*(y*this.w + x);
			this.imgData.data[posCount+0] = r;
			this.imgData.data[posCount+1] = g;
			this.imgData.data[posCount+2] = b;
			this.imgData.data[posCount+3] = a;
		}
		this.draw = function() { this.ctx.putImageData(this.imgData,0,0); }
	}
	
	function genPermutationTable() {
		return (new Array(1024)).join(',').split(',').map(function(el, idx, ar){ return Math.round(Math.random()*3); });
	}
	
	function myPermRandom(x,y, table) {
		return table[(((x * 1836311903) ^ (y * 2971215073) + 4807526976) & 1023)];
	}
	
	function QunticCurve(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
	
	function Lerp(a, b, t) { return a + t * (b - a); }
	
	function GetPseudoRandomGradientVector(x, y, table) {
		var v = myPermRandom(x,y, table);
		switch (v)
		{
			case 0:  return [ 1, 0];
			case 1:  return [-1, 0];
			case 2:  return [ 0, 1];
			default: return [ 0,-1];
		}
	}
	
	function Dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
	
	function PerlinNoise(x,y,w,h, table) {
		var	left = Math.floor(x/w)
		,	top = Math.floor(y/h)
		,	dx = x/w - left
		,	dy = y/h - top
			
		,	topLeftGradient     = GetPseudoRandomGradientVector(left,   top  , table)
		,	topRightGradient    = GetPseudoRandomGradientVector(left+1, top  , table)
		,	bottomLeftGradient  = GetPseudoRandomGradientVector(left,   top+1, table)
		,	bottomRightGradient = GetPseudoRandomGradientVector(left+1, top+1, table)
			
		,	distanceToTopLeft     = [dx  , dy  ]
		,	distanceToTopRight    = [dx-1, dy  ]
		,	distanceToBottomLeft  = [dx  , dy-1]
		,	distanceToBottomRight = [dx-1, dy-1]
			
		,	tx1 = Dot(distanceToTopLeft,     topLeftGradient)
		,	tx2 = Dot(distanceToTopRight,    topRightGradient)
		,	bx1 = Dot(distanceToBottomLeft,  bottomLeftGradient)
		,	bx2 = Dot(distanceToBottomRight, bottomRightGradient)
			
		,	dx = QunticCurve(dx)
		,	dy = QunticCurve(dy)
			
		,	tx = Lerp(tx1, tx2, dx)
		,	bx = Lerp(bx1, bx2, dx)
		,	tb = Lerp(tx, bx, dy)
		;
		return tb;
	}
	
	function NoiseOctaves(x,y,w,h,octaves,persistence,table) {
		persistence = persistence || 0.5;
		var	amplitude = 1
		,	max = 0
		,	result = 0
		;
		while (octaves-- > 0)
		{
			max += amplitude;
			result += PerlinNoise(x,y,w,h,table) * amplitude;
			amplitude *= persistence;
			x *= 2;
			y *= 2;
		}
		return result/max;
	}
	
	gen_button.onclick = function() {
		var pTable1 = genPermutationTable()
		,	pTable2 = genPermutationTable()
		;

		var pic_01 = new myCanvas('myCanvas_01');
		for (var y=0; y<pic_01.h; y++) {
			for (var x=0; x<pic_01.w; x++) {
				var a = NoiseOctaves(x, y, pic_01.w, pic_01.h, okt1.value, pers1.value, pTable1) * 256 | 0;
				pic_01.setPoint(x,y,164,188,166,a+50); // light green 164,188,166
			}
		}
		pic_01.draw();

		var pic_02 = new myCanvas('myCanvas_02');
		for (var y=0; y<pic_02.h; y++) {
			for (var x=0; x<pic_02.w; x++) {
				var a = NoiseOctaves(x, y, pic_02.w, pic_02.h, okt2.value, pers2.value, pTable2) * 256 | 0; 
				pic_02.setPoint(x,y, 92, 64, 51,a+50); // brown 92, 64, 51
			}
		}
		pic_02.draw();

		var pic_03 = new myCanvas('myCanvas_03');
		for (var y=0; y<pic_03.h; y++) {
			for (var x=0; x<pic_03.w; x++) {
				pic_03.setPoint(x,y,76,100,104,255); // dark green 76,100,104
				var	point_01 = pic_01.getPoint(x,y)
				,	point_02 = pic_02.getPoint(x,y)
				,	point_03 = pic_03.getPoint(x,y)
				,	limit_01 = gain1.value
				,	r = ( point_01[3] < limit_01 ? point_01[0] : point_03[0])
				,	g = ( point_01[3] < limit_01 ? point_01[1] : point_03[1])
				,	b = ( point_01[3] < limit_01 ? point_01[2] : point_03[2])
				,	limit_02 = gain2.value
				,	r_res = (point_02[3] < limit_02 ? point_02[0] : r)
				,	g_res = (point_02[3] < limit_02 ? point_02[1] : g)
				,	b_res = (point_02[3] < limit_02 ? point_02[2] : b)
				;
				pic_03.setPoint(x,y,r_res,g_res,b_res,255);
			}
		}
		pic_03.draw();
	}
	
	gen_button.onclick();
 }
