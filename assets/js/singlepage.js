"use strict";

(function () {
  const articles = Array.from(document.querySelectorAll("article"));
  const links = Array.from(document.querySelectorAll("a[href^='#']"));

  const updateVisibility = (hash) => {
    const id = hash.substring(1);

    articles.forEach((article) => {
      if (article.id === id) {
        article.classList.remove("d-none");
      } else {
        article.classList.add("d-none");
      }
    });

    links.forEach((link) => {
      if (link.getAttribute("href") === hash) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const hash = link.getAttribute("href");
      updateVisibility(hash);
      history.pushState(null, "", hash);
      document.title = link.textContent + " | Liesel Thuriot";
    });
  });

  articles.forEach((article) => {
    article.classList.remove("mb-5");
    article.classList.add("fade-in-up");
  });

  const defaultId = window.location.hash
    ? window.location.hash
    : "#" + articles[0].id;

  updateVisibility(defaultId);

  const defaultLink = links.find((link) => link.getAttribute("href") === defaultId);
  if (defaultLink) {
    document.title = defaultLink.textContent + " | Liesel Thuriot";
  }

  window.addEventListener("hashchange", () => {
    updateVisibility(window.location.hash);
  });
})();
