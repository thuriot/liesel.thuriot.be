"use strict";

(function () {
  const SoundManager = {
    ctx: null,
    masterGain: null,
    noiseBuffer: null,

    /**
     * Initializes the AudioContext, master gain, and compressor.
     * Pre-generates the noise buffer to save CPU during typing.
     */
    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Dynamics Compressor prevents "clipping" when sounds overlap
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
        compressor.knee.setValueAtTime(40, this.ctx.currentTime);
        compressor.ratio.setValueAtTime(12, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this._generateNoiseBuffer();
      } else if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    },

    /**
     * Internal helper: Generates 1 second of white noise for reuse.
     */
    _generateNoiseBuffer() {
      const size = this.ctx.sampleRate;
      this.noiseBuffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    },

    /**
     * Ensures the audio context is active before playing sound.
     */
    _ensureContext() {
      return this.ctx || (this.init(), this.ctx);
    },

    /**
     * Internal helper: Plays filtered noise from the cached buffer.
     */
    _playNoise(freq, duration, volume, q = 1) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = q;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + duration,
      );

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
      source.stop(this.ctx.currentTime + duration);
    },

    /**
     * Internal helper: Unified oscillator method for beeps and tones.
     */
    _beep(
      freq,
      duration,
      volume,
      type = "sine",
      startTime = 0,
      isStaccato = false,
    ) {
      const t = this.ctx.currentTime + startTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume, t + 0.01); // Quick attack

      if (isStaccato) {
        // Hard cut: stay at full volume until the very end
        g.gain.setValueAtTime(volume, t + duration - 0.01);
        g.gain.linearRampToValueAtTime(0, t + duration);
      } else {
        // Musical fade: the "note drop" effect
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      }

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    },

    /**
     * RESTORED: Internal helper for Power On/Off hums.
     */
    _powerTone(startFreq, endFreq, isPowerOn) {
      const now = this.ctx.currentTime;
      const duration = 1.2;
      const g = this.ctx.createGain();

      // Layered oscillators for a thicker, mechanical drone
      [1, 1.5].forEach((mult) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(startFreq * mult, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq * mult, now + 0.3);
        osc.connect(g);
        osc.start(now);
        osc.stop(now + duration);
      });

      if (isPowerOn) {
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.1, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else {
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      }

      g.connect(this.masterGain);
    },

    // --- PUBLIC API ---

    playKey() {
      if (this._ensureContext()) this._playNoise(3000, 0.02, 0.05, 1.5);
    },

    playSpace() {
      if (this._ensureContext()) this._playNoise(800, 0.03, 0.1);
    },

    playEnter() {
      if (this._ensureContext()) {
        this._playNoise(200, 0.15, 0.1, 0.5); // Thud
        this._playNoise(3000, 0.02, 0.08, 1.5); // Click
      }
    },

    playError() {
      if (!this._ensureContext()) return;
      for (let i = 0; i < 3; i++) {
        const t = i * 0.12;
        this._beep(400, 0.1, 0.1, "sawtooth", t);
        setTimeout(() => this._playNoise(100, 0.1, 0.1, 0.5), i * 120);
      }
    },

    playPowerOn() {
      if (this._ensureContext()) this._powerTone(60, 110, true);
    },

    playPowerOff() {
      if (this._ensureContext()) this._powerTone(110, 40, false);
    },

    playPostBeep() {
      if (this._ensureContext()) this._beep(950, 0.3, 0.15, "square", 0, true);
    },

    playLogin() {
      if (!this._ensureContext()) return;
      const notes = [392, 523, 659, 783];
      notes.forEach((f, i) => this._beep(f, 0.4, 0.1, "sine", i * 0.12));
    },
  };

  const DOM = {
    overlay: () => document.getElementById("console-overlay"),
    log: () => document.getElementById("log"),
    mirror: () => document.getElementById("mirror-text"),
    input: () => document.getElementById("terminal-input"),
    inputContainer: () => document.getElementById("input-container"),
    siteMain: () => document.querySelector("main.container"),
    navContainer: () => document.querySelector("nav#nav-container ul"),
    sidebar: () => document.querySelector("#sidebar"),
    overridebtn: () => document.getElementById("override-btn"),
  };

  const appendCss = () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/assets/css/console.css";
    document.head.appendChild(link);
  };

  let virtualFS = [];
  const COMMANDS = [
    "ls",
    "cat",
    "help",
    "clear",
    "exit",
    "github",
    "instagram",
    "linkedin",
    "whoami",
    "sudo",
    "coffee",
    "glass",
    "version",
    "docker",
  ];

  async function startTransition() {
    const siteMain = DOM.siteMain();
    if (!siteMain) return;

    SoundManager.init();
    SoundManager.playPowerOn();

    siteMain.classList.add("site-blip-out");

    setTimeout(() => {
      injectConsoleHTML();
      const overlay = DOM.overlay();
      const log = DOM.log();
      const inputCont = DOM.inputContainer();

      log.innerHTML = "";
      inputCont.style.display = "none";
      overlay.classList.remove("exit");
      overlay.style.display = "flex";
      overlay.classList.add("active");
      overlay.classList.add("signal-loss");

      setTimeout(() => {
        overlay.classList.remove("signal-loss");
        indexArticles();
        runBootSequence();
      }, 600);
    }, 500);
  }

  function injectConsoleHTML() {
    if (DOM.overlay()) return;
    const html = `
        <div id="console-overlay">
            <div class="scanlines"></div>
            <div class="terminal-wrapper">
                <div id="log"></div>
                <div class="input-line" id="input-container" style="display: none; opacity: 0;">
                    <span class="prompt">guest@system:~$</span>
                    <div class="input-wrapper">
                      <span id="mirror-text"></span>
                      <span id="cursor-block"></span>
                      <input type="text" id="terminal-input" spellcheck="false" autocomplete="off" autofocus>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    restoreThemes();
    setupEventListeners();
  }

  function restoreThemes() {
    if (localStorage.getItem("console-coffee-mode") === "true") {
      DOM.overlay().classList.add("coffee-theme");
    }

    if (localStorage.getItem("console-glass") === "true") {
      DOM.overlay().classList.add("glass");
    }
  }

  function indexArticles() {
    const articles = document.querySelectorAll("article");
    virtualFS = Array.from(articles).map((el) => {
      const h1 = el.querySelector("h1");
      const title = h1?.innerText.trim() || "untitled_node";
      const name =
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "_")
          .replace(/_+/g, "_") + ".md";

      // excerpt: prefer first paragraph, else first line
      const p = el.querySelector("p");
      let excerpt = p
        ? p.innerText.trim()
        : (el.innerText || "").trim().split(/\n/)[0] || "";
      if (excerpt.length > 180) excerpt = excerpt.slice(0, 180).trim() + "…";

      // content: traverse the article in DOM order and collect relevant pieces
      const contentParts = [];

      function traverse(node) {
        if (!node) return;
        const NodeType = node.nodeType;
        if (NodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();

          if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
            const t = node.innerText.trim();
            if (t) {
              contentParts.push(" ");

              if (
                node.classList.contains("card-header") ||
                node.parentElement.parentElement?.classList.contains("timeline")
              ) {
                contentParts.push(`- ${t}`);
              } else if (tag === "h1" || tag === "h2") {
                contentParts.push(`• ${t}`);
              } else {
                contentParts.push(t);
              }
            }
            return;
          }

          if (tag === "blockquote") {
            const t = node.innerText.replace(/\s{2,}/g, " ").trim();
            if (t) {
              contentParts.push(" ");
              contentParts.push("> " + t);
              contentParts.push(" ");
            }
            return;
          }

          if (tag === "blockquote" || tag === "p" || tag === "span") {
            const t = node.innerText.replace(/\s{2,}/g, " ").trim();
            if (t) {
              if (
                node.parentElement.parentElement?.classList.contains("timeline")
              ) {
                contentParts.push(`  ${t}`);
              } else {
                contentParts.push(t);
              }
            }
            return;
          }

          if (tag === "li") {
            if (node.childNodes.length > 1) {
              for (const child of Array.from(node.childNodes)) {
                traverse(child);
              }
              return;
            }

            const t = node.innerText.replace(/\s{2,}/g, " ").trim();
            if (t) contentParts.push("- " + t);
            return;
          }

          if (tag === "a") {
            const href = node.getAttribute("href") || node.href || "";
            const img = node.querySelector("img");
            const text = img
              ? img.getAttribute("alt") || ""
              : (node.innerText || href).trim();
            if (text && href) contentParts.push(`${text} -> ${href}`);
            return;
          }

          if (node.classList && node.classList.contains("progress-bar")) {
            const t = parseSkill(node);
            if (t) contentParts.push(t);
            return;
          }

          for (const child of Array.from(node.childNodes)) traverse(child);
        }
      }

      for (const child of Array.from(el.childNodes)) traverse(child);

      const content = contentParts.filter(Boolean).join("\n");

      const size = content.length;
      const id =
        el.id ||
        el.getAttribute("data-article") ||
        title.toLowerCase().replace(/\s+/g, "-") ||
        name.replace(".md", "");

      const anchor = `#${id}`;

      return {
        name,
        title,
        excerpt,
        content,
        size,
        anchor,
        readAccess: true,
        admin: false,
      };
    });

    virtualFS.push({
      name: "manifesto.md",
      title: "Manifesto",
      size: 10 * 1024 * 1024,
      anchor: "#manifesto",
      readAccess: false,
      admin: false,
    });

    virtualFS.push({
      name: ".vanguard_config",
      title: "Vanguard Configuration File",
      size: 2 * 1024,
      anchor: "#config",
      readAccess: false,
      admin: true,
    });

    virtualFS.sort((a, b) => a.title.localeCompare(b.title));
  }

  function parseSkill(el) {
    const label = el.querySelector("span:first-child").innerText.trim();
    const value = parseInt(el.parentElement.getAttribute("aria-valuenow"));

    // Create the Bar: 20 segments total
    const filledSegments = Math.round(value / 5);
    const bar = "█".repeat(filledSegments) + "░".repeat(20 - filledSegments);

    // Format: Label [████░░░░] 80%
    return `${label.padEnd(35)} [${bar}] ${value}%`;
  }

  async function runBootSequence() {
    const log = DOM.log();

    const BOOT_LINES = [
      //"ERR: SIGNAL INTERFERENCE DETECTED...",
      //"BYPASSING SECURITY PROTOCOLS...",
      //"MOUNTING VIRTUAL_FILE_SYSTEM...",
      //"SYSTEM STABILIZED. ACCESS LEVEL: GUEST",
      //"TYPE 'LS' TO LIST ARTICLES OR 'HELP' FOR COMMANDS.",
    ];

    for (const line of BOOT_LINES) {
      const p = document.createElement("p");
      log.appendChild(p);
      for (const char of line) {
        p.textContent += char;
        SoundManager.playKey();
        const randomDelay = 20 + Math.random() * 40;
        await new Promise((r) => setTimeout(r, randomDelay));
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    const inputCont = DOM.inputContainer();
    inputCont.style.display = "flex";
    setTimeout(() => {
      inputCont.style.opacity = "1";
    }, 10);
    DOM.input().focus();
  }

  function formatSize(n) {
    if (!n || n < 1) return "0B";
    if (n < 1024) return n + "B";
    if (n < 1024 * 1024) return Math.round(n / 1024) + "KB";
    return Math.round(n / (1024 * 1024)) + "MB";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderContentHtml(content) {
    if (!content) return "";
    let out = escapeHtml(content);

    out = out.replace(/^#\s+(.+)$/gm, "<h2>$1</h2>");

    out = out.replace(
      /([^\n]+?)\s*->\s*(https?:\/\/\S+)/g,
      function (_, text, url) {
        return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
      },
    );

    out = out.replace(/(https?:\/\/\S+)/g, function (_, url) {
      return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    });

    out = out.replace(/\n\n+/g, "<br><br>").replace(/\n/g, "<br>");

    out = out.replace(/([░█])+/g, function (bar) {
      return `<span class="terminal-skill-bar">${bar}</span>`;
    });

    return out;
  }

  function handleTabCompletion(inputEl) {
    const val = inputEl.value.trim().toLowerCase();
    if (!val) return;

    let foundMatch = false;
    if (val.startsWith("./")) {
      const fileCommand = val.slice(2);
      const match = virtualFS.find((f) => f.name.startsWith(fileCommand));
      if (match) {
        inputEl.value = `./${match.name}`;
        foundMatch = true;
      }
    }

    if (!foundMatch) {
      const parts = val.split(/\s+/);
      const lastPart = parts[parts.length - 1];

      if (parts.length === 1) {
        const match = COMMANDS.find((c) => c.startsWith(val));
        if (match) {
          inputEl.value = match;
          foundMatch = true;
        }
      } else {
        const match = virtualFS.find((f) => f.name.startsWith(lastPart));
        if (match) {
          inputEl.value = `${parts.slice(0, -1).join(" ")} ${match.name}`;
          foundMatch = true;
        }
      }
    }

    if (foundMatch) {
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  const createPrintFn =
    (log) =>
    (text, isHtml = false, className = "text-default") => {
      const p = document.createElement("p");
      p.classList.add(className);
      if (isHtml) p.innerHTML = text;
      else p.textContent = text;
      log.appendChild(p);
    };

  function processCommand(input) {
    const log = DOM.log();
    const print = createPrintFn(log);
    const printHtml = (text, className = "text-default") =>
      print(text, true, className);
    const printText = (text, className = "text-default") =>
      print(text, false, className);

    const [cmd, ...args] = input.toLowerCase().trim().split(/\s+/);

    printText(`guest@system:~$ ${input}`, "text-echo");

    switch (cmd) {
      case "ls":
        if (!virtualFS || virtualFS.length === 0) {
          printText("NO FILES FOUND.");
          break;
        }

        const opts = args || [];

        const long = opts.includes("-la") || opts.includes("-l");
        const all = opts.includes("-la") || opts.includes("-a");

        if (long) {
          virtualFS.forEach((f) => {
            if (!all && f.name.startsWith(".")) return;

            const access = f.admin
              ? "-rw-------"
              : f.readAccess
                ? "-rw-rw-r--"
                : "-rw-rw----";
            const owner = f.admin ? "admin " : "liesel";
            const size = formatSize(f.size);
            const whitespace = " ".repeat(8 - Math.min(size.length, 8));
            const shortWhitespace = " ".repeat(
              18 - Math.min(f.name.length, 18),
            );
            const anchorWhitespace = " ".repeat(
              15 - Math.min(f.anchor.length, 15),
            );
            printText(
              `${access}  1 ${owner}  vanguard   ${size}${whitespace}📄 ${f.name} ${shortWhitespace} ${f.anchor} ${anchorWhitespace} ${f.title}`,
            );
          });
        } else {
          virtualFS.forEach((f) => {
            if (!all && f.name.startsWith(".")) return;

            const size = formatSize(f.size);
            const whitespace = " ".repeat(8 - Math.min(size.length, 8));
            printText(`${size} ${whitespace} 📄 ${f.name}`);
          });
        }
        break;

      case "cat":
        if (!args[0]) {
          printText("USAGE: CAT [FILENAME]", "text-hint");
          break;
        }
        const q = args[0].toLowerCase();
        const target = virtualFS.find((f) => f.name === q);
        if (target) {
          if (!target.readAccess || target.admin) {
            printText(
              `ACCESS DENIED: Insufficient permissions for ${q}`,
              "text-error",
            );
          } else {
            printText("------------------------------------", "text-separator");
            const titleHtml = `<a href="${target.anchor}" target="_self">${escapeHtml(target.title)}</a>`;
            printHtml(titleHtml, "text-cyan");
            const contentHtml = renderContentHtml(
              target.content || target.excerpt || "",
            );
            printHtml(contentHtml);
            printText("------------------------------------", "text-separator");
          }
        } else {
          printText(`FILE NOT FOUND: ${args[0]}`, "text-error");
        }
        break;

      case "github":
        printHtml(
          'GITHUB: <a href="https://github.com/LieselThuriot" target="_blank">https://github.com/LieselThuriot</a>',
        );
        break;

      case "instagram":
        printHtml(
          'INSTAGRAM: <a href="https://www.instagram.com/liesel_vanta/" target="_blank">@liesel_vanta</a>',
        );
        break;

      case "linkedin":
        printHtml(
          'LINKEDIN: <a href="https://www.linkedin.com/in/thuriot/" target="_blank">Liesel Thuriot</a>',
        );
        break;

      case "whoami": {
        const sidebar = DOM.sidebar();

        if (sidebar) {
          const inputCont = DOM.inputContainer();
          inputCont.style.display = "none";

          const clone = sidebar.cloneNode(true);

          const purgeList = [
            "#dark-mode-toggle",
            ".dark-mode-toggle",
            "button",
            "label",
          ];
          purgeList.forEach((s) =>
            clone.querySelectorAll(s).forEach((el) => el.remove()),
          );

          const modal = document.createElement("div");
          modal.id = "whoami-modal";
          modal.className = "terminal-modal";

          if (DOM.overlay().classList.contains("coffee-theme"))
            modal.classList.add("coffee-theme");

          modal.innerHTML = `
            <div class="vhs">
              <div class="modal-header">
                <span class="modal-title">RECON_DATA :: L_THURIOT.USR</span>
                <span class="modal-close" id="close-profile">[ PRESS ANY KEY TO EXIT ]</span>
              </div>
              <div class="modal-body" data-bs-theme="dark">${clone.innerHTML}</div>
            </div>
          `;

          document.body.appendChild(modal);

          const exitModal = (e) => {
            if (e) e.preventDefault();
            modal.remove();
            inputCont.style.display = "flex";
            DOM.input().focus();
            window.removeEventListener("keydown", exitModal);
          };

          setTimeout(() => {
            window.addEventListener("keydown", exitModal);
            document.getElementById("close-profile").onclick = exitModal;
          }, 150);
        }
        break;
      }

      case "clear":
        log.innerHTML = "";
        break;

      case "sudo":
        SoundManager.playError();
        document.body.classList.add("system-breach");

        printHtml("<span class='error'>[ ACCESS DENIED ]</span>", "text-error");
        printHtml(
          "<span class='error'>PRIVILEGE ESCALATION IS DISABLED FOR GUEST_NODE</span>",
          "text-error",
        );

        setTimeout(() => {
          log.innerHTML = "";
          document.body.classList.remove("system-breach");
          printText(
            "Unauthorized 'sudo' attempts have been logged.",
            "text-error",
          );
          printText("System stabilized. Ready for next command.");
        }, 1200);
        break;

      case "coffee": {
        const overlay = DOM.overlay();
        const isCoffeeTheme = overlay.classList.contains("coffee-theme");
        if (isCoffeeTheme) {
          overlay.classList.remove("coffee-theme");
          localStorage.removeItem("console-coffee-mode");
          printText("☕ COFFEE MODE DISABLED. RETURNING TO TERMINAL GREEN.");
        } else {
          overlay.classList.add("coffee-theme");
          localStorage.setItem("console-coffee-mode", "true");
          const art = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢳
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⡇⠀⢶⡀
⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⢋⡼⠁⠀⣸⡇
⠀⠀⠀⠀⠀⠀⠀⠀⣿⣳⠏⠀⣠⠞⣡⡏
⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⡄⢸⣯⡾⠋
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠳⠸⡟⠁
⠀⡀⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣁⣀⣀
⢸⡟⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⢻⢿⣷⢀⣀⣀⣀⡀
⢸⡇⠀⣶⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠶⣒⣒⣿⣋⣥⣄⡉⢻⣆
⢸⣿⠈⣇⣾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠶⠶⢶⣿⠁⠀⢸⡇⢰⣿
⠀⢻⣆⢻⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠒⠒⣾⣯⣤⣴⠟⣡⣿⠃
⠀⠈⢿⣎⠻⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⣿⣿⣭⣥⣴⡿⠟⠁
⠀⠀⠈⢿⣷⣄⠑⣦⡄⠀⠀⠀⣀⠀⢛⣻⣿⡟⠉⠉⠉
⠀⣴⡶⠶⠿⠿⢿⣶⣤⣤⣤⣤⣽⣿⠿⠛⣛⣟⣷⡆⠀BREWING A WARM INTERFACE...
⠀⠛⠷⠶⣤⣤⣤⣤⣴⣾⣿⣿⣶⣦⣤⣶⣶⡾⠟⠁`;

          printHtml(createRainbowAscii(art));
          printText(" ");
          printText("☕ COFFEE MODE ENABLED.", "text-hint");
        }
        break;
      }

      case "glass": {
        const overlay = DOM.overlay();
        const isGlass = overlay.classList.contains("glass");
        if (isGlass) {
          overlay.classList.remove("glass");
          localStorage.removeItem("console-glass");
          printText("🪟 GLASS MODE DISABLED.");
        } else {
          overlay.classList.add("glass");
          localStorage.setItem("console-glass", "true");
          printText("🪟 GLASS MODE ENABLED.", "text-hint");
        }
        break;
      }

      case "docker":
        const [subCommand, image, targetFile] = args;

        if (subCommand === "images") {
          printText("REPOSITORY                TAG       IMAGE ID       SIZE");
          printText("vanguard/core-system      latest    a1b2c3d4e5f6   420MB");
          printText("vanguard/decrypt-tool     v1.0      f9e8d7c6b5a4   125MB"); // The Easter Egg
        } else if (subCommand === "run" && image === "vanguard/decrypt-tool") {
          if (targetFile === "manifesto.md") {
            printText("Initializing vanguard/decrypt-tool...");
            printText("Pulling system dependencies... [OK]");
            printText("Brute-forcing manifesto.md headers...");

            printHtml(
              `CRACKING: [<span class="terminal-skill-bar">████████████████</span>] 100%`,
            );
            printText("SUCCESS: Fragment recovered and saved to virtualFS.");

            SoundManager.playLogin();

            if (!virtualFS.find((f) => f.name === "breach_protocol.sh")) {
              virtualFS.push({
                name: "breach_protocol.sh",
                title: "...",
                content: "Run me...",
                size: 2 * 1024,
                anchor: "#",
                readAccess: true,
                admin: false,
              });
            }
          } else if (!targetFile) {
            printText(
              "Usage: docker run vanguard/decrypt-tool <filename>",
              "text-error",
            );
          } else if (virtualFS.find((f) => f.name === targetFile)) {
            printText(
              `ERROR: Unable to decrypt ${targetFile}. File is not encrypted.`,
              "text-error",
            );
          } else {
            printText(
              `ERROR: Unable to decrypt ${targetFile}. File does not exist.`,
              "text-error",
            );
          }
        } else {
          printText("docker: invalid arguments.", "text-error");
        }
        break;

      case "help":
        printText("Available commands:");
        printHtml(
          "  <span class='text-command'>ls</span>         - List directory contents",
        );
        printHtml(
          "  <span class='text-command'>cat</span>        - Display file content",
        );
        printHtml(
          "  <span class='text-command'>whoami</span>     - Display user profile & biometric data",
        );
        printHtml(
          "  <span class='text-command'>github</span>     - Open GitHub profile",
        );
        printHtml(
          "  <span class='text-command'>linkedin</span>   - Open LinkedIn profile",
        );
        printHtml(
          "  <span class='text-command'>instagram</span>  - Open Instagram profile",
        );
        printHtml(
          "  <span class='text-command'>docker</span>     - Docker container management",
        );
        printHtml(
          "  <span class='text-command'>coffee</span>     - Toggle coffee mode",
        );
        printHtml(
          "  <span class='text-command'>glass</span>      - Toggle glass mode",
        );
        printHtml(
          "  <span class='text-command'>sudo</span>       - Attempt privilege escalation",
        );
        printHtml(
          "  <span class='text-command'>clear</span>      - Clear terminal screen",
        );
        printHtml(
          "  <span class='text-command'>help</span>       - Show this help menu",
        );
        printHtml(
          "  <span class='text-command'>version</span>    - Show system version info",
        );
        printHtml(
          "  <span class='text-command'>exit</span>       - Close the terminal session",
        );
        break;

      case "version":
        const art = `░██    ░██                                                                        ░██ 
░██    ░██                                                                        ░██ 
░██    ░██  ░██████   ░████████   ░████████ ░██    ░██  ░██████   ░██░████  ░████████ 
░██    ░██       ░██  ░██    ░██ ░██    ░██ ░██    ░██       ░██  ░███     ░██    ░██ 
 ░██  ░██   ░███████  ░██    ░██ ░██    ░██ ░██    ░██  ░███████  ░██      ░██    ░██ 
  ░██░██   ░██   ░██  ░██    ░██ ░██   ░███ ░██   ░███ ░██   ░██  ░██      ░██   ░███ 
   ░███     ░█████░██ ░██    ░██  ░█████░██  ░█████░██  ░█████░██ ░██       ░█████░██ 
                                        ░██                                           
                                  ░███████ `;

        printHtml(createRainbowAscii(art));
        printText(" ");
        printText("  SYSTEM: L-TH_01 [ VANGUARD ] // SYSTEM_HASH: 0x8FA4C2");
        printText("  KERNEL: 6.1-STABLE // BUILD: 6.1.0-V-742");
        printText("  STATUS: OPERATIONAL // AUTH: GUEST_LEVEL_1");
        break;

      case "exit": {
        SoundManager.playPowerOff();

        const overlay = DOM.overlay();
        const siteMain = DOM.siteMain();
        overlay.classList.remove("active");
        overlay.classList.add("exit");

        setTimeout(() => {
          overlay.style.display = "none";
          log.innerHTML = "";
          if (siteMain) {
            siteMain.classList.remove("site-blip-out");
            siteMain.classList.add("site-warm-up");
            setTimeout(() => siteMain.classList.remove("site-warm-up"), 600);
          }
        }, 1200);
        break;
      }

      case "./breach_protocol.sh": {
        if (virtualFS.find((f) => f.name === "breach_protocol.sh")) {
          DOM.overlay().remove();
          DOM.siteMain().classList.remove("site-blip-out");
          DOM.overridebtn().remove();

          SoundManager.playPostBeep();

          runFullScreenBootAnimation(() => {
            log.innerHTML = "";
          });
          break;
        }
      }

      default:
        printText(`UNKNOWN COMMAND: ${cmd}`, "text-error");
    }

    const ov = DOM.overlay();
    if (ov) {
      ov.scrollTo({ top: ov.scrollHeight, behavior: "smooth" });
    }
  }

  function createRainbowAscii(input) {
    const lines = input.split("\n");
    let htmlOutput = `<div class="terminal-logo">`;

    // Control how "stretched" the rainbow is
    const horizontalFrequency = 5; // Higher = more color shifts horizontally
    const verticalFrequency = 15; // Higher = more color shifts vertically

    lines.forEach((line, rowIndex) => {
      const chars = Array.from(line);

      chars.forEach((char, colIndex) => {
        if (char === " ") {
          htmlOutput += " ";
          return;
        }

        const hue =
          (colIndex * horizontalFrequency + rowIndex * verticalFrequency) % 360;

        htmlOutput += `<span style="color: hsl(${hue}, 100%, 60%);">${char}</span>`;
      });

      htmlOutput += "\n";
    });

    htmlOutput += `</div>`;
    return htmlOutput;
  }

  function runFullScreenBootAnimation(onFinish) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.zIndex = "999999";
    canvas.style.background = "black";

    document.body.appendChild(canvas);

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    ctx.font = "18px monospace";
    ctx.fillStyle = "#00ff55";
    ctx.textBaseline = "top";

    function drawScanlines() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
      ctx.fillStyle = "#00ff55";
    }

    function clear() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff55";
    }

    let lineY = 20;
    function println(text = "") {
      ctx.fillText(text, 20, lineY);
      lineY += 22;
    }

    function biosSplash(next) {
      clear();
      lineY = 40;

      const biosArt = [
        "PhoenixBIOS(tm) v4.0 Release 6.0",
        "Copyright 1985-2024 Phoenix Technologies Ltd.",
        "",
        "CPU: QuantumFlux X9 @ 9.99 THz",
        "Memory Test: 16384MB OK",
        "Detecting IDE Drives...",
        "  Primary Master:  HyperDrive 9000",
        "  Primary Slave:   None",
        "",
        "Press DEL to enter setup...",
      ];

      let i = 0;
      function step() {
        if (i < biosArt.length) {
          println(biosArt[i]);
          drawScanlines();
          i++;
          setTimeout(step, 200);
        } else {
          setTimeout(next, 800);
        }
      }
      step();
    }

    function linuxBoot(next) {
      clear();
      lineY = 20;

      const logs = [
        "[    0.000000] Booting HyperLinux Kernel 5.99.1",
        "[    0.000001] Initializing cgroup subsys cpuset",
        "[    0.000002] Initializing cgroup subsys cpu",
        "[    0.000003] Initializing cgroup subsys cpuacct",
        "[    0.004000] CPU0: QuantumFlux X9 (family: 0x6, model: 0x9F)",
        "[    0.008000] Memory: 16384MB available",
        "[    0.010000] Running memory check...",
      ];

      for (let i = 0; i < 20; i++) {
        logs.push(`[    0.${1000 + i}] Checking block ${i}... OK`);
      }

      logs.push("[    1.500000] Loading drivers...");
      logs.push("[    2.000000] System ready.");

      let i = 0;
      function step() {
        if (i < logs.length) {
          println(logs[i]);
          drawScanlines();
          i++;
          setTimeout(step, 80 + Math.random() * 80);
        } else {
          setTimeout(next, 500);
        }
      }
      step();
    }

    function spinner(next) {
      clear();
      lineY = canvas.height / 2;

      const frames = ["|", "/", "-", "\\"];
      let frameIndex = 0;
      let speed = 200;

      function spin() {
        clear();
        ctx.fillText(frames[frameIndex], canvas.width / 2, lineY);
        drawScanlines();

        frameIndex = (frameIndex + 1) % frames.length;
        speed *= 0.9;

        if (speed < 40) {
          return next();
        }

        setTimeout(spin, speed);
      }

      spin();
    }

    function matrixDissolve(next) {
      function glitchOut(callback) {
        let t = 0;

        function frame() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (let i = 0; i < 25; i++) {
            const y = Math.random() * canvas.height;
            const h = 5 + Math.random() * 25;
            ctx.fillStyle = `rgba(0,255,85,${Math.random()})`;
            ctx.fillRect(0, y, canvas.width, h);
          }

          drawScanlines();

          t++;
          if (t < 20) requestAnimationFrame(frame);
          else callback();
        }

        frame();
      }

      function startMatrix(callback) {
        const columns = Math.floor(canvas.width / 20);
        const drops = Array(columns).fill(0);

        let running = true;

        function draw() {
          if (!running) return;

          ctx.fillStyle = "rgba(0,0,0,0.05)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = "rgba(0,255,85,1)";
          ctx.font = "20px monospace";

          for (let i = 0; i < drops.length; i++) {
            const char = String.fromCharCode(0x30a0 + Math.random() * 96);
            const x = i * 20;
            const y = drops[i] * 20;

            ctx.fillText(char, x, y);

            if (y > canvas.height || Math.random() > 0.975) {
              drops[i] = 0;
            }

            drops[i]++;
          }

          drawScanlines();
          requestAnimationFrame(draw);
        }

        draw();

        setTimeout(() => {
          running = false;
          callback();
        }, 2500);
      }

      function crtCollapse(callback) {
        SoundManager.playPowerOff();
        let height = canvas.height;

        function frame() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          height *= 0.85;

          ctx.fillStyle = "rgba(0,255,85,1)";
          ctx.fillRect(0, canvas.height / 2 - height / 2, canvas.width, height);

          drawScanlines();

          if (height < 2) {
            return collapseDot(callback);
          }

          requestAnimationFrame(frame);
        }

        frame();
      }

      function collapseDot(callback) {
        let radius = canvas.width / 2;

        function frame() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          radius *= 0.8;

          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,255,85,1)";
          ctx.fill();

          drawScanlines();

          if (radius < 1) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return callback();
          }

          requestAnimationFrame(frame);
        }

        frame();
      }

      function crtPowerOn(callback) {
        let bloom = 0;

        function frame() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Bright green flash expanding outward
          ctx.fillStyle = `rgba(0,255,85,${1 - bloom})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          drawScanlines();

          bloom += 0.05;

          if (bloom < 1) {
            requestAnimationFrame(frame);
          } else {
            callback();
          }
        }

        frame();
      }

      function fadeCanvas(callback) {
        canvas.style.transition = "opacity 1.2s ease-out";
        canvas.style.opacity = "0";
        setTimeout(callback, 1300);
      }

      glitchOut(() =>
        startMatrix(() =>
          crtCollapse(() => crtPowerOn(() => fadeCanvas(next))),
        ),
      );
    }

    function cleanup() {
      document.body.removeChild(canvas);
      window.removeEventListener("resize", resize);
      if (onFinish) onFinish();
    }

    biosSplash(() =>
      linuxBoot(() => spinner(() => matrixDissolve(() => cleanup()))),
    );
  }

  function setupEventListeners() {
    const input = DOM.input();
    const mirror = DOM.mirror();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        SoundManager.playEnter();

        const val = input.value;
        input.value = "";
        mirror.textContent = "";

        if (val) processCommand(val);
      } else if (e.key === "Tab") {
        SoundManager.playKey();
        e.preventDefault();
        handleTabCompletion(input);
      } else if (
        e.key.length === 1 ||
        e.key === "Backspace" ||
        e.key === "Delete"
      ) {
        SoundManager.playKey();
      }
    });

    input.addEventListener("input", () => {
      mirror.textContent = input.value;
    });

    DOM.overlay().addEventListener("click", () => {
      input.focus();
    });
  }

  function appendNavlink() {
    const navContainer = DOM.navContainer();
    if (!navContainer) return;

    setTimeout(() => {
      const html = `
      <li class="nav-item blip-entrance" style="position: relative;">
        <div class="nav-notification-dot"></div>
        <a id="override-btn" href="#" class="glitch-link nav-link text-uppercase" data-text="[ OVERRIDE.sh ]">
          [ OVERRIDE.sh ]
        </a>
      </li>`;

      navContainer.insertAdjacentHTML("beforeend", html);

      const a = document.getElementById("override-btn");
      const dot = document.querySelector(".nav-notification-dot");

      a.onclick = (e) => {
        e.preventDefault();
        if (dot) dot.remove();
        startTransition();
      };
    }, 1);
  }

  appendCss();
  appendNavlink();
})();
