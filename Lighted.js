var VSHADER_SOURCE =`
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;

    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_NormalMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
        v_VertPos = u_ModelMatrix * a_Position;
    }`;

var FSHADER_SOURCE =`
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;

    uniform vec4        u_FragColor;
    uniform sampler2D   u_Sampler0;
    uniform sampler2D   u_Sampler1;
    uniform sampler2D   u_Sampler2;
    uniform int         u_whichTexture;
    uniform vec3        u_lightPos;
    uniform vec3        u_cameraPos;
    uniform bool        u_lightON;

    void main() {
        if(u_whichTexture == -3){
            gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); }
            
        else if(u_whichTexture == -2){
            gl_FragColor = u_FragColor; }

        else if(u_whichTexture == -1){
            gl_FragColor = vec4(v_UV, .7, .9); }

        else if(u_whichTexture == 0){
            gl_FragColor = texture2D(u_Sampler0, v_UV); }

        else if(u_whichTexture == 1){
            gl_FragColor = texture2D(u_Sampler1, v_UV); }

        else if(u_whichTexture == 2){
            gl_FragColor = texture2D(u_Sampler2, v_UV); }

        else { gl_FragColor = vec4(0, .25, .5, 1); }

        // lighting
        vec3 lightVector = u_lightPos - vec3(v_VertPos);
        float r = length(lightVector);

        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float NdotL = max(dot(N,L),0.0);

        vec3 R = reflect(-L,N);
        vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
        float specular = pow(max(dot(E,R), 0.0), 100.0) * 0.8;

        vec3 diffuse = vec3(gl_FragColor) * NdotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;

        if(u_lightON){
            if(u_whichTexture == 0){
                gl_FragColor = vec4(diffuse + ambient, 1.0);
            }
            else if(u_whichTexture == 4){
                // gl_FragColor = u_FragColor;
            }
            else{ gl_FragColor = vec4(specular + diffuse + ambient, 1.0); }
        }
    }`;
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;

let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_cameraPos;

let g_light_sun     = [0,5,0];
let g_light_vol     = [0,10,-1];
let g_lightPos      = g_light_sun;
let g_normalOn      = false;
let g_lightON       = true; 

let g_map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,6,6,1,1,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,6,6,1,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,6,6,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,6,6,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,6,6,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,6,6,1,1,1,1,6,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1],
    [1,1,1,1,1,1,6,6,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,6,6,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,6,6,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,6,6,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,6,6,6,1,1,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,6,6,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,6,6,6,6,6,6,6,6,6],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
    [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1,1,6],
  ]

let g_globalAngle   = 0;
var g_startTime     = performance.now()/1000.0;
var g_seconds       = performance.now()/1000.0 - g_startTime;
let g_camera;



const TEXTURES = {
    DEBUG: -1,
    COLOR: 0,
    TEXTURE0: 1,
    TEXTURE1: 2,
    TEXTURE2: 3
  }

  let g_cursorSpeed = 0.25;
  let g_Invert = {'x': false, 'y': false};
  const MOVEMENT_SPEEDS = {
    MOVE: 0.15,
    MOVE_ACCEL: 0.01,
    PAN: 2.5,
    PAN_ACCEL: 0.25
  }
  let isMoving = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    leftPan: false,
    rightPan: false,
    upPan: false,
    downPan: false
  };
  let currentSpeeds = {
    z: 0,
    x: 0,
    y: 0,
    yPan: 0,
    xPan: 0
  }
  function resetUI() {
    document.getElementById("FOVSlide").value = g_camera.fov;
    sendTextToHTML(g_camera.fov, "FOV");
  
    document.getElementById("MouseSlide").value = g_cursorSpeed;
  
    document.getElementById("xInv").value = g_Invert['x'];
    document.getElementById("yInv").value = g_Invert['y'];
  }
  function setupUIListeners() {

    canvas.onclick = async () => { if( !document.pointerLockElement ) { await canvas.requestPointerLock(); } };
    document.addEventListener("pointerlockchange", () => {
      if(document.pointerLockElement === canvas) {
        document.onmousemove = (e) => rotateCam(e);
        document.onclick = (e) => {
          let blockPos = [];
          blockPos.push(Math.round(g_camera.at.elements[0]) + 16);
          blockPos.push(Math.round(g_camera.at.elements[1]) - MIN_Y);
          blockPos.push(Math.round(g_camera.at.elements[2]) + 16);
  
          if(e.button == 2) {
            setBlock(blockPos[0], blockPos[1], blockPos[2], TEXTURES.TEXTURE2);
          } else if(e.button == 0) {
            removeBlock(blockPos[0], blockPos[1], blockPos[2]);
          }
        }
      } else {
        document.onmousemove = null;
        document.onclick = null;
      }
    })
    document.onkeydown = (e) => handleKeys(e, true);
    document.onkeyup = (e) => handleKeys(e, false);
  
    
  }


  function rotateCam(event) {
    if(g_Invert['x']) {
      g_camera.panLeft(event.movementX * g_cursorSpeed);
    } else {
      g_camera.panRight(event.movementX * g_cursorSpeed);
    }
  
    if(g_Invert['y']) {
      g_camera.panUp(event.movementY * g_cursorSpeed);
    } else {
      g_camera.panDown(event.movementY * g_cursorSpeed);
    }
  }
  
  function handleKeys(event, keyDown) {
    switch(event.code) {
      case "ArrowUp":
      case "KeyW":
        isMoving.forward = keyDown;
        break;
      case "ArrowDown":
      case "KeyS":
        isMoving.backward = keyDown;
        break;
      case "ArrowLeft":
      case "KeyA":
        isMoving.left = keyDown;
        break;
      case "ArrowRight":
      case "KeyD":
        isMoving.right = keyDown;
        break;
      case "Space":
        isMoving.up = keyDown;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        isMoving.down = keyDown;
        break;
      case "KeyQ":
        isMoving.panLeft = keyDown;
        break;
      case "KeyE":
        isMoving.panRight = keyDown;
        break;
      case "KeyZ":
        isMoving.panUp = keyDown;
        break;
      case "KeyX":
        isMoving.panDown = keyDown;
        break;
      default:
        break;
    }
  }
  
  function handleMovement() {
  
    g_camera.moveForward(move(isMoving.forward, isMoving.backward, 'z', MOVEMENT_SPEEDS.MOVE, MOVEMENT_SPEEDS.MOVE_ACCEL));
    g_camera.moveRight(move(isMoving.right, isMoving.left, 'x', MOVEMENT_SPEEDS.MOVE, MOVEMENT_SPEEDS.MOVE_ACCEL));
    g_camera.moveUp(move(isMoving.up, isMoving.down, 'y', MOVEMENT_SPEEDS.MOVE, MOVEMENT_SPEEDS.MOVE_ACCEL));
    g_camera.panRight(move(isMoving.panRight, isMoving.panLeft, 'yPan', MOVEMENT_SPEEDS.PAN, MOVEMENT_SPEEDS.PAN_ACCEL));
    g_camera.panUp(move(isMoving.panUp, isMoving.panDown, 'xPan', MOVEMENT_SPEEDS.PAN, MOVEMENT_SPEEDS.PAN_ACCEL));
  }
  
  
  function move(positive, negative, speedIndex, maxSpeed, accel = Infinity) {
  
    let netDirection = 0;
    if(positive) {
      netDirection += 1;
    }
    if(negative) {
      netDirection -= 1;
    }
    
    let maxVelocity = netDirection * maxSpeed;
  
    if(maxVelocity < currentSpeeds[speedIndex]) {
      currentSpeeds[speedIndex] = (currentSpeeds[speedIndex] - accel < maxVelocity) ? maxVelocity : currentSpeeds[speedIndex] - accel;
    } else if(maxVelocity > currentSpeeds[speedIndex]) {
      currentSpeeds[speedIndex] = (currentSpeeds[speedIndex] + accel > maxVelocity) ? maxVelocity : currentSpeeds[speedIndex] + accel;
    }
  
    return currentSpeeds[speedIndex];
  }
  
  function setupCanvas(){
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", {preseveDrawingBuffer: true}); 
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    g_camera = new Camera();
}

function connectVariablesToGLSL(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if(a_Normal < 0){
        console.log('Failed to create the a_Normal object');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0){
        console.log('Failed to create the u_Sampler0 object');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log('Failed to create the u_whichTexture object');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if(!u_lightPos){
        console.log('Failed to create the u_lightPos object');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if(!u_cameraPos){
        console.log('Failed to create the u_cameraPos object');
        return;
    }

    u_lightON = gl.getUniformLocation(gl.program, 'u_lightON');
    if(!u_lightON){
        console.log('Failed to create the u_lightON object');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionForHtmlUI(){
    document.getElementById('normalOn').onclick  = function(){g_normalOn = true; }
    document.getElementById('normalOff').onclick = function(){g_normalOn = false;}

    document.getElementById('lightSwitch').onclick  = function(){g_lightON = !g_lightON;}

    document.getElementById('lightX').onmousemove = function(ev){g_light_sun[0] = this.value/5; renderAllShapes;}
    document.getElementById('lightY').onmousemove = function(ev){g_light_sun[1] = this.value/5; renderAllShapes;}
    document.getElementById('lightZ').onmousemove = function(ev){g_light_sun[2] = this.value/5; renderAllShapes;}

    
}

function initTextures(){
    const images = [new Image(), new Image(), new Image()];
    const textureHandlers = [sendTextureToTEXTURE0, sendTextureToTEXTURE1, sendTextureToTEXTURE2];
    
    for (let i = 0; i < images.length; i++) {
        images[i].onload = () => textureHandlers[i](images[i]);
        images[i].src = 'sand.png';
    }
    return true;
}

function sendTexture(image, textureUnit, sampler){
    const texture = gl.createTexture();
    if (!texture) {
        console.log(`Failed to create texture${textureUnit} object`);
        return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl[`TEXTURE${textureUnit}`]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(sampler, textureUnit);
}

function sendTextureToTEXTURE0(image) { sendTexture(image, 0, u_Sampler0); }
function sendTextureToTEXTURE1(image) { sendTexture(image, 1, u_Sampler1); }
function sendTextureToTEXTURE2(image) { sendTexture(image, 2, u_Sampler2); }


function main(){
    setupCanvas();                   
    connectVariablesToGLSL();           
    addActionForHtmlUI();               
    initTextures();
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    setupUIListeners();
    resetUI();
    requestAnimationFrame(tick);
}

function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    handleMovement();        
    renderAllShapes();                                  
    requestAnimationFrame(tick);                       
}


function sendTextToHTML(text, destination) {
    let elem = document.getElementById(destination);
    if(!elem) {
      console.error(`Failed to get ${destination}`);
      return;
    }
    elem.innerHTML = text;
  }


  function renderAllShapes() {
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, new Matrix4().rotate(g_globalAngle, 0, 1, 0).elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3f(u_lightPos, -g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightON, g_lightON);

    var light = new Sphere();
    light.color = [1, 0, 0, 1];
    light.matrix.translate(-g_light_vol[0], g_light_vol[1], g_light_vol[2]);
    light.matrix.scale(-2, -2, -2);
    light.render();

    var sky = new Cube();
    sky.color = [0, 0, 0.2, 1];
    sky.matrix.translate(-1.3, -0.5, -1.3);
    sky.matrix.scale(60, 60, 60);
    sky.render();

    for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
            let height = g_map[x][y];
            if (height > 0) {
                let texture = g_normalOn ? -3 : height < 6 ? 1 : 2;
                for (let z = 0; z < height; z++) {
                    var c = new Cube();
                    c.textureNum = texture;
                    c.matrix.translate(y - 4, z - 0.75, x - 4);
                    c.optimize();
                }
            }
        }
    }
    renderAlien();
}
