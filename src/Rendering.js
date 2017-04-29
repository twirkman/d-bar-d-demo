import {Vector, Matrix, makeLookAt, makeOrtho, makePerspective, makeFrustum} from './glUtils';
import React, { Component } from 'react';

const $V = global.$V;
const $M = global.$M;

var gl;

let groundVertsBuffer;
let groundVertsColorBuffer;

var cubeVerticesBuffer;
var cubeVerticesColorBuffer;
var cubeVerticesIndexBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0.0;
var cubeXOffset = 0.0;
var cubeYOffset = 0.0;
var cubeZOffset = 0.0;
var lastCubeUpdateTime = 0;
var xIncValue = 0.2;
var yIncValue = -0.4;
var zIncValue = 0.3;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;
var perspectiveMatrix;

class Rendering extends Component {
  constructor (props) {
    super(props);

    this.drawScene = this.drawScene.bind(this);
  }

  componentDidMount () {
    this.initCanvas();
  }

  initCanvas () {
    gl = this.refs.canvas.getContext('webgl') 
      || this.refs.canvas.getContext('experimental-webgl');

    if (!gl) {
      alert('Unable to initialize WebGL. Your browser may not support it.');
    }

    gl.clearColor(0.568, 0.694, 0.855, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    initShaders();
    initBuffers();

    setInterval(this.drawScene, 15);
  }

  drawScene () {
    const roofPitch = 3.0 / 12.0;
    const l = this.props.l;
    const w = this.props.w;
    const h = this.props.h;
    const roofHeight = (w / 2) * roofPitch;
    const sweep = Math.max(l, w);

    cubeVerticesBuffer = generateBuildingVerts(l, w, h);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Establish the camera frustum: FOV, AR, near plane, far plane
    perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 1000.0);

    // Set the drawing position to the center of the scene.
    loadIdentity();

    // Position the camera.
    const ey = Math.max(h + roofHeight - 1.0, 5.0);
    const ez = Math.sqrt(l * l + w * w) * 1.1;
    const cy = (h + roofHeight) / 2.0;

    const camera = makeLookAt(
      0.0, ey, ez,
      0.0, cy, 0.0,
      0.0, 1.0, 0.0,
    );
    multMatrix(camera);

    // Save the current matrix, then rotate before we draw.
    mvPushMatrix();
    mvRotate(cubeRotation, [0, 1, 0]);

    // Draw the ground 
    gl.bindBuffer(gl.ARRAY_BUFFER, groundVertsBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, groundVertsColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Draw the building 
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    // Restore the original matrix

    mvPopMatrix();

    // Update the rotation for the next draw, if it's time to do so.

    var currentTime = (new Date).getTime();
    if (lastCubeUpdateTime) {
      var delta = currentTime - lastCubeUpdateTime;

      cubeRotation += (30 * delta) / 1000.0;
      cubeXOffset += xIncValue * ((30 * delta) / 1000.0);
      cubeYOffset += yIncValue * ((30 * delta) / 1000.0);
      cubeZOffset += zIncValue * ((30 * delta) / 1000.0);

      if (Math.abs(cubeYOffset) > 2.5) {
        xIncValue = -xIncValue;
        yIncValue = -yIncValue;
        zIncValue = -zIncValue;
      }
    }

    lastCubeUpdateTime = currentTime;
  }

  render() {
    return (
      <canvas ref="canvas" width={720} height={480}/>
    );
  }
}

function generateBuildingVerts (l, w, h) {
  const x = w / 2.0;
  const y = h;
  const z = l / 2.0;

  const verts = [
    // Front face
    -x, 0,  z,
     x, 0,  z,
     x, y,  z,
    -x, y,  z,

    // Back face
    -x, 0, -z,
    -x, h, -z,
     x, h, -z,
     x, 0, -z,

    // Top face
    -x, h, -z,
    -x, h,  z,
     x, h,  z,
     x, h, -z,

    // Bottom face
    -x, 0, -z,
     x, 0, -z,
     x, 0,  z,
    -x, 0,  z,

    // Right face
     x, 0, -z,
     x, h, -z,
     x, h,  z,
     x, 0,  z,

    // Left face
    -x, 0, -z,
    -x, 0,  z,
    -x, h,  z,
    -x, h, -z
  ];

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  return buffer;
}

/**
 * Create vertex and color buffers
 */
function initBuffers() {
  
  /////////////////////////////////////////////////////////////////////////////
  // Ground 
  /////////////////////////////////////////////////////////////////////////////

  const groundVerts = [
     1000.0, -0.01, -1000.0,
    -1000.0, -0.01, -1000.0,
     1000.0, -0.01,  1000.0,
    -1000.0, -0.01,  1000.0,
  ];

  const groundVertColors = [
    0.0, 0.384, 0.145, 1.0,
    0.0, 0.384, 0.145, 1.0,
    0.0, 0.384, 0.145, 1.0,
    0.0, 0.384, 0.145, 1.0,
  ];

  groundVertsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, groundVertsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundVerts), gl.STATIC_DRAW);

  groundVertsColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, groundVertsColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundVertColors), gl.STATIC_DRAW);

  /////////////////////////////////////////////////////////////////////////////
  // Building
  /////////////////////////////////////////////////////////////////////////////

  var colors = [
    [0.8,  0.8,  0.8,  1.0],    // Front face
    [0.8,  0.8,  0.8,  1.0],    // Back face
    [0.9,  0.9,  0.9,  1.0],    // Top face
    [0.2,  0.2,  0.2,  1.0],    // Bottom face
    [0.7,  0.7,  0.7,  1.0],    // Right face
    [0.7,  0.7,  0.7,  1.0],    // Left face
  ];

  // Convert the array of colors into a table for all the vertices.

  let generatedColors = [];

  for (var j=0; j<6; j++) {
    var c = colors[j];

    // Repeat each color four times for the four vertices of the face

    for (var i=0; i<4; i++) {
      generatedColors = generatedColors.concat(c);
    }
  }

  cubeVerticesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's position.
  const cubeVertexIndices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ];

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}




/**
 * Initialize the shaders, so WebGL knows how to light our scene.
 */
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // Create the shader program

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
  }

  gl.useProgram(shaderProgram);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(vertexColorAttribute);
}

/**
 * Loads a shader program by scouring the current document,
 * looking for a script with the specified ID.
 */
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
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  // Now figure out what type of shader script we have,
  // based on its MIME type.

  var shader;

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
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
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }

  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;

  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}

export default Rendering;
