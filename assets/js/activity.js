"use strict";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    function updateActivity() {
      const anchorId = "currently-playing";
      let activityContainer = document.getElementById(anchorId);

      fetch("https://activity.thuriot.be/badge")
        .then((response) => response.text())
        .then((svgContent) => {
          if (!activityContainer) {
            activityContainer = document.createElement("div");
            
            activityContainer.id = anchorId;
            activityContainer.className = "position-absolute top-0 end-0 m-2";
            activityContainer.setAttribute("aria-label", "What am I current up to?");

            document.body.appendChild(activityContainer);
          }

          activityContainer.innerHTML =
            '<a href="https://activity.thuriot.be/" target="_blank" rel="noopener noreferrer" aria-label="What am I current up to?">' +
            svgContent +
            "</a>";
        })
        .catch(err => {
          console.error(err);
          if (activityContainer) {
            activityContainer.innerHTML = "";
          }
        });
    }

    updateActivity();
    setInterval(updateActivity, 30000);
  });
})();
