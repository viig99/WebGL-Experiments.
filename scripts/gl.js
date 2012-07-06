$(function(){
	webgl.start();
});

var webgl = {
	shaderProgram: new Function(),
	triangleVertexPositionBuffer: null,
	squareVertexPositionBuffer: null,
    lastTime: 0,
    mvStack: new Array(),
    rTri: 0,
    rSquare: 0,
	start: function() {
		$('#c').attr('width',screen.width).attr('height',screen.height);
		var c = $('#c')[0],t = this;
		t.initGL(c);
		t.initShaders();
		t.initBuffers();
		t.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		t.gl.enable(t.gl.DEPTH_TEST);
        t.animate();
	},
	initGL: function(c) {
		try {
			var gl = c.getContext('experimental-webgl');
			gl.viewportWidth = c.width;
			gl.viewportHeight = c.height;
			this.gl = gl;
		} catch(e) {
			throw "WebGL not found.";
		}
	},
	initShaders: function() {
		var t = this;
        var fragmentShader = t.getShader(t.gl, "shader-fs");
        var vertexShader = t.getShader(t.gl, "shader-vs");
        t.mvMatrix = mat4.create();
        t.pMatrix = mat4.create();
        var shaderProgram = t.gl.createProgram();
        t.gl.attachShader(shaderProgram, vertexShader);
        t.gl.attachShader(shaderProgram, fragmentShader);
        t.gl.linkProgram(shaderProgram);

        if (!t.gl.getProgramParameter(shaderProgram, t.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        t.gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = t.gl.getAttribLocation(shaderProgram, "aVertexPosition");
        t.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexColorAttribute = t.gl.getAttribLocation(shaderProgram, "aVertexColor");
        t.gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

        shaderProgram.pMatrixUniform = t.gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = t.gl.getUniformLocation(shaderProgram, "uMVMatrix");
        t.shaderProgram = shaderProgram;
    },
    getShader: function(gl, id) {
        var shaderScript = document.getElementById(id),str = "",shader;
        if (!shaderScript) {
            return null;
        }
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
		gl.shaderSource(shader, str);
        gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return null;
        }
		return shader;
    },
    setMatrixUniforms: function() {
    	var t = this;
        t.gl.uniformMatrix4fv(t.shaderProgram.pMatrixUniform, false, t.pMatrix);
        t.gl.uniformMatrix4fv(t.shaderProgram.mvMatrixUniform, false, t.mvMatrix);
    },
    initBuffers: function() {
        var t = this,vertices,color,triangleVertexPositionBuffer,squareVertexPositionBuffer,triangleVertexColorBuffer,squareVertexColorBuffer;
        triangleVertexPositionBuffer = t.gl.createBuffer();
        squareVertexPositionBuffer = t.gl.createBuffer();
        triangleVertexColorBuffer = t.gl.createBuffer();
        squareVertexColorBuffer = t.gl.createBuffer();

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        vertices = [
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(vertices), t.gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 3;

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, triangleVertexColorBuffer);
        color = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ]
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(color), t.gl.STATIC_DRAW);
        triangleVertexColorBuffer.itemSize = 4;
        triangleVertexColorBuffer.numItems = 3;

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(vertices), t.gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, squareVertexColorBuffer);
        color = [];
        for (var i=0; i < 4; i++) {
            color = color.concat([189/255, 212/255, 222/255, 1.0]);
        }
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(color), t.gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;

        t.triangleVertexPositionBuffer = triangleVertexPositionBuffer,t.squareVertexPositionBuffer = squareVertexPositionBuffer,t.triangleVertexColorBuffer = triangleVertexColorBuffer,t.squareVertexColorBuffer = squareVertexColorBuffer;
    },
    drawScene: function() {
    	var t = this;
        t.gl.viewport(0, 0, t.gl.viewportWidth, t.gl.viewportHeight);
        t.gl.clear(t.gl.COLOR_BUFFER_BIT | t.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, t.gl.viewportWidth / t.gl.viewportHeight, 0.1, 100.0, t.pMatrix);

        mat4.identity(t.mvMatrix);

        mat4.translate(t.mvMatrix, [-1.5, 0.0, -7.0]);

        t.mvPushMatrix();      // It not relative by itself. (Hence we need the push-pop mechanism to get it back to its original state.)
        mat4.rotate(t.mvMatrix,t.rTri,[0,1,0]);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.triangleVertexPositionBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexPositionAttribute, t.triangleVertexPositionBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.triangleVertexColorBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexColorAttribute, t.triangleVertexColorBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.setMatrixUniforms();
        t.gl.drawArrays(t.gl.TRIANGLES, 0, t.triangleVertexPositionBuffer.numItems);
        t.mvPopStack();


        mat4.translate(t.mvMatrix, [3.0, 0.0, 0.0]);

        t.mvPushMatrix();
        mat4.rotate(t.mvMatrix,t.rSquare,[1,0,0]);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.squareVertexPositionBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexPositionAttribute, t.squareVertexPositionBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.squareVertexColorBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexColorAttribute, t.squareVertexColorBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.setMatrixUniforms();
        t.gl.drawArrays(t.gl.TRIANGLE_STRIP, 0, t.squareVertexPositionBuffer.numItems);
        t.mvPopStack();
	},
    animate: function() {
        var t = webgl;
        requestAnimationFrame(t.animate);
        t.drawScene();
        t.changleAngle();
    },
    changleAngle: function() {
        var timeNow = new Date().getTime(),t = this;
        if (t.lastTime != 0) {
            var elapsed = timeNow - t.lastTime;
            t.rTri += ((90 * elapsed) / 1000.0).toRad();
            t.rSquare += ((75 * elapsed) / 1000.0).toRad();
        }
        t.lastTime = timeNow;
    },
    mvPushMatrix: function() {
        var c = mat4.create(),t = this;
        mat4.set(t.mvMatrix,c);
        t.mvStack.push(c);
    },
    mvPopStack: function() {
        var t = this;
        if (t.mvStack.length <= 0 ) throw "Invalid Pop.";
        t.mvMatrix = t.mvStack.pop();
    }
}

Number.prototype.toRad = function() {
    return this * Math.PI/180;
};