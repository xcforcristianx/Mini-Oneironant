class Hero {
  constructor(game) {
    this.game = game;

    // === SPRITE PATHS ===
    // If your images are inside an Assets/ folder, change these to "./Assets/..."
    const IDLE_PATH   = "./HeroIdle_fixed_strip.png";
    const WALK_PATH   = "./HeroWalk_fixed_strip.png";
    const SPRINT_PATH = "./HeroSprint_fixed_strip.png";
    const JUMP_PATH   = "./HeroJump_fixed_strip.png";
    const HURT_PATH   = "./HeroDamage_fixed_strip.png";

    // Load sheets (fallbacks prevent blank screen if you forgot to queue one)
    this.idleSheet   = ASSET_MANAGER.getAsset(IDLE_PATH);
    this.walkSheet   = ASSET_MANAGER.getAsset(WALK_PATH)   || this.idleSheet;
    this.sprintSheet = ASSET_MANAGER.getAsset(SPRINT_PATH) || this.walkSheet || this.idleSheet;
    this.jumpSheet   = ASSET_MANAGER.getAsset(JUMP_PATH)   || this.idleSheet;
    this.hurtSheet   = ASSET_MANAGER.getAsset(HURT_PATH)   || this.idleSheet;

    // === ANIM SETUP ===
    this.scale = 3.0;

    // IDLE strip: 6 frames
    this.idleCols = 6;
    this.idleFrameW = Math.floor(this.idleSheet.width / this.idleCols);
    this.idleFrameH = Math.floor(this.idleSheet.height);
    this.idle = new Animator(this.idleSheet, 0, 0, this.idleFrameW, this.idleFrameH, 6, 0.12, true);

    // WALK strip: 6 frames
    this.walkCols = 6;
    this.walkFrameW = Math.floor(this.walkSheet.width / this.walkCols);
    this.walkFrameH = Math.floor(this.walkSheet.height);
    this.walk = new Animator(this.walkSheet, 0, 0, this.walkFrameW, this.walkFrameH, 6, 0.10, true);

    // SPRINT strip: 6 frames
    this.sprintCols = 6;
    this.sprintFrameW = Math.floor(this.sprintSheet.width / this.sprintCols);
    this.sprintFrameH = Math.floor(this.sprintSheet.height);
    this.sprint = new Animator(this.sprintSheet, 0, 0, this.sprintFrameW, this.sprintFrameH, 6, 0.07, true);

    // JUMP strip: 6 frames (doesn't loop; holds last frame)
    this.jumpCols = 6;
    this.jumpFrameW = Math.floor(this.jumpSheet.width / this.jumpCols);
    this.jumpFrameH = Math.floor(this.jumpSheet.height);
    this.jump = new Animator(this.jumpSheet, 0, 0, this.jumpFrameW, this.jumpFrameH, 6, 0.10, false);

    // HURT strip: 4 frames (doesn't loop; holds last frame)
    this.hurtCols = 4;
    this.hurtFrameW = Math.floor(this.hurtSheet.width / this.hurtCols);
    this.hurtFrameH = Math.floor(this.hurtSheet.height);
    this.hurt = new Animator(this.hurtSheet, 0, 0, this.hurtFrameW, this.hurtFrameH, 4, 0.08, false);

    // Reference size so animation swaps don't "pop"
    this.baseDrawW = this.idleFrameW * this.scale;
    this.baseDrawH = this.idleFrameH * this.scale;

    // FEET alignment (tweak these numbers if needed)
    // Positive y draws hero LOWER, negative y draws hero HIGHER.
    this.offsets = {
      IDLE:   { x: 0, y: 22 },
      WALK:   { x: 0, y: 22 },
      SPRINT: { x: 0, y: 22 },
      JUMP:   { x: 0, y: -18 },
      HURT:   { x: 0, y: -10 }
    };

    // === STATE ===
    this.state = "IDLE"; // IDLE | WALK | SPRINT | JUMP | HURT
    this.facing = 1;     // 1 right, -1 left

    // === SPAWN / SCORE ===
    this.spawnX = 120;
    this.spawnY = 200;
    this.starsCollected = 0;

    // === PHYSICS ===
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;

    // Tweak for feel
    this.gravity = 2400;
    this.jumpV = -950;
    this.accel = 3200;
    this.friction = 2600;
    this.maxWalk = 280;
    this.maxRun = 440;

    // press-once tracking
    this.jumpWasDown = false;

    // hurt press-once + timer
    this.hurtWasDown = false;
    this.hurtTimer = 0;
    this.hurtDuration = 0.35;
  }

  // Stable collision box based on IDLE size
  getHitbox() {
    const w = this.idleFrameW * this.scale * 0.55;
    const h = this.idleFrameH * this.scale * 0.80;

    return {
      x: this.x + (this.idleFrameW * this.scale - w) / 2,
      y: this.y + (this.idleFrameH * this.scale - h),
      w,
      h
    };
  }

  rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  resolveCollisions(axis) {
    const plats = this.game.level?.platforms ?? [];

    for (const p of plats) {
      const s = p.scale ?? 1;
      const pb = { x: p.x, y: p.y, w: p.w * s, h: p.h * s };

      const hb = this.getHitbox();
      if (!this.rectsOverlap(hb, pb)) continue;

      if (axis === "x") {
        if (this.vx > 0) {
          const overlap = (hb.x + hb.w) - pb.x;
          this.x -= overlap;
        } else if (this.vx < 0) {
          const overlap = (pb.x + pb.w) - hb.x;
          this.x += overlap;
        }
        this.vx = 0;
      } else {
        if (this.vy > 0) {
          // landing
          const overlap = (hb.y + hb.h) - pb.y;
          this.y -= overlap;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          // head bonk
          const overlap = (pb.y + pb.h) - hb.y;
          this.y += overlap;
          this.vy = 0;
        }
      }
    }
  }

  update() {
    const dt = this.game.clockTick;

    // --- Hurt timer ---
    if (this.hurtTimer > 0) {
      this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    }

    const left  = this.game.keys["ArrowLeft"];
    const right = this.game.keys["ArrowRight"];
    const run   = this.game.keys["Shift"];

    // Jump key (space might come as " " or "Space")
    const jumpDown = this.game.keys[" "] || this.game.keys["Space"];
    const jumpPressed = jumpDown && !this.jumpWasDown;
    this.jumpWasDown = !!jumpDown;

    // Hurt key: H
    const hurtDown = this.game.keys["h"] || this.game.keys["H"];
    const hurtPressed = hurtDown && !this.hurtWasDown;
    this.hurtWasDown = !!hurtDown;

    // Trigger hurt
    if (hurtPressed && this.hurtTimer === 0) {
      this.hurtTimer = this.hurtDuration;
      this.hurt.reset();
      this.state = "HURT";
    }

    const isHurt = this.hurtTimer > 0;
    const maxSpeed = run ? this.maxRun : this.maxWalk;

    // Horizontal controls (disabled during hurt)
    if (!isHurt) {
      if (left) {
        this.vx -= this.accel * dt;
        this.facing = -1;
      } else if (right) {
        this.vx += this.accel * dt;
        this.facing = 1;
      } else {
        if (this.vx > 0) this.vx = Math.max(0, this.vx - this.friction * dt);
        if (this.vx < 0) this.vx = Math.min(0, this.vx + this.friction * dt);
      }

      // Clamp speed
      this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));

      // Jump
      if (jumpPressed && this.onGround) {
        this.vy = this.jumpV;
        this.onGround = false;
        this.jump.reset(); // play jump from frame 0
      }
    } else {
      // During hurt, slow down horizontally
      if (this.vx > 0) this.vx = Math.max(0, this.vx - this.friction * dt);
      if (this.vx < 0) this.vx = Math.min(0, this.vx + this.friction * dt);
    }

    // Gravity
    this.vy += this.gravity * dt;

    // Move + collide
    this.x += this.vx * dt;
    this.resolveCollisions("x");

    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveCollisions("y");

    // --- Collect stars ---
    const stars = this.game.level?.stars ?? [];
    const hb = this.getHitbox();
    for (const st of stars) {
      if (st.taken) continue;
      if (this.rectsOverlap(hb, st)) {
        st.taken = true;
        this.starsCollected += 1;
      }
    }

    // Animation state priority
    if (this.hurtTimer > 0) {
      this.state = "HURT";
    } else if (!this.onGround) {
      this.state = "JUMP";
    } else if (Math.abs(this.vx) > 15) {
      this.state = run ? "SPRINT" : "WALK";
    } else {
      this.state = "IDLE";
    }

    // Respawn if you fall off the screen (back to beginning)
    const canvasH = this.game.ctx.canvas.height;
    if (this.y > canvasH + 400) {
      this.x = this.spawnX;
      this.y = this.spawnY;
      this.vx = 0;
      this.vy = 0;
      this.hurtTimer = 0;
      this.state = "IDLE";
    }
  }

  draw(ctx) {
    // Choose anim
    let anim = this.idle;
    let frameW = this.idleFrameW;
    let frameH = this.idleFrameH;

    if (this.state === "WALK") {
      anim = this.walk;
      frameW = this.walkFrameW;
      frameH = this.walkFrameH;
    } else if (this.state === "SPRINT") {
      anim = this.sprint;
      frameW = this.sprintFrameW;
      frameH = this.sprintFrameH;
    } else if (this.state === "JUMP") {
      anim = this.jump;
      frameW = this.jumpFrameW;
      frameH = this.jumpFrameH;
    } else if (this.state === "HURT") {
      anim = this.hurt;
      frameW = this.hurtFrameW;
      frameH = this.hurtFrameH;
    }

    // Align bottom-center to idle reference size
    const drawW = frameW * this.scale;
    const drawH = frameH * this.scale;

    const drawX = this.x + (this.baseDrawW - drawW) / 2;
    const drawY = this.y + (this.baseDrawH - drawH);

    // Apply per-animation offsets (feet alignment)
    const off = this.offsets[this.state] || { x: 0, y: 0 };
    const finalX = drawX + off.x;
    const finalY = drawY + off.y;

    // Draw with facing flip
    if (this.facing === -1) {
      ctx.save();
      ctx.translate(finalX + drawW, finalY);
      ctx.scale(-1, 1);
      anim.drawFrame(this.game.clockTick, ctx, 0, 0, this.scale);
      ctx.restore();
    } else {
      anim.drawFrame(this.game.clockTick, ctx, finalX, finalY, this.scale);
    }

    // OPTIONAL DEBUG HITBOX:
    // const hb = this.getHitbox();
    // ctx.save();
    // ctx.strokeStyle = "red";
    // ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
    // ctx.restore();
  }
}