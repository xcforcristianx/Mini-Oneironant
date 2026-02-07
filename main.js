const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// --- Assets ---
ASSET_MANAGER.queueDownload("./dungeon.png");
ASSET_MANAGER.queueDownload("./Star.png");
ASSET_MANAGER.queueDownload("./HeroIdle_fixed_strip.png");
ASSET_MANAGER.queueDownload("./HeroWalk_fixed_strip.png");
ASSET_MANAGER.queueDownload("./HeroJump_fixed_strip.png");
ASSET_MANAGER.queueDownload("./HeroSprint_fixed_strip.png");
ASSET_MANAGER.queueDownload("./HeroDamage_fixed_strip.png");

ASSET_MANAGER.queueDownload("./FloorTerrainLeft.PNG");
ASSET_MANAGER.queueDownload("./FloorTerrainRight.PNG");
ASSET_MANAGER.queueDownload("./LongTerrain.PNG");
ASSET_MANAGER.queueDownload("./MediumTerrain.PNG");
ASSET_MANAGER.queueDownload("./SmallTerrain.png");

ASSET_MANAGER.downloadAll(() => {
  const canvas = document.getElementById("gameWorld");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  canvas.focus();

  // --- Music ---
const music = new MusicManager("./Mini-Oneironant.mp3", { loop: true, volume: 0.35 });
gameEngine.music = music;

// Unlock music on first click or keypress (autoplay-safe)
music.installUnlock(canvas);

  const level = new Level(gameEngine);
  gameEngine.level = level;

  const hero = new Hero(gameEngine);
  gameEngine.player = hero;

  gameEngine.addEntity(new Background(gameEngine, "./dungeon.png"));
  gameEngine.addEntity(level);
  gameEngine.addEntity(hero);

  const hud = new HUD(gameEngine);
  hud.isUI = true;              // see section 4
  gameEngine.addEntity(hud);

  gameEngine.init(ctx);
  gameEngine.start();
});