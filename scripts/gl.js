$(function(){
	webgl.start();
});

var webgl = {
	shaderProgram: new Function(),
	triangleVertexPositionBuffer: null,
	squareVertexPositionBuffer: null,
	start: function() {
		$('#c').attr('width',500).attr('height',500);
		var c = $('#c')[0],t = this;
		t.initGL(c);
		t.initShaders(c);
		t.initBuffers(c);
		t.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		t.gl.enable(t.gl.DEPTH_TEST);
		t.drawScene();
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
        var t = this,triangleVertexPositionBuffer,squareVertexPositionBuffer;
        triangleVertexPositionBuffer = squareVertexPositionBuffer = t.gl.createBuffer();
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        t.gl.bufferData(t.gl.ARRAY_BUFFER, new Float32Array(vertices), t.gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 3;

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
        t.triangleVertexPositionBuffer = triangleVertexPositionBuffer,t.squareVertexPositionBuffer = squareVertexPositionBuffer;
    },
    drawScene: function() {
    	var t = this;
        t.gl.viewport(0, 0, t.gl.viewportWidth, t.gl.viewportHeight);
        t.gl.clear(t.gl.COLOR_BUFFER_BIT | t.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, t.gl.viewportWidth / t.gl.viewportHeight, 0.1, 100.0, t.pMatrix);

        mat4.identity(t.mvMatrix);

        mat4.translate(t.mvMatrix, [-1.5, 0.0, -7.0]);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.triangleVertexPositionBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexPositionAttribute, t.triangleVertexPositionBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.setMatrixUniforms();
        t.gl.drawArrays(t.gl.TRIANGLES, 0, t.triangleVertexPositionBuffer.numItems);


        mat4.translate(t.mvMatrix, [3.0, 0.0, 0.0]);
        t.gl.bindBuffer(t.gl.ARRAY_BUFFER, t.squareVertexPositionBuffer);
        t.gl.vertexAttribPointer(t.shaderProgram.vertexPositionAttribute, t.squareVertexPositionBuffer.itemSize, t.gl.FLOAT, false, 0, 0);
        t.setMatrixUniforms();
        t.gl.drawArrays(t.gl.TRIANGLE_STRIP, 0, t.squareVertexPositionBuffer.numItems);
	}
}