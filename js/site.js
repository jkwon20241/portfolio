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
  // coming back (or reloading) returns to a page already seen: show it exactly as it was left
  var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (nav && (nav.type === "back_forward" || nav.type === "reload")) return;
  var targets = document.querySelectorAll(".card, .shot, .slideshow, .poster-text, .video, .details, .process-head, .pager, .about, .list, .contact-form, .footer-in");
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

// Once the page has finished loading, fetch the images further down in the background,
// so scrolling never reaches a picture that is still blank.
(function () {
  if (navigator.connection && navigator.connection.saveData) return; // respect data saver
  function preload() {
    Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = "eager"; });
  }
  function later() { (window.requestIdleCallback || function (fn) { window.setTimeout(fn, 200); })(preload); }
  if (document.readyState === "complete") later(); else window.addEventListener("load", later);
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
    last = event.clientX + "," + event.clientY;
  }
  var last = "";
  // remember where the pointer was only when leaving the page, not on every move
  window.addEventListener("pagehide", function () { try { if (last) sessionStorage.setItem("cursor", last); } catch (e) {} });
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
  // the ten-word cap applies to the intro; the Information bio, project descriptions and the "Currently" line are set by width alone
  var SELECTOR = ".intro-line, .contact-in > .body, .desc-col .body:not(.desc-fill)";
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
      groups.push({ parent: el.parentNode, items: [el] });
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
  // Rag: a line should not end on a small connecting word, and a dash stays with the word before it.
  // Tie those words to the next one with a non-breaking space.
  var SMALL = /(^|[\s\u00A0(“"])(a|an|the|and|or|of|to|in|at|as|by|for|on|with|is|her|she|how|can|be)[ \t\n]+(?=\S)/gi;
  function glue(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var node, nodes = [];
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (text, index) {
      var value = text.data;
      for (var pass = 0; pass < 2; pass++) value = value.replace(SMALL, "$1$2\u00A0");
      // a small word at the very end of this piece of text ties to whatever follows (a link, for instance)
      if (index < nodes.length - 1) value = value.replace(/(^|[\s\u00A0])(a|an|the|and|or|of|to|in|at|as|by|for|on|with)[ \t\n]+$/i, "$1$2\u00A0");
      value = value.replace(/[ \t\n]+—/g, "\u00A0—");
      // the first word of a sentence should not be left alone at the end of a line
      value = value.replace(/([.!?:]["”]?[ \t\n]+)(\S+)[ \t\n]+(?=\S)/g, "$1$2\u00A0");
      if (value !== text.data) text.data = value;
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(SELECTOR + ", .desc-col .body, .cap-sub"), glue);
  // The Information bio fills its full measure for an even right edge, so it ties only the words that
  // read worst at a line end: articles, and the first word of a sentence.
  Array.prototype.forEach.call(document.querySelectorAll(".bio-text .body"), function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) {
      var value = node.data
        .replace(/(^|[\s\u00A0])(a|an|the)[ \t\n]+(?=\S)/gi, "$1$2\u00A0")
        .replace(/([.!?]["”]?[ \t\n]+)(\S+)[ \t\n]+(?=\S)/g, "$1$2\u00A0")
        .replace(/[ \t\n]+—/g, "\u00A0—")
        // an article right before a link (“at the Rhode Island…”) stays with it
        .replace(/(^|[\s\u00A0])(a|an|the)[ \t\n]+$/i, "$1$2\u00A0");
      if (value !== node.data) node.data = value;
    }
  });
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener("load", fit);
  var timer = 0;
  window.addEventListener("resize", function () { window.clearTimeout(timer); timer = window.setTimeout(fit, 150); });
})();

// Slideshow: advances on its own at a reading pace; an arrow click takes over,
// and it picks up again after 15 seconds without a click.
(function () {
  Array.prototype.forEach.call(document.querySelectorAll("[data-slideshow]"), function (root) {
    var slides = root.querySelectorAll(".slide");
    var count = root.querySelector(".slide-count");
    var n = slides.length, i = 0, timer = null, idle = null, visible = false, manual = false;
    var PACE = 6000, RESUME = 15000;
    if (n < 2) return;
    function show(k) {
      slides[i].classList.remove("is-active"); slides[i].setAttribute("aria-hidden", "true");
      i = (k + n) % n;
      slides[i].classList.add("is-active"); slides[i].removeAttribute("aria-hidden");
      if (count) count.textContent = (i + 1) + " / " + n;
    }
    function stop() { clearInterval(timer); timer = null; }
    function play() {
      stop();
      if (manual || !visible || document.hidden) return;
      timer = setInterval(function () { show(i + 1); }, PACE);
    }
    function step(d) {
      show(i + d);
      manual = true; stop();
      clearTimeout(idle);
      idle = setTimeout(function () { manual = false; play(); }, RESUME);
    }
    Array.prototype.forEach.call(root.querySelectorAll(".slide-btn"), function (b) {
      b.addEventListener("click", function () { step(+b.getAttribute("data-dir")); });
    });
    var x0 = null;
    var box = root.querySelector(".slides");
    box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; play(); }, { threshold: 0.4 }).observe(root);
    } else { visible = true; play(); }
    document.addEventListener("visibilitychange", play);
  });
})();
