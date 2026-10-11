// Footer clock: local time with seconds and the full date.
(function () {
  var time = document.getElementById("clock-time");
  var date = document.getElementById("clock-date");
  if (!time || !date) return;
  function tick() {
    var now = new Date();
    time.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
    date.textContent = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  tick();
  setInterval(tick, 1000);
})();

// Contact form: send in the background and confirm on the page.
(function () {
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (!form || !status) return;
  if (/[?&]sent=1/.test(window.location.search)) status.textContent = "Thank you, your message was sent.";
  form.addEventListener("submit", function (event) {
    if (!window.fetch) return; // fall back to a normal form post
    event.preventDefault();
    var button = form.querySelector("button");
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    if (data._honey) return;
    button.disabled = true;
    status.textContent = "Sending…";
    fetch("https://formsubmit.co/ajax/jkwon20241@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (response) { return response.json().then(function (body) { return { ok: response.ok, body: body }; }); })
      .then(function (result) {
        if (!result.ok || String(result.body.success) === "false") throw new Error(result.body.message || "failed");
        form.reset();
        status.textContent = "Thank you, your message was sent.";
      })
      .catch(function () {
        status.textContent = "That did not send. Please email jkwon20241@gmail.com instead.";
      })
      .then(function () { button.disabled = false; });
  });
})();
