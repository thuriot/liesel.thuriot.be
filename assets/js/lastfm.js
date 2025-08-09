"use strict";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    function updateLastFm() {
      fetch("https://lastfm.thuriot.be")
        .then((response) => response.text())
        .then((svgContent) => {
          const anchorId = "lastfm-currently-playing";
          let lastFmAnchor = document.getElementById(anchorId);

          if (!lastFmAnchor) {
            lastFmAnchor = document.createElement("a");
            lastFmAnchor.id = anchorId;
            lastFmAnchor.href = "https://www.last.fm/user/liesel_t";
            lastFmAnchor.target = "_blank";
            lastFmAnchor.rel = "noopener noreferrer";
            lastFmAnchor.setAttribute("aria-label", "Open Last.fm profile");

            const listItem = document.createElement("li");
            listItem.className = "list-group-item bg-transparent";
            listItem.appendChild(lastFmAnchor);

            const darkModeToggleWrapper = document.getElementById(
              "dark-mode-toggle-wrapper"
            );
            if (darkModeToggleWrapper && darkModeToggleWrapper.parentNode) {
              darkModeToggleWrapper.parentNode.insertBefore(
                listItem,
                darkModeToggleWrapper
              );
            }
          }

          lastFmAnchor.innerHTML = svgContent;
        })
        .catch(console.error);
    }

    updateLastFm();
    setInterval(updateLastFm, 30000);
  });
})();
