class HUD {
  constructor(game) {
    this.isUI = true;
    this.game = game;

    // Mute button (top-left)
    this.muteBtn = { x: 16, y: 16, w: 44, h: 44 };
  }

  pointInRect(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  update() {
    // Handle click on mute button
    if (this.game.click) {
      const c = this.game.click;

      if (this.pointInRect(c, this.muteBtn)) {
        // Toggle music (only if music exists)
        if (this.game.music && typeof this.game.music.toggleMute === "function") {
          this.game.music.toggleMute();
        }
      }

      // IMPORTANT: clear click so it doesn't toggle forever
      this.game.click = null;
    }
  }

  draw(ctx) {
    ctx.save();

    // ---------- MUTE BUTTON ----------
    const music = this.game.music;
    const isMuted = !music || music.enabled === false; // uses MusicManager.enabled

    // button background
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "black";
    ctx.fillRect(this.muteBtn.x, this.muteBtn.y, this.muteBtn.w, this.muteBtn.h);

    // button border
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.muteBtn.x, this.muteBtn.y, this.muteBtn.w, this.muteBtn.h);

    // icon
    ctx.fillStyle = "white";
    ctx.font = "26px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isMuted ? "🔇" : "🔊",
      this.muteBtn.x + this.muteBtn.w / 2,
      this.muteBtn.y + this.muteBtn.h / 2 + 1
    );

    // small hint text "M"
    ctx.font = "12px system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("M", this.muteBtn.x + 4, this.muteBtn.y + 4);

    // ---------- INSTRUCTIONS (top-right) ----------
    const lines = [
      "Move: Arrow Keys",
      "Run: HOLD Shift with Arrow Keys",
      "Jump: Space",
      "Hurt:  H",
      "Mute:  M (or click icon)"
    ];

    ctx.font = "20px system-ui";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const pad = 14;
    const lineH = 26;

    // measure box
    let maxW = 0;
    for (const line of lines) maxW = Math.max(maxW, ctx.measureText(line).width);

    const boxW = maxW + pad * 2;
    const boxH = lines.length * lineH + pad * 2;

    const x = ctx.canvas.width - boxW - 18;
    const y = 18;

    // background box
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, boxW, boxH);

    // text
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "white";
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + pad, y + pad + i * lineH);
    }

    ctx.restore();
  }
}