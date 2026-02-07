class GameEngine {
    constructor(options) {
        
        this.ctx = null;
        this.cameraX = 0;
        this.player = null; // store a reference so camera can follow


        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

   draw() {
  const ctx = this.ctx;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // follow player
  if (this.player && this.level) {
    const canvasW = ctx.canvas.width;
    const target = this.player.x - canvasW * 0.35;
    const maxCam = Math.max(0, this.level.width - canvasW);
    this.cameraX = Math.max(0, Math.min(target, maxCam));
  }

  // 1) BACKGROUND (no camera)
  for (let i = 0; i < this.entities.length; i++) {
    const e = this.entities[i];
    if (e.isBackground) e.draw(ctx);
  }

  // 2) WORLD (with camera)
  ctx.save();
  ctx.translate(-this.cameraX, 0);
  for (let i = 0; i < this.entities.length; i++) {
    const e = this.entities[i];
    if (!e.isUI && !e.isBackground) e.draw(ctx);
  }
  ctx.restore();

  // 3) UI (no camera)
  for (let i = 0; i < this.entities.length; i++) {
    const e = this.entities[i];
    if (e.isUI) e.draw(ctx);
  }
}

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

};