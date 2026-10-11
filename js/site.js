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

// Fade elements in as they scroll into view. Anything already on screen
// when the page loads is shown at once.
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var targets = document.querySelectorAll(".card, .shot, .video, .details, .process-head, .pager, .about, .list, .contact-form, .footer-in");
  var viewport = window.innerHeight || document.documentElement.clientHeight;
  if (!viewport) return; // page not laid out yet (hidden tab): show everything
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // already scrolled past (page restored partway down): show it too
      if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  Array.prototype.forEach.call(targets, function (el) {
    if (el.getBoundingClientRect().top < viewport) return;
    el.classList.add("reveal");
    observer.observe(el);
  });
})();

// Fetch a page as soon as its link is pointed at or touched, so the click feels instant.
(function () {
  var done = {};
  function warm(event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.origin !== window.location.origin || link.target === "_blank") return;
    var url = link.href.split("#")[0];
    if (done[url] || url === window.location.href.split("#")[0]) return;
    done[url] = true;
    var hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.href = url;
    document.head.appendChild(hint);
  }
  document.addEventListener("mouseover", warm, { passive: true });
  document.addEventListener("touchstart", warm, { passive: true });
})();
