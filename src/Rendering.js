import {Vector, Matrix, makeLookAt, makePerspective} from './glUtils';
import React, { Component } from 'react';

class Rendering extends Component {
  constructor (props) {
    super(props);

    this.interval = 15;
    this.rotation = 0.0;
    this.rotationSpeed = 30;
    this.rotating = true;
    this.aspectRatio = 640.0 / 480.0;
    this.maxWidth = 640;
    this.mvMatrixStack = [];

    this.drawScene = this.drawScene.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.resizeThrottler = this.resizeThrottler.bind(this);
  }

  resizeThrottler () {
    const self = this;
    let resizeTimeout;
    if (!resizeTimeout) {
      resizeTimeout = setTimeout(() => {
        resizeTimeout = null;
        self.resizeHandler();
      }, self.interval);
    }
  }

  resizeHandler() {
    const canvas = this.gl.canvas;
    const width = Math.min(canvas.parentElement.parentElement.clientWidth - 30, this.maxWidth);
    const height = width / this.aspectRatio;
    canvas.width = width;
    canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  handleClick (event) {
    event.preventDefault();
    this.rotating = !this.rotating;
  }

  componentDidMount () {
    this.initCanvas();
    window.addEventListener("resize", this.resizeThrottler, false);
    this.resizeHandler();
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.resizeThrottler, false);
    clearInterval(this.timerID);
  }

  initCanvas () {
    const canvas = this.refs.canvas;
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!this.gl) {
      alert('Unable to initialize WebGL. Your browser may not support it. Try Chrome or Firefox.');
    }

    this.gl.clearColor(0.568, 0.694, 0.855, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.initShaders();
    this.initStaticBuffers();

    // Establish the camera frustum: FOV, AR, near plane, far plane
    this.perspectiveMatrix = makePerspective(45, this.aspectRatio, 0.1, 1000.0);

    this.timerID = setInterval(this.drawScene, this.interval);
  }

  drawScene () {
    const length = this.props.length;
    const width = this.props.width;
    const height = this.props.height;
    const roofHeight = (width / 2) * this.props.pitch;
    const isBuilding = length && width && height;
    const doors = this.props.doors;
    const rotationAxis = [0, 1, 0];

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Set the drawing position to the center of the scene.
    this.mvMatrix = loadIdentity();

    // Position the camera.
    let ey = 1;
    let ez = 1;
    let cy = 1;
    if (isBuilding) {
      ey = Math.max(height, 1.0);
      ez = Math.max(Math.sqrt(length * length + width * width), (height + roofHeight) * 2) * 1.2;
      cy = Math.max((height + roofHeight) / 2.0, 1.0);
    }
    const camera = makeLookAt(
      0.0, ey, ez,
      0.0, cy, 0.0,
      0.0, 1.0, 0.0,
    );
    this.mvMatrix = multMatrix(this.mvMatrix, camera);

    // Save the current matrix, then rotate before we draw.
    this.mvPushMatrix();
    this.mvMatrix = rotateMatrix(this.mvMatrix, this.rotation, rotationAxis);

    // Draw the ground 
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.groundVertsBuffer);
    this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.groundVertsColorBuffer);
    this.gl.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl.FLOAT, false, 0, 0);

    this.setMatrixUniforms();
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    // Draw the building
    if (isBuilding) {
      this.buildingVertsBuffer = generateBuildingVerts(this.gl, length, width, height, roofHeight);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buildingVertsBuffer);
      this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buildingVertsColorBuffer);
      this.gl.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl.FLOAT, false, 0, 0);

      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buildingVertsIndexBuffer);

      this.setMatrixUniforms();
      this.gl.drawElements(this.gl.TRIANGLES, 48, this.gl.UNSIGNED_SHORT, 0);

      const doorOffset = 0.03;

      doors.forEach((door) => {
        this.mvPushMatrix();

        let rot;
        let trans;
        switch (parseInt(door.wall)) {
          case 0:
            rot = 0;
            trans = [0, 0, (length / 2.0) + doorOffset];
            break;
          case 1:
            rot = 180;
            trans = [0, 0, (length / 2.0) + doorOffset];
            break;
          case 2:
            rot = 90;
            trans = [0, 0, (width / 2.0) + doorOffset];
            break;
          case 3:
            rot = 270;
            trans = [0, 0, (width / 2.0) + doorOffset];
            break;
        }

        this.mvMatrix = rotateMatrix(this.mvMatrix, rot, rotationAxis);
        this.mvMatrix = translateMatrix(this.mvMatrix, trans);

        this.setMatrixUniforms();
        this.drawDoor(this.gl, door);

        this.mvPopMatrix();
      });
    }

    // Restore the original matrix
    this.mvPopMatrix();

    // Update the rotation for the next draw
    const currentTime = (new Date()).getTime();
    const delta = currentTime - (this.lastUpdateTime || currentTime);
    this.lastUpdateTime = currentTime;
    if (this.rotating) {
      this.rotation += (this.rotationSpeed * delta) / 1000.0;
    }
  }

  drawDoor (gl, door) {
    const x = door.width / 2.0;
    const y = door.height;

    const verts = [
       x, y, 0,
      -x, y, 0,
       x, 0, 0,
      -x, 0, 0,
    ];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    const validColors = [
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ];

    const invalidColors = [
      0.85, 0.325, 0.31, 1.0,
      0.85, 0.325, 0.31, 1.0,
      0.85, 0.325, 0.31, 1.0,
      0.85, 0.325, 0.31, 1.0,
    ];

    const vertColors = door.valid ? validColors : invalidColors;

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  initStaticBuffers () {
    // Ground

    const groundVerts = [
      1000.0, -0.01, -1000.0,
      -1000.0, -0.01, -1000.0,
      1000.0, -0.01,  1000.0,
      -1000.0, -0.01,  1000.0,
    ];

    this.groundVertsBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.groundVertsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(groundVerts), this.gl.STATIC_DRAW);

    // Ground colors

    const groundVertColors = [
      0.0, 0.384, 0.145, 1.0,
      0.0, 0.384, 0.145, 1.0,
      0.0, 0.384, 0.145, 1.0,
      0.0, 0.384, 0.145, 1.0,
    ];

    this.groundVertsColorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.groundVertsColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(groundVertColors), this.gl.STATIC_DRAW);

    // Building colors

    const faceColors = [
      [0.8,  0.8,  0.8,  1.0],    // Front face
      [0.8,  0.8,  0.8,  1.0],    // Back face
      [0.7,  0.7,  0.7,  1.0],    // Right face
      [0.7,  0.7,  0.7,  1.0],    // Left face
      [0.2,  0.2,  0.2,  1.0],    // Bottom face
      [0.9,  0.9,  0.9,  1.0],    // Roof right face
      [0.94, 0.94, 0.94, 1.0],    // Roof left face
    ];

    // Convert face colors into a color for each vertex.
    let buildingVertColors = [];

    faceColors.forEach((color) => {
      // Repeat each color four times for the four vertices of the face
      for (let i = 0; i < 4; i++) {
        buildingVertColors = buildingVertColors.concat(color);
      }
    });

    // Repeat the front and back colors for the 3 vertices of the roof front and back.
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        buildingVertColors = buildingVertColors.concat(faceColors[i]);
      }
    }

    this.buildingVertsColorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buildingVertsColorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(buildingVertColors), this.gl.STATIC_DRAW);

    // Building vertex indices
    
    // Each rect rendered as 2 triangles, plus 2 more for the roof sides
    const buildingVertIndices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // right
      12, 13, 14,     12, 14, 15,   // left
      16, 17, 18,     16, 18, 19,   // bottom
      20, 21, 22,     20, 22, 23,   // roof right
      24, 25, 26,     24, 26, 27,   // roof left
      28, 29, 30,                   // roof front
      31, 32, 33,                   // roof back
    ];

    // Element Array Buffer maps into building vertices buffer
    this.buildingVertsIndexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buildingVertsIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(buildingVertIndices), this.gl.STATIC_DRAW);
  }

  setMatrixUniforms () {
    const pUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

    const mvUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
    this.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(this.mvMatrix.flatten()));
  }

  initShaders () {
    const fragmentShader = getShader(this.gl, "shader-fs");
    const vertexShader = getShader(this.gl, "shader-vs");

    // Create the shader program
    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);

    // If creating the shader program failed, alert
    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " + this.gl.getProgramInfoLog(this.shaderProgram));
    }

    this.gl.useProgram(this.shaderProgram);

    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
    this.gl.enableVertexAttribArray(this.vertexColorAttribute);
  }

  mvPushMatrix (m) {
    if (m) {
      this.mvMatrixStack.push(m.dup());
      this.mvMatrix = m.dup();
    } else {
      this.mvMatrixStack.push(this.mvMatrix.dup());
    }
  }

  mvPopMatrix () {
    if (!this.mvMatrixStack.length) {
      throw(new Error(`Can't pop from an empty matrix stack.`));
    }

    this.mvMatrix = this.mvMatrixStack.pop();
    return this.mvMatrix;
  }

  render() {
    return (
      <canvas ref="canvas" width={640} height={480} onClick={this.handleClick}/>
    );
  }
}

function generateBuildingVerts (gl, length, width, height, roofHeight) {
  const x = width / 2.0;
  const y = height;
  const z = length / 2.0;
  const r = height + roofHeight;

  const verts = [
    // Front face
    -x,  0,  z,
     x,  0,  z,
     x,  y,  z,
    -x,  y,  z,

    // Back face
    -x,  0, -z,
    -x,  y, -z,
     x,  y, -z,
     x,  0, -z,

    // Right face
     x,  0, -z,
     x,  y, -z,
     x,  y,  z,
     x,  0,  z,

    // Left face
    -x,  0, -z,
    -x,  0,  z,
    -x,  y,  z,
    -x,  y, -z,

    // Bottom face
    -x,  0, -z,
     x,  0, -z,
     x,  0,  z,
    -x,  0,  z,

    // Roof right face
     x,  y, -z,
     0,  r, -z,
     0,  r,  z,
     x,  y,  z,

    // Roof left face
    -x,  y,  z,
     0,  r,  z,
     0,  r, -z,
    -x,  y, -z,

    // Roof front face
    -x,  y,  z,
     x,  y,  z,
     0,  r,  z,

    // Roof back face
     x,  y, -z,
    -x,  y, -z,
     0,  r, -z,
  ];

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  return buffer;
}

//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.

  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.

  var theSource = "";
  var currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType === 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  // Now figure out what type of shader script we have,
  // based on its MIME type.

  var shader;

  if (shaderScript.type === "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object

  gl.shaderSource(shader, theSource);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
  return Matrix.I(4);
}

function multMatrix(m, n) {
  return m.x(n);
}

function translateMatrix(m, v) {
  return multMatrix(m, Matrix.Translation(Vector.create([v[0], v[1], v[2]])).ensure4x4());
}

function rotateMatrix(m, angle, v) {
  const inRadians = angle * Math.PI / 180.0;

  const n = Matrix.Rotation(inRadians, Vector.create([v[0], v[1], v[2]])).ensure4x4();
  return multMatrix(m, n);
}

export default Rendering;
