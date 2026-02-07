class Level {
  constructor(game) {
    this.game = game;

    // Longer world
    this.width = 12000;

    this.platforms = [];
    this.stars = [];

    const STAR_SIZE = 40;

    const addGround = (x, w) => {
      this.platforms.push({
        x,
        y: 650,
        w,
        h: 120,
        img: "./FloorTerrainLeft.PNG",
        scale: 1.0
      });
    };

    const addStarOnPlatform = (platform, xOffset, yOffset = 10) => {
      this.stars.push({
        x: platform.x + xOffset,
        y: platform.y - STAR_SIZE - yOffset, // always above platform
        w: STAR_SIZE,
        h: STAR_SIZE,
        taken: false
      });
    };

    const addPlat = (x, y, type) => {
      let p;
      if (type === "S") p = { x, y, w: 147, h: 74,  img: "./SmallTerrain.png",  scale: 1.0 };
      if (type === "M") p = { x, y, w: 213, h: 74,  img: "./MediumTerrain.PNG", scale: 1.0 };
      if (type === "L") p = { x, y, w: 378, h: 100, img: "./LongTerrain.PNG",  scale: 1.0 };
      this.platforms.push(p);
      return p;
    };

    // ----- Ground with gaps (no floor in some areas) -----
    addGround(0, 1200);
    // gap: 1200-1600
    addGround(1550, 850);
    // gap: 2500-2900
    addGround(2900, 1450);
    // gap: 4300-4700
    addGround(4700, 800);
    // gap: 5800-6400
    addGround(6400, 1750);
    // gap: 8000-8500
    addGround(8500, 1400);
    addGround(10000, 1800);

    // ----- Obstacle patterns -----

    // 1) Stair steps
    let p = addPlat(600, 560, "S");
    addStarOnPlatform(p, 40);
    addPlat(760, 520, "S");
    p = addPlat(920, 480, "S");
    addStarOnPlatform(p, 40);

    // 2) Two mid-air jumps
    p = addPlat(1750, 520, "M");
    addStarOnPlatform(p, 80);
    addPlat(2100, 460, "S");
    p = addPlat(2350, 400, "S");
    addStarOnPlatform(p, 40);

    // 3) Long platform + star trail
    p = addPlat(3200, 520, "L");
    addStarOnPlatform(p, 60);
    addStarOnPlatform(p, 160);
    addStarOnPlatform(p, 260);

    // 4) Tall “tower” jumps (harder)
    addPlat(5000, 560, "S");
    p = addPlat(5200, 480, "S");
    addStarOnPlatform(p, 40);
    addPlat(5400, 400, "S");
    p = addPlat(5600, 320, "S");
    addStarOnPlatform(p, 40);

    // 5) Over a big ground gap (forces sprint jump)
    p = addPlat(6150, 520, "M");
    addStarOnPlatform(p, 80);
    p = addPlat(6600, 480, "M");
    addStarOnPlatform(p, 80);
    p = addPlat(7050, 520, "M");
    addStarOnPlatform(p, 80);

    // 6) End section: zig-zag
    p = addPlat(9000, 520, "M");
    addStarOnPlatform(p, 80);
    p = addPlat(9350, 440, "S");
    addStarOnPlatform(p, 40);
    p = addPlat(9650, 520, "M");
    addStarOnPlatform(p, 80);

    // Extra: a “goal” star cluster near the end
    p = addPlat(11200, 520, "L");
    addStarOnPlatform(p, 120);
    addStarOnPlatform(p, 180);
    addStarOnPlatform(p, 240);
  }

  update() {
    // (optional later: moving platforms, enemies, etc.)
  }

  draw(ctx) {
    // Draw platforms
    for (const p of this.platforms) {
      const img = ASSET_MANAGER.getAsset(p.img);
      const s = p.scale ?? 1;
      ctx.drawImage(img, p.x, p.y, p.w * s, p.h * s);

      // debug:
      // ctx.strokeRect(p.x, p.y, p.w * s, p.h * s);
    }

    // Draw stars
    const starImg = ASSET_MANAGER.getAsset("./Star.png");
    for (const st of this.stars) {
      if (st.taken) continue;
      ctx.drawImage(starImg, st.x, st.y, st.w, st.h);

      // debug:
      // ctx.strokeRect(st.x, st.y, st.w, st.h);
    }
  }
}