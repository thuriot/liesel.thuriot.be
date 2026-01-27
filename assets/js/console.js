"use strict";

(function () {
  const SoundManager = {
    ctx: null,

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } else if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    },

    _ensureContext() {
      return this.ctx || (this.init(), this.ctx);
    },

    _noise(freq, duration, volume, q = 1) {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
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

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    },

    _tone(freq, duration, volume, type = "sine", rampEndFreq = null) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (rampEndFreq) {
        osc.frequency.exponentialRampToValueAtTime(
          rampEndFreq,
          this.ctx.currentTime + duration,
        );
      }

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + duration,
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    },

    _powerTone(startFreq, endFreq, isPowerOn) {
      const gain = this.ctx.createGain();
      const duration = 1.5;
      const rampTime = 0.2;

      [1, 2].forEach((multiplier) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(
          startFreq * multiplier,
          this.ctx.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
          endFreq * multiplier,
          this.ctx.currentTime + rampTime,
        );
        osc.connect(gain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      });

      if (isPowerOn) {
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
      } else {
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
      }

      gain.connect(this.ctx.destination);
    },

    playKey() {
      if (this._ensureContext()) this._noise(3000, 0.015, 0.08);
    },

    playSpace() {
      if (this._ensureContext()) this._noise(800, 0.03, 0.1);
    },

    playEnter() {
      if (!this._ensureContext()) return;
      this._noise(200, 0.1, 0.1, 0.5);
      this._noise(3000, 0.015, 0.08);
    },

    playError() {
      if (!this._ensureContext()) return;

      const now = this.ctx.currentTime;
      const bursts = 3;
      const spacing = 0.12;

      for (let i = 0; i < bursts; i++) {
        const startTime = now + i * spacing;
        const duration = 0.1;

        const sweep = this.ctx.createOscillator();
        const sweepGain = this.ctx.createGain();

        sweep.type = "sawtooth";
        sweep.frequency.setValueAtTime(400, startTime);
        sweep.frequency.exponentialRampToValueAtTime(
          1200,
          startTime + duration,
        );

        sweepGain.gain.setValueAtTime(0, startTime);
        sweepGain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        sweepGain.gain.linearRampToValueAtTime(0, startTime + duration);

        sweep.connect(sweepGain);
        sweepGain.connect(this.ctx.destination);

        sweep.start(startTime);
        sweep.stop(startTime + duration);

        this._noise(5000, 0.05, 0.1, 0.5);
      }
    },

    playPowerOn() {
      this.init();
      this._powerTone(50, 60, true);
    },

    playPowerOff() {
      if (this._ensureContext()) this._powerTone(60, 50, false);
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
    const parts = val.split(/\s+/);
    const lastPart = parts[parts.length - 1];

    let foundMatch = false;

    if (parts.length === 1) {
      const match = COMMANDS.find((c) => c.startsWith(val));
      if (match) {
        inputEl.value = match;
        foundMatch = true;
      }
    } else if (parts[0] === "cat") {
      const match = virtualFS.find((f) => f.name.startsWith(lastPart));
      if (match) {
        inputEl.value = `cat ${match.name}`;
        foundMatch = true;
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

      default:
        printText(`UNKNOWN COMMAND: ${cmd}`, "text-error");
    }

    const ov = DOM.overlay();
    ov.scrollTo({ top: ov.scrollHeight, behavior: "smooth" });
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
