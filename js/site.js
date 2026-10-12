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
  var targets = document.querySelectorAll(".card, .shot, .poster-text, .video, .details, .process-head, .pager, .about, .list, .contact-form, .footer-in");
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

// Custom cursor: a dot that follows the pointer and turns white over
// links, buttons and clickable images. Mouse-type pointers only.
(function () {
  if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var dot = document.createElement("div");
  dot.className = "cursor-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  document.documentElement.classList.add("has-cursor");
  var CLICKABLE = "a[href], button, [role='button'], input[type='submit']";
  function place(x, y) { dot.style.transform = "translate3d(" + x + "px," + y + "px,0)"; }
  function update(event) {
    place(event.clientX, event.clientY);
    var target = event.target;
    var framed = target && target.tagName === "IFRAME";
    dot.classList.toggle("show", !framed);
    dot.classList.toggle("on", !!(target && target.closest && target.closest(CLICKABLE)));
    try { sessionStorage.setItem("cursor", event.clientX + "," + event.clientY); } catch (e) {}
  }
  // Carry the last position across page changes so the dot does not vanish until the next move.
  try {
    var saved = (sessionStorage.getItem("cursor") || "").split(",");
    if (saved.length === 2) {
      place(+saved[0], +saved[1]);
      dot.classList.add("show");
      var under = document.elementFromPoint(+saved[0], +saved[1]);
      dot.classList.toggle("on", !!(under && under.closest && under.closest(CLICKABLE)));
    }
  } catch (e) {}
  document.addEventListener("mousemove", update, { passive: true });
  document.addEventListener("mouseover", update, { passive: true });
  document.documentElement.addEventListener("mouseleave", function () { dot.classList.remove("show"); });
  window.addEventListener("blur", function () { dot.classList.remove("show"); });
})();

// Information page: clicking the photo pops a short "hi!" above it.
(function () {
  var button = document.querySelector(".portrait-btn");
  if (!button) return;
  var tip = button.querySelector(".hi");
  var timer = 0;
  button.addEventListener("click", function () {
    window.clearTimeout(timer);
    tip.classList.remove("show");
    void tip.offsetWidth; // restart the pop when clicked again
    tip.classList.add("show");
    timer = window.setTimeout(function () { tip.classList.remove("show"); }, 1800);
  });
})();

// Video pages: show a still first and load the Vimeo player on click.
(function () {
  var holders = document.querySelectorAll("button.video[data-vimeo]");
  Array.prototype.forEach.call(holders, function (holder) {
    holder.addEventListener("click", function () {
      var box = document.createElement("div");
      box.className = holder.className.replace("reveal", "").replace(" in", "");
      var frame = document.createElement("iframe");
      frame.src = "https://player.vimeo.com/video/" + holder.getAttribute("data-vimeo") + "?autoplay=1&portrait=0&byline=0&title=0";
      frame.title = holder.getAttribute("data-title") || "Video";
      frame.allow = "autoplay; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      box.appendChild(frame);
      holder.parentNode.replaceChild(box, holder);
    });
  });
})();

// Longer text: no rendered line may hold more than ten words, and the right edge stays even.
// CSS balances the lines of each paragraph; this narrows a block, a few pixels at a time,
// until natural wrapping keeps every line at ten words or fewer. No forced line breaks.
(function () {
  var MAX = 10;
  var SELECTOR = ".desc-col .body, .bio .body, .currently, .intro-line, .contact-in > .body";
  function longest(el) {
    var counts = {}, most = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var node, range = document.createRange();
    while ((node = walker.nextNode())) {
      var re = /\S+/g, match;
      while ((match = re.exec(node.data))) {
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        var key = Math.round(range.getBoundingClientRect().top / 4);
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > most) most = counts[key];
      }
    }
    return most;
  }
  function fit() {
    var groups = [];
    Array.prototype.forEach.call(document.querySelectorAll(SELECTOR), function (el) {
      el.style.maxWidth = "";
      var parent = el.parentNode, group = null;
      var shared = el.matches(".bio .body"); // only the bio paragraphs share a width
      for (var i = 0; shared && i < groups.length; i++) if (groups[i].parent === parent) group = groups[i];
      if (!group) { group = { parent: parent, items: [] }; groups.push(group); }
      group.items.push(el);
    });
    groups.forEach(function (group) {
      // paragraphs that sit together share one width, so their left and right edges match
      var width = 0;
      group.items.forEach(function (el) { width = Math.max(width, el.getBoundingClientRect().width); });
      function over() { return group.items.some(function (el) { return longest(el) > MAX; }); }
      for (var guard = 0; guard < 80 && width > 220 && over(); guard++) {
        width -= 8;
        group.items.forEach(function (el) { el.style.maxWidth = width + "px"; });
      }
    });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener("load", fit);
  var timer = 0;
  window.addEventListener("resize", function () { window.clearTimeout(timer); timer = window.setTimeout(fit, 150); });
})();
