class Entity {
  constructor({ name = "Unknown", x = 0, y = 0, velX = 0, velY = 0}) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
  }
}