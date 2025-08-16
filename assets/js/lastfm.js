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

            lastFmAnchor.className = "position-absolute top-0 end-0 m-2";
            lastFmAnchor.setAttribute("aria-label", "Open Last.fm profile");

            document.body.appendChild(lastFmAnchor);
          }

          lastFmAnchor.innerHTML = svgContent;
        })
        .catch(console.error);
    }

    updateLastFm();
    setInterval(updateLastFm, 30000);
  });
})();
