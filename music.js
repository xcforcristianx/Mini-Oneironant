// music.js
class MusicManager {
  constructor(src, { loop = true, volume = 0.35 } = {}) {
    this.audio = new Audio(src);
    this.audio.loop = loop;
    this.audio.volume = volume;
    this.audio.preload = "auto";

    this.enabled = true;     // mute toggle
    this.unlocked = false;   // becomes true after first user gesture
  }

  async play() {
    if (!this.enabled) return;
    try {
      await this.audio.play();
    } catch (e) {
      // If autoplay is blocked, we'll start after a user gesture via installUnlock().
      // Avoid spamming console in normal use.
    }
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(v) {
    this.audio.volume = Math.max(0, Math.min(1, v));
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.pause();
    else this.play();
  }

  // Call once to start music after a click/key press (required by browsers)
  installUnlock(target = window) {
    const unlock = async () => {
      if (this.unlocked) return;
      this.unlocked = true;
      await this.play();
      target.removeEventListener("pointerdown", unlock);
      target.removeEventListener("keydown", unlock);
    };

    target.addEventListener("pointerdown", unlock, { once: true });
    target.addEventListener("keydown", unlock, { once: true });

    // Optional: press M to mute/unmute
    window.addEventListener("keydown", (e) => {
      if (e.key === "m" || e.key === "M") this.toggleMute();
    });
  }
}