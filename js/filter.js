// Filters the plant cards on plants.html by name, available light, and pet safety.
(function () {
  var form = document.getElementById("filters");
  if (!form) {
    return;
  }
  form.hidden = false;

  var cards = Array.prototype.slice.call(document.querySelectorAll(".plant-card"));
  var search = document.getElementById("filter-search");
  var light = document.getElementById("filter-light");
  var pets = document.getElementById("filter-pets");
  var count = document.getElementById("result-count");

  function update() {
    var text = search.value.trim().toLowerCase();
    var level = light.value;
    var safeOnly = pets.checked;
    var shown = 0;

    cards.forEach(function (card) {
      var name = card.getAttribute("data-name").toLowerCase();
      var levels = card.getAttribute("data-light").split(" ");
      var match =
        (text === "" || name.indexOf(text) !== -1) &&
        (level === "any" || levels.indexOf(level) !== -1) &&
        (!safeOnly || card.getAttribute("data-pets") === "safe");
      card.hidden = !match;
      if (match) {
        shown += 1;
      }
    });

    count.textContent = shown === 1 ? "Showing 1 plant" : "Showing " + shown + " plants";
  }

  form.addEventListener("input", update);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });
  form.addEventListener("reset", function () {
    window.setTimeout(update, 0);
  });
  update();
})();
