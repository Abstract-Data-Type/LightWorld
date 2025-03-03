let sideMovement = 0;      // Current side movement position
let movementSpeed = 0.03;  // Speed of side movement
let moveDirection = 1;     // Direction of movement (1 or -1)
let head_animation = 0;    // Animation for head rotation
let hideLeftEye = false;   // Whether to hide left eye
let g_jointAngle = 30;     // Angle for tentacle joints

function renderAlien() {
    // Update the side movement for animation
    sideMovement += movementSpeed * moveDirection;
    
    // Change direction when reaching a limit
    if (sideMovement > 1 || sideMovement < -1) {
        moveDirection *= -1; // Reverse the direction
    }
    
    // Animate the tentacles' sway
    g_jointAngle = 20 * Math.sin(g_seconds * 2) + 30; // Sway the tentacles with some animation
    
    var purple = [0.6, 0.2, 0.8, 1.0];  // Main jellyfish color
    var lightPurple = [0.7, 0.3, 0.9, 1.0];  // For highlights
    var white = [1.0, 1.0, 1.0, 1.0];   // For eyes
    var black = [0.0, 0.0, 0.0, 1.0];   // For pupils
    
    // Position the entire character
    var characterX = 5;  // X-axis position
    var characterY = 5;  // Y-axis position (higher)
    var characterZ = 0;  // Z-axis position (depth)
    
    // Debugging the position
    console.log(`Jellyfish position: X = ${characterX + sideMovement}, Y = ${characterY}, Z = ${characterZ}`);
    
    // --- Head (main cube) ---
    var head = new Cube();
    head.color = purple;
    head.matrix.translate(characterX + sideMovement, characterY, characterZ);
    head.matrix.rotate(-head_animation, 1, 0, 0);
    head.matrix.scale(0.4, 0.4, 0.4);
    head.render();
    
    // --- Body (additional body part below the head) ---
    var body = new Cube();
    body.color = purple;
    body.matrix.translate(characterX + sideMovement, characterY - 0.5, characterZ);
    body.matrix.rotate(-head_animation, 1, 0, 0);
    body.matrix.scale(0.5, 1.0, 0.5);  // Make it more elongated to represent the body
    body.render();
    
    // --- Face ---
    var face = new Cube();
    face.color = lightPurple;
    face.matrix.translate(characterX + sideMovement, characterY, characterZ + 0.2);
    face.matrix.rotate(-head_animation, 1, 0, 0);
    face.matrix.scale(0.35, 0.35, 0.03);
    face.render();
    
    // --- Eyes (attached to the head) ---
    var lefteye = new Cube();
    lefteye.color = white;
    lefteye.matrix.translate(characterX + sideMovement - 0.15, characterY + 0.1, characterZ + 0.21);
    lefteye.matrix.rotate(-head_animation, 1, 0, 0);
    lefteye.matrix.scale(0.08, 0.08, 0.02);
    lefteye.render();
    
    var righteye = new Cube();
    righteye.color = white;
    righteye.matrix.translate(characterX + sideMovement + 0.15, characterY + 0.1, characterZ + 0.21);
    righteye.matrix.rotate(-head_animation, 1, 0, 0);
    righteye.matrix.scale(0.08, 0.08, 0.02);
    righteye.render();
    
    // --- Pupils (attached to the eyes) ---
    var leftpupil = new Cube();
    leftpupil.color = black;
    leftpupil.matrix.translate(characterX + sideMovement - 0.15, characterY + 0.1, characterZ + 0.21);
    leftpupil.matrix.scale(0.03, 0.03, 0.02);
    leftpupil.render();
    
    var rightpupil = new Cube();
    rightpupil.color = black;
    rightpupil.matrix.translate(characterX + sideMovement + 0.15, characterY + 0.1, characterZ + 0.21);
    rightpupil.matrix.scale(0.03, 0.03, 0.02);
    rightpupil.render();
    
    // --- Tentacles (4 static, with slight animation) ---
    var tentacleColor = [0.4, 0.2, 0.7, 1.0];
    
    // Positions for each tentacle around the body
    var tentaclePositions = [
        { x: -0.1, z: 0.1 },  // Front-left
        { x: 0.4, z: 0.1 },   // Front-right
        { x: -0.1, z: -0.1 }, // Back-left
        { x: 0.4, z: -0.1 }   // Back-right
    ];
    
    // Loop to render all 4 tentacles with slight animation
    for (var i = 0; i < 4; i++) {
        var offsetX = tentaclePositions[i].x;
        var offsetZ = tentaclePositions[i].z;
        
        var tentacle = new Cube();
        tentacle.color = tentacleColor;
        tentacle.matrix.translate(characterX + sideMovement + offsetX, characterY - 0.6, characterZ + offsetZ);
        
        // Slight sway animation for each tentacle
        var sway = Math.sin(g_seconds * 2 + i) * 5; // Different sway for each tentacle (based on index)
        tentacle.matrix.rotate(sway, 1, 0, 0);  // Animate sway in the X direction
        
        tentacle.matrix.scale(0.05, 0.2, 0.05);  // Tentacle size
        tentacle.render();
    }
    
}

class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;

        this.verts = [
            // Front
            0, 0, 0, 1, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 1, 0, 1, 1, 0,

            // Top
            0, 1, 0, 1, 1, 1, 1, 1, 0,
            0, 1, 0, 0, 1, 1, 1, 1, 1,

            // Bottom
            0, 1, 0, 1, 1, 1, 1, 1, 0,
            0, 1, 0, 0, 1, 1, 1, 1, 1,

            // Left
            1, 0, 0, 1, 1, 1, 1, 1, 0,
            1, 0, 0, 1, 0, 1, 1, 1, 1,

            // Right
            0, 0, 0, 0, 1, 1, 0, 1, 0,
            0, 0, 0, 0, 0, 1, 0, 1, 1,

            // Back
            0, 0, 1, 1, 1, 1, 0, 1, 1,
            0, 0, 1, 1, 0, 1, 1, 1, 1
        ];

        this.uvVerts = [
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1
        ];

        this.NormalVerts = [
            0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 1, 0, 0, 1, 0, 0, 1, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0,
            0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1
        ];
    }

    render() {
        const rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...rgba);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        // Rendering all faces of the cube with the same method
        this._renderFace([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0], [0, 0, -1, 0, 0, -1, 0, 0, -1]);
        this._renderFace([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 0], [0, 0, -1, 0, 0, -1, 0, 0, -1]);

        this._renderFace([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0]);
        this._renderFace([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0]);

        this._renderFace([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0]);
        this._renderFace([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0]);

        this._renderFace([1, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0]);
        this._renderFace([1, 0, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0]);

        this._renderFace([0, 0, 0, 0, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);
        this._renderFace([0, 0, 0, 0, 0, 1, 0, 1, 1], [0, 0, 0, 1, 1, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);

        this._renderFace([0, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
        this._renderFace([0, 0, 1, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
    }

    _renderFace(vertices, uvs, normals) {
        drawTriangle3DUVNormal(vertices, uvs, normals);
    }

    optimize() {
        const rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...rgba);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUVNormal(this.verts, this.uvVerts, this.NormalVerts);
    }
}

class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);

        var d = this.size / 200.0;
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
    }
}

function drawTriangle(vertices) {
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer = null;

function initTriangle3D() {
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
}

function drawTriangle3D(vertices) {
    var n = vertices.length / 3;

    if (!g_vertexBuffer) initTriangle3D();

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
    var n = vertices.length;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, n / 3);

    g_vertexBuffer = null;
}

function drawTriangle3DUVNormal(vertices, uv, normal) {
    var n = vertices.length;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    var normalBuffer = gl.createBuffer();
    if (!normalBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, n / 3);

    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(uvBuffer);
    gl.deleteBuffer(normalBuffer);
}

class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;

        this.verts = [];
        this.uvVerts = [];
        this.NormalVerts = [];
        this._generateSphereGeometry();
    }

    _generateSphereGeometry() {
        const d = Math.PI / 10; // delta1
        const dd = Math.PI / 10; // delta2

        for (let t = 0; t < Math.PI; t += d) {
            for (let r = 0; r < 2 * Math.PI; r += d) {
                const p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];
                const p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd)];
                const p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t)];
                const p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd)];

                const uv1 = [t / Math.PI, r / (2 * Math.PI)];
                const uv2 = [(t + dd) / Math.PI, r / (2 * Math.PI)];
                const uv3 = [t / Math.PI, (r + dd) / (2 * Math.PI)];
                const uv4 = [(t + dd) / Math.PI, (r + dd) / (2 * Math.PI)];

                this.verts.push(...p1, ...p2, ...p4);
                this.uvVerts.push(...uv1, ...uv2, ...uv4);
                this.NormalVerts.push(...p1, ...p2, ...p4);

                this.verts.push(...p1, ...p4, ...p3);
                this.uvVerts.push(...uv1, ...uv4, ...uv3);
                this.NormalVerts.push(...p1, ...p4, ...p3);
            }
        }
    }

    render() {
        const rgba = this.color;
        
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...rgba);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
        
        drawTriangle3DUVNormal(this.verts, this.uvVerts, this.NormalVerts);
    }

    optimize() {
        const rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...rgba);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUVNormal(this.verts, this.uvVerts, this.NormalVerts);
    }
}
