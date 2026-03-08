"use strict";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    function updateActivity() {
      const anchorId = "lastfm-currently-playing";
      let activityAnchor = document.getElementById(anchorId);

      fetch("https://activity.thuriot.be")
        .then((response) => response.text())
        .then((svgContent) => {
          if (!activityAnchor) {
            activityAnchor = document.createElement("div");

            activityAnchor.id = anchorId;
            //activityAnchor.href = "https://www.last.fm/user/liesel_t";
            //activityAnchor.target = "_blank";
            //activityAnchor.rel = "noopener noreferrer";

            activityAnchor.className = "position-absolute top-0 end-0 m-2";
            activityAnchor.setAttribute("aria-label", "Open Last.fm profile");

            document.body.appendChild(activityAnchor);
          }

          activityAnchor.innerHTML = svgContent;
        })
        .catch(err => {
          console.error(err);
          if (activityAnchor) {
            activityAnchor.innerHTML = "";
          }
        });
    }

    updateActivity();
    setInterval(updateActivity, 30000);
  });
})();
