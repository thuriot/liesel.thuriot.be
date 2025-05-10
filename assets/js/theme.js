"use strict";

(function () {
  function setTheme(mode) {
    document.documentElement.setAttribute("data-bs-theme", mode);
    localStorage.setItem("theme", mode);
  }

  const darkModeToggle = document.getElementById("dark-mode-toggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    setTheme(savedTheme);
    darkModeToggle.checked = savedTheme === "dark";
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setTheme("dark");
    darkModeToggle.checked = true;
} else {
    setTheme("light");
    darkModeToggle.checked = false;
}

  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  });

  document
    .getElementById("dark-mode-toggle-wrapper")
    .classList.remove("d-none");
})();
