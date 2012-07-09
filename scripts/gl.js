$(function(){
	webgl.start();
});

var webgl = {
	shaderProgram: new Function(),
	pyramidVertexPositionBuffer: null,
	cubeVertexPositionBuffer: null,
    lastTime: 0,
    mvStack: new Array(),
    r1: 0,
    r2: 0,
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
        var t = this,vertices,color,pyramidVertexPositionBuffer,cubeVertexPositionBuffer,pyramidVertexColorBuffer,cubeVertexColorBuffer,cubeVertexIndexBuffer;
        pyramidVertexPositionBuffer = t.gl.createBuffer();
        cubeVertexPositionBuffer = t.gl.createBuffer();
        pyramidVertexColorBuffer = t.gl.createBuffer();
        cubeVertexColorBuffer = t.gl.createBuffer();
        cubeVertexIndexBuffer = t.gl.createBuffer();

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         0.0,  1.0,  0.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
         0.0,  1.0,  0.0,
         1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
         0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0
        ];
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(vertices), t.gl.STATIC_DRAW);
        pyramidVertexPositionBuffer.itemSize = 3;
        pyramidVertexPositionBuffer.numItems = 12;

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        color = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0
        ];
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(color), t.gl.STATIC_DRAW);
        pyramidVertexColorBuffer.itemSize = 4;
        pyramidVertexColorBuffer.numItems = 12;

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        vertices = [
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
        ];
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(vertices), t.gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        color = [[1.0, 0.0, 0.0, 1.0],
                [1.0, 1.0, 0.0, 1.0],
                [0.0, 1.0, 0.0, 1.0],     
                [1.0, 0.5, 0.5, 1.0],     
                [1.0, 0.0, 1.0, 1.0],     
                [0.0, 0.0, 1.0, 1.0],     
        ];
        var unpackedColors = [];
        color.forEach(function(x){
            for (var i=0; i < 4; i++) {
                unpackedColors = unpackedColors.concat(x);
            }
        },this);
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(unpackedColors), t.gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 4;
        cubeVertexColorBuffer.numItems = 24;

        cubeVertexIndexBuffer = t.gl.createBuffer();
        t.gl.bindBuffer(t.gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        var cubeVertexIndices = [
         0, 1, 2,      0, 2, 3,    // Front face
         4, 5, 6,      4, 6, 7,    // Back face
         8, 9, 10,     8, 10, 11,  // Top face
         12, 13, 14,   12, 14, 15, // Bottom face
         16, 17, 18,   16, 18, 19, // Right face
         20, 21, 22,   20, 22, 23  // Left face
        ]
        t.gl.bufferData(t.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), t.gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;

        t.pyramidVertexPositionBuffer = pyramidVertexPositionBuffer,t.cubeVertexPositionBuffer = cubeVertexPositionBuffer,t.pyramidVertexColorBuffer = pyramidVertexColorBuffer,t.cubeVertexColorBuffer = cubeVertexColorBuffer,t.cubeVertexIndexBuffer = cubeVertexIndexBuffer;
    },
    drawScene: function() {
    	var t = this;
        t.gl.viewport(0, 0, t.gl.viewportWidth, t.gl.viewportHeight);
        t.gl.clear(t.gl.COLOR_BUFFER_BIT | t.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, t.gl.viewportWidth / t.gl.viewportHeight, 0.1, 100.0, t.pMatrix);

        mat4.identity(t.mvMatrix);

        mat4.translate(t.mvMatrix, [-1.5, 0.0, -7.0]);

        t.mvPushMatrix();      // It not relative by itself. (Hence we need the push-pop mechanism to get it back to its original state.)
        mat4.rotate(t.mvMatrix,t.r1,[0,1,0]);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.pyramidVertexPositionBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexPositionAttribute, t.pyramidVertexPositionBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.pyramidVertexColorBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexColorAttribute, t.pyramidVertexColorBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.setMatrixUniforms();
        t.gl.drawArrays(t.gl.TRIANGLES, 0, t.pyramidVertexPositionBuffer.numItems);
        t.mvPopStack();


        mat4.translate(t.mvMatrix, [3.0, 0.0, 0.0]);

        t.mvPushMatrix();
        mat4.rotate(t.mvMatrix,t.r2,[1,1,1]);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.cubeVertexPositionBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexPositionAttribute, t.cubeVertexPositionBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.cubeVertexColorBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexColorAttribute, t.cubeVertexColorBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.gl.bindBuffer(t.gl.ELEMENT_ARRAY_BUFFER, t.cubeVertexIndexBuffer);
        t.setMatrixUniforms();
        t.gl.drawElements(t.gl.TRIANGLES, t.cubeVertexIndexBuffer.numItems, t.gl.UNSIGNED_SHORT, 0);
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
            t.r1 += ((90 * elapsed) / 1000.0).toRad();
            t.r2 += ((75 * elapsed) / 1000.0).toRad();
        }
        t.r1%=2*Math.PI,t.r2%=2*Math.PI;
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