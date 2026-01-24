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
      this.ctx && this._noise(3000, 0.015, 0.08);
    },
    playSpace() {
      this.ctx && this._noise(800, 0.03, 0.1);
    },

    playEnter() {
      if (!this.ctx) return;
      this._noise(200, 0.1, 0.1, 0.5);
      this.playKey();
    },

    playError() {
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bursts = 3;
      const spacing = 0.12; // Time between each "snap"

      for (let i = 0; i < bursts; i++) {
        const startTime = now + i * spacing;
        const duration = 0.1;

        // High-pitched resonant sweep
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

        // Metallic noise click
        this._noise(5000, 0.05, 0.1, 0.5);
      }
    },

    playPowerOn() {
      this.init();
      this._powerTone(50, 60, true);
    },
    playPowerOff() {
      this.ctx && this._powerTone(60, 50, false);
    },
  };

  const appendCss = function () {
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
  ];
  const BOOT_LINES = [
    "ERR: SIGNAL INTERFERENCE DETECTED...",
    "BYPASSING SECURITY PROTOCOLS...",
    "MOUNTING VIRTUAL_FILE_SYSTEM...",
    "SYSTEM STABILIZED. ACCESS LEVEL: GUEST",
    "TYPE 'LS' TO LIST ARTICLES OR 'HELP' FOR COMMANDS.",
  ];

  async function startTransition() {
    const siteMain = document.querySelector("main.container");
    if (!siteMain) return;

    SoundManager.init();
    SoundManager.playPowerOn();

    siteMain.classList.add("site-blip-out");

    setTimeout(() => {
      injectConsoleHTML();
      const overlay = document.getElementById("console-overlay");
      const log = document.getElementById("log");
      const inputCont = document.getElementById("input-container");

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
    if (document.getElementById("console-overlay")) return;
    const html = `
        <div id="console-overlay">
            <div class="scanlines"></div>
            <div class="terminal-wrapper">
                <div id="log"></div>
                <div class="input-line" id="input-container" style="display: none; opacity: 0;">
                    <span class="prompt">guest@system:~$</span>
                    <input type="text" id="terminal-input" spellcheck="false" autocomplete="off">
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    setupEventListeners();
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
            if (t) contentParts.push(t);
            return;
          }

          if (tag === "p") {
            const t = node.innerText.trim();
            if (t) contentParts.push(t);
            return;
          }

          if (tag === "li") {
            const t = node.innerText.trim();
            if (t) contentParts.push("- " + t);
            return;
          }

          if (tag === "a") {
            const href = node.getAttribute("href") || node.href || "";
            const text = (node.innerText || href).trim();
            if (text && href) contentParts.push(`${text} -> ${href}`);
            return;
          }

          if (node.classList && node.classList.contains("progress-bar")) {
            const t = node.innerText && node.innerText.trim();
            if (t) contentParts.push(t);
            return;
          }

          for (const child of Array.from(node.childNodes)) traverse(child);
        }
      }

      for (const child of Array.from(el.childNodes)) traverse(child);

      const content = contentParts.filter(Boolean).join("\n\n");

      const size = content.length;
      const id =
        el.id ||
        title.toLowerCase().replace(/\s+/g, "-") ||
        name.replace(".md", "");
      const anchor = `#${id}`;

      return { name, title, excerpt, content, size, anchor };
    });
    virtualFS.sort((a, b) => a.title.localeCompare(b.title));
  }

  async function runBootSequence() {
    const log = document.getElementById("log");
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
    const inputCont = document.getElementById("input-container");
    inputCont.style.display = "flex";
    setTimeout(() => {
      inputCont.style.opacity = "1";
    }, 10);
    document.getElementById("terminal-input").focus();
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
    return out;
  }

  function handleTabCompletion(inputEl) {
    const val = inputEl.value.trim().toLowerCase();
    if (!val) return;
    const parts = val.split(/\s+/);
    const lastPart = parts[parts.length - 1];

    if (parts.length === 1) {
      const match = COMMANDS.find((c) => c.startsWith(val));
      if (match) inputEl.value = match;
    } else if (parts[0] === "cat") {
      const match = virtualFS.find((f) => f.name.startsWith(lastPart));
      if (match) inputEl.value = `cat ${match.name}`;
    }
  }

  function processCommand(input) {
    const log = document.getElementById("log");
    const [cmd, ...args] = input.toLowerCase().trim().split(/\s+/);

    const print = (text, isHtml = false, className = "text-default") => {
      const p = document.createElement("p");
      p.classList.add(className);
      if (isHtml) p.innerHTML = text;
      else p.textContent = text;
      log.appendChild(p);
    };

    print(`guest@system:~$ ${input}`, false, "text-echo");

    switch (cmd) {
      case "ls":
        if (!virtualFS || virtualFS.length === 0) {
          print("NO FILES FOUND.");
          break;
        }
        const opts = args || [];
        const long = opts.includes("-l") || opts.includes("--long");
        if (long) {
          virtualFS.forEach((f) => {
            const size = formatSize(f.size);
            const excerpt = (f.excerpt || "").replace(/\s+/g, " ").trim();
            const short =
              excerpt.length > 120
                ? excerpt.slice(0, 120).trim() + "…"
                : excerpt;
            print(`${size}  ${f.name}  ${f.anchor}  - ${short}`);
          });
        } else {
          virtualFS.forEach((f) => {
            const size = formatSize(f.size);
            print(`${size}  ${f.name}`);
          });
        }
        break;

      case "cat":
        if (!args[0]) {
          print("USAGE: CAT [FILENAME]", false, "text-hint");
          break;
        }
        const q = args[0].toLowerCase();
        const target = virtualFS.find((f) => f.name === q);
        if (target) {
          print(
            "------------------------------------",
            false,
            "text-separator",
          );
          const titleHtml = `<a href="${target.anchor}" target="_self">${escapeHtml(target.title)}</a>`;
          print(titleHtml, true, "text-cyan");
          const contentHtml = renderContentHtml(
            target.content || target.excerpt || "",
          );
          print(contentHtml, true);
          print(
            "------------------------------------",
            false,
            "text-separator",
          );
        } else {
          print(`FILE NOT FOUND: ${args[0]}`, false, "text-error");
        }
        break;

      case "github":
        print(
          'GITHUB: <a href="https://github.com/LieselThuriot" target="_blank">https://github.com/LieselThuriot</a>',
          true,
        );
        break;

      case "instagram":
        print(
          'INSTAGRAM: <a href="https://www.instagram.com/liesel_vanta/" target="_blank">@liesel_vanta</a>',
          true,
        );
        break;

      case "linkedin":
        print(
          'LINKEDIN: <a href="https://www.linkedin.com/in/thuriot/" target="_blank">Liesel Thuriot</a>',
          true,
        );
        break;

      case "whoami":
        const sidebar = document.querySelector("#sidebar");
        const inputCont = document.getElementById("input-container");

        if (sidebar) {
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
          modal.className = "terminal-modal vhs-stable";
          modal.innerHTML = `
            <div class="modal-header">
              <span class="modal-title">RECON_DATA :: L_THURIOT.USR</span>
              <span class="modal-close" id="close-profile">[ PRESS ANY KEY TO EXIT ]</span>
            </div>
            <div class="modal-body">${clone.innerHTML}</div>
          `;

          document.getElementById("log").appendChild(modal);

          const exitModal = (e) => {
            if (e) e.preventDefault();
            modal.remove();
            inputCont.style.display = "flex";
            document.getElementById("terminal-input").focus();
            window.removeEventListener("keydown", exitModal);
          };

          setTimeout(() => {
            window.addEventListener("keydown", exitModal);
            document.getElementById("close-profile").onclick = exitModal;
          }, 150);

          SoundManager.playEnter();
        }
        break;

      case "clear":
        document.getElementById("log").innerHTML = "";
        break;

      case "sudo":
        SoundManager.playError();
        document.body.classList.add("system-breach");

        print(
          "<span class='error'>[ ACCESS DENIED ]</span>",
          true,
          "text-error",
        );
        print(
          "<span class='error'>PRIVILEGE ESCALATION IS DISABLED FOR GUEST_NODE</span>",
          true,
          "text-error",
        );

        setTimeout(() => {
          document.getElementById("log").innerHTML = "";
          document.body.classList.remove("system-breach");
          print("Unauthorized 'sudo' attempts have been logged.");
          print("System stabilized. Ready for next command.");
        }, 1200);
        break;

      case "help":
        print("Available commands:");
        print(
          "  <span class='command'>ls</span>          - List directory contents",
          true,
        );
        print(
          "  <span class='command'>cat</span>         - Display file content",
          true,
        );
        print(
          "  <span class='command'>whoami</span>      - Display user profile & biometric data",
          true,
        );
        print(
          "  <span class='command'>github</span>      - Open GitHub profile",
          true,
        );
        print(
          "  <span class='command'>linkedin</span>    - Open LinkedIn profile",
          true,
        );
        print(
          "  <span class='command'>instagram</span>   - Open Instagram profile",
          true,
        );
        print(
          "  <span class='command'>clear</span>       - Clear terminal screen",
          true,
        );
        print(
          "  <span class='command'>help</span>        - Show this help menu",
          true,
        );
        print(
          "  <span class='command'>exit</span>        - Close the terminal session",
          true,
        );
        break;

      case "exit":
        const overlay = document.getElementById("console-overlay");
        const siteMain = document.querySelector("main.container");
        overlay.classList.remove("active");
        overlay.classList.add("exit");

        SoundManager.playPowerOff();

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

      case "coffee":
        const overlay2 = document.getElementById("console-overlay");
        const isCoffeeTheme = overlay2.classList.contains("coffee-theme");
        if (isCoffeeTheme) {
          overlay2.classList.remove("coffee-theme");
          print("COFFEE MODE DISABLED. RETURNING TO TERMINAL GREEN.", false);
        } else {
          overlay2.classList.add("coffee-theme");
          print(
            "COFFEE MODE ENABLED. BREWING A WARM INTERFACE...",
            false,
            "text-hint",
          );
        }
        break;

      default:
        print(`UNKNOWN COMMAND: ${cmd}`, false, "text-error");
    }

    const ov = document.getElementById("console-overlay");
    ov.scrollTo({ top: ov.scrollHeight, behavior: "smooth" });
  }

  function setupEventListeners() {
    const input = document.getElementById("terminal-input");
    const playInputSound = (type = "key") => {
      if (type === "enter") SoundManager.playEnter();
      else SoundManager.playKey();
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        playInputSound("enter");
        const val = e.target.value;
        if (val) processCommand(val);
        e.target.value = "";
      } else if (e.key === "Tab") {
        playInputSound("key");
        e.preventDefault();
        handleTabCompletion(input);
      } else if (
        e.key.length === 1 ||
        e.key === "Backspace" ||
        e.key === "Delete"
      ) {
        playInputSound("key");
      }
    });
    document.getElementById("console-overlay").addEventListener("click", () => {
      input.focus();
    });
  }

  function appendNavlink() {
    const navContainer = document.querySelector("nav#nav-container ul");
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

      a.onclick = function (e) {
        e.preventDefault();
        // Remove the dot when clicked
        if (dot) dot.remove();
        startTransition();
      };
    }, 5000);
  }

  appendCss();
  appendNavlink();
})();
