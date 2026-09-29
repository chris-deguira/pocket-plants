// Calculates the next watering date on care.html.

// Returns the date that falls `days` days after a yyyy-mm-dd string, or null for bad input.
function nextDue(dateText, days) {
  var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!parts || !(days > 0)) {
    return null;
  }
  var last = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  if (isNaN(last.getTime())) {
    return null;
  }
  return new Date(last.getFullYear(), last.getMonth(), last.getDate() + days);
}

// Whole days from `from` to `to`, ignoring the time of day.
function daysBetween(from, to) {
  var start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  var end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end - start) / 86400000);
}

function describe(due, today) {
  var label = due.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  var diff = daysBetween(today, due);
  if (diff > 1) {
    return "Next watering: " + label + " (in " + diff + " days).";
  }
  if (diff === 1) {
    return "Next watering: " + label + " (tomorrow).";
  }
  if (diff === 0) {
    return "Water today (" + label + ").";
  }
  return "Watering was due " + label + " (" + Math.abs(diff) + (diff === -1 ? " day" : " days") + " ago).";
}

if (typeof document !== "undefined") {
  (function () {
    var form = document.getElementById("planner");
    if (!form) {
      return;
    }
    var plant = document.getElementById("planner-plant");
    var date = document.getElementById("planner-date");
    var result = document.getElementById("planner-result");

    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    date.value = now.getFullYear() + "-" + month + "-" + day;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var days = Number(plant.options[plant.selectedIndex].getAttribute("data-days"));
      var due = nextDue(date.value, days);
      result.textContent = due ? describe(due, new Date()) : "Choose the date of the last watering.";
    });
  })();
}
