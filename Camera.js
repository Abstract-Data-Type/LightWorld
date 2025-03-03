class Camera {
    static DIRECTIONS = {
      FORWARD: 0,
      BACKWARD: 1,
      LEFT: 2,
      RIGHT: 3,
      UP: 4,
      DOWN: 5
    }
  
    constructor() {
      this.fov = 60;
      this.eye = new Vector3([10, 1, 8]);
      this.at = new Vector3([9, 1, 8]);
      this.up = new Vector3([0, 1, 0]);
      this.viewMatrix = new Matrix4();
      this.setView();
      this.projectionMatrix = new Matrix4();
      this.resetPerspective();
    }
  
    setPos(pos) {
      this.eye = pos;
      this.setView();
    }
  
    setPos(at) {
      this.at = at;
      this.setView();
    }
  
    setPos(up) {
      this.up = up;
      this.setView();
    }
  
    setView() {
      this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0], this.at.elements[1], this.at.elements[2],
        this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }
  
    resetPerspective() {
      this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }
  
    move(speed, direction) {
      if (speed === 0) return;
  
      let movement = new Vector3();
      switch (direction) {
        case Camera.DIRECTIONS.FORWARD:
          movement.set(this.at).sub(this.eye);
          break;
        case Camera.DIRECTIONS.BACKWARD:
          movement.set(this.eye).sub(this.at);
          break;
        case Camera.DIRECTIONS.LEFT:
          movement.set(this.at).sub(this.eye);
          movement = Vector3.cross(this.up, movement);
          break;
        case Camera.DIRECTIONS.RIGHT:
          movement.set(this.at).sub(this.eye);
          movement = Vector3.cross(movement, this.up);
          break;
        case Camera.DIRECTIONS.UP:
          movement.set(this.up);
          break;
        case Camera.DIRECTIONS.DOWN:
          movement.set(this.up).mul(-1);
          break;
        default:
          console.warn(`Invalid direction passed to Camera.move(): ${direction}`);
          return;
      }
  
      if (movement.magnitude() === 0) return;
  
      movement.normalize().mul(speed);
  
      let nextSpot = new Vector3(this.at.elements);
      nextSpot.add(movement);
      if (nextSpot.elements[0] < -16 || nextSpot.elements[0] > 16 || nextSpot.elements[2] < -16 || nextSpot.elements[2] > 16) {
        return;
      }
  
      this.eye.add(movement);
      this.at.add(movement);
      this.setView();
    }
  
    moveForward(speed) {
      this.move(speed, Camera.DIRECTIONS.FORWARD);
    }
  
    moveBackward(speed) {
      this.move(speed, Camera.DIRECTIONS.BACKWARD);
    }
  
    moveLeft(speed) {
      this.move(speed, Camera.DIRECTIONS.LEFT);
    }
  
    moveRight(speed) {
      this.move(speed, Camera.DIRECTIONS.RIGHT);
    }
  
    moveUp(speed) {
      this.move(speed, Camera.DIRECTIONS.UP);
    }
  
    moveDown(speed) {
      this.move(speed, Camera.DIRECTIONS.DOWN);
    }
  
    pan(alpha, direction) {
      if (alpha === 0) return;
  
      let f = new Vector3();
      f.set(this.at).sub(this.eye);
      let xRotate = Vector3.cross(f, this.up).elements;
      const THETA = Math.acos(Vector3.dot(this.up, f) / (this.up.magnitude() * f.magnitude())) * 180 / Math.PI;
  
      function keepInRange(alpha, direction) {
        const EPSILON = 0.001;
        let newTheta = direction ? THETA - alpha : THETA + alpha;
        if (newTheta > 180 - EPSILON || newTheta < EPSILON) return 0;
        return alpha;
      }
  
      let rotationMatrix = new Matrix4();
      switch (direction) {
        case Camera.DIRECTIONS.LEFT:
          rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
          break;
        case Camera.DIRECTIONS.RIGHT:
          rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
          break;
        case Camera.DIRECTIONS.UP:
          alpha = keepInRange(alpha, true);
          rotationMatrix.setRotate(alpha, xRotate[0], xRotate[1], xRotate[2]);
          break;
        case Camera.DIRECTIONS.DOWN:
          alpha = keepInRange(alpha, false);
          rotationMatrix.setRotate(-alpha, xRotate[0], xRotate[1], xRotate[2]);
          break;
        default:
          console.warn(`Invalid direction passed to Camera.pan(): ${direction}`);
          return;
      }
  
      let fPrime = rotationMatrix.multiplyVector3(f).normalize();
      this.at.set(this.eye).add(fPrime);
      this.setView();
    }
  
    panLeft(alpha) {
      this.pan(alpha, Camera.DIRECTIONS.LEFT);
    }
  
    panRight(alpha) {
      this.pan(alpha, Camera.DIRECTIONS.RIGHT);
    }
  
    panUp(alpha) {
      this.pan(alpha, Camera.DIRECTIONS.UP);
    }
  
    panDown(alpha) {
      this.pan(alpha, Camera.DIRECTIONS.DOWN);
    }
  }
  