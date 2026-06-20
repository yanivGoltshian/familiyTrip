/* ============================================================
   קפריסין 2026 — לוגיקת האתר
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* ---------- ניווט מובייל ---------- */
  const navToggle = $("#navToggle"), navLinks = $("#navLinks");
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

  /* ---------- כותרות מהנתונים ---------- */
  $("#heroTitle").textContent = TRIP.title;
  $("#heroSub").textContent = TRIP.subtitle;
  document.title = TRIP.title + " · קפריסין 2026 🥕";

  /* ============================================================
     ספירה לאחור ראשית
     ============================================================ */
  const cd = {
    d: $("#cdDays"), h: $("#cdHours"), m: $("#cdMins"), s: $("#cdSecs"), msg: $("#countdownMsg"),
  };
  const target = new Date(TRIP.countdownTo).getTime();
  function tickCountdown() {
    const now = Date.now();
    let diff = Math.floor((target - now) / 1000);
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = "0";
      cd.msg.textContent = "🎉 החופשה כאן! טיסה נעימה!";
      return;
    }
    const days = Math.floor(diff / 86400); diff %= 86400;
    const hours = Math.floor(diff / 3600); diff %= 3600;
    const mins = Math.floor(diff / 60); const secs = diff % 60;
    cd.d.textContent = days; cd.h.textContent = String(hours).padStart(2, "0");
    cd.m.textContent = String(mins).padStart(2, "0"); cd.s.textContent = String(secs).padStart(2, "0");
    let msg = "";
    if (days > 60) msg = "מתחילים להתרגש! 😎";
    else if (days > 30) msg = "פחות מחודשיים — מתחילים לתכנן! 🗓️";
    else if (days > 14) msg = "עוד פחות מחודש! 🏖️";
    else if (days > 7) msg = "השבוע האחרון מתקרב — להוציא מזוודות! 🧳";
    else if (days > 1) msg = "כבר ממש קרוב!! מתחילים לארוז 🎒";
    else msg = "מחר/היום טסים!! 🛫✨";
    cd.msg.textContent = msg;
  }
  tickCountdown(); setInterval(tickCountdown, 1000);

  /* ============================================================
     מזג אוויר חי — Open-Meteo (ללא מפתח)
     ============================================================ */
  const WX = {
    0: ["☀️", "בהיר"], 1: ["🌤️", "בהיר חלקית"], 2: ["⛅", "מעונן חלקית"], 3: ["☁️", "מעונן"],
    45: ["🌫️", "ערפל"], 48: ["🌫️", "ערפל"], 51: ["🌦️", "טפטוף"], 61: ["🌧️", "גשם"],
    63: ["🌧️", "גשם"], 80: ["🌦️", "ממטרים"], 95: ["⛈️", "סופת רעמים"],
  };
  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=1`;
    const r = await fetch(url); if (!r.ok) throw new Error("wx"); return r.json();
  }
  function renderWeatherInto(box, data) {
    const c = data.current, code = c.weather_code;
    const [emoji, desc] = WX[code] || ["🌡️", "מזג אוויר"];
    const hi = Math.round(data.daily.temperature_2m_max[0]);
    const lo = Math.round(data.daily.temperature_2m_min[0]);
    box.innerHTML = `<span class="wx-emoji">${emoji}</span>
      <div><span class="wx-temp">${Math.round(c.temperature_2m)}°</span>
      <div class="wx-desc">${desc} · ${hi}°/${lo}° · עכשיו ביעד</div></div>`;
  }

  /* ============================================================
     טיסות
     ============================================================ */
  const flightsC = $("#flightsContainer");
  TRIP.flights.forEach((f, i) => {
    const card = el("div", "card flight-card reveal");
    card.innerHTML = `
      <div class="flight-head">
        <span class="flight-dir">${f.emoji} ${f.dir}</span>
        <span class="flight-no">${f.flightNo}</span>
      </div>
      <div class="flight-route">
        <div class="fr-point"><div class="fr-code">${f.from.code}</div><div class="fr-time">${f.depTime}</div><div class="fr-city">${f.from.name}</div></div>
        <div class="fr-line"><span>✈️</span></div>
        <div class="fr-point"><div class="fr-code">${f.to.code}</div><div class="fr-time">${f.arrTime}</div><div class="fr-city">${f.to.name}</div></div>
      </div>
      <div class="flight-meta">
        <span class="chip">📅 ${formatHeDate(f.date)}</span>
        <span class="chip">🏢 ${f.airline}</span>
        ${f.from.terminal ? `<span class="chip">🚪 ${f.from.terminal}</span>` : ""}
      </div>
      <div class="flight-cd" id="fcd${i}">מחשב…</div>
      <div class="weather-box" id="fwx${i}"><span class="wx-emoji">🌡️</span><div class="wx-desc">טוען מזג אוויר…</div></div>
      <a class="flight-link" href="${f.statusUrl}" target="_blank" rel="noopener">🔎 בדיקת סטטוס טיסה חי ↗</a>
    `;
    flightsC.appendChild(card);

    // ספירה לטיסה
    const dep = new Date(f.depISO).getTime();
    const cdEl = $("#fcd" + i);
    function ft() {
      let diff = Math.floor((dep - Date.now()) / 1000);
      if (diff <= 0) { cdEl.textContent = "✅ הטיסה המריאה — טיסה נעימה!"; return; }
      const d = Math.floor(diff / 86400); diff %= 86400;
      const h = Math.floor(diff / 3600); diff %= 3600; const m = Math.floor(diff / 60);
      cdEl.innerHTML = `⏱️ עוד <b>${d}</b> ימים, <b>${h}</b> שעות ו-<b>${m}</b> דק' להמראה`;
    }
    ft(); setInterval(ft, 30000);

    // מזג אוויר ליעד הטיסה
    const wxBox = $("#fwx" + i);
    const dest = f.to.code === "LCA" ? TRIP.destination : TRIP.origin;
    fetchWeather(dest.lat, dest.lon).then(d => renderWeatherInto(wxBox, d))
      .catch(() => { wxBox.innerHTML = `<span class="wx-emoji">🌡️</span><div class="wx-desc">מזג אוויר לא זמין כרגע</div>`; });
  });

  // תזכורת צ'ק-אין
  const outbound = TRIP.flights[0];
  $("#checkinReminder").innerHTML =
    `⏰ זוכרים: צ'ק-אין נפתח <b>3 שעות לפני</b> ההמראה (החל מ-06:00 בהלוך), ואין צ'ק-אין אונליין ב-TUS. תיק עלייה למטוס כלול לכולם! · מס' הזמנה ${TRIP.bookingRef}`;

  /* ============================================================
     כבודה
     ============================================================ */
  const br = TRIP.baggageRules;
  $("#baggageRules").innerHTML = `
    ${br.reassure ? `<div class="brule baggage-yes">🎉 ${br.reassure}</div>` : ""}
    <div class="brule"><div class="br-ic">🧳</div><div class="br-t">מזוודה</div><div class="br-w">${br.checked.weight}</div><div class="br-d">${br.checked.dims} · ${br.checked.note}</div></div>
    <div class="brule"><div class="br-ic">🎒</div><div class="br-t">טרולי</div><div class="br-w">${br.trolley.weight}</div><div class="br-d">${br.trolley.dims}</div></div>
    <div class="brule"><div class="br-ic">👜</div><div class="br-t">תיק אישי</div><div class="br-w">${br.personal.weight}</div><div class="br-d">${br.personal.dims}</div></div>
    <div class="brule"><div class="br-ic">👶</div><div class="br-t">תיק תינוק</div><div class="br-w">${br.infant.weight}</div><div class="br-d">${br.infant.dims}</div></div>
    <div class="brule stroller-banner">🍼 ${br.stroller}</div>
  `;

  const paxGrid = $("#passengerGrid");
  TRIP.passengers.forEach(p => {
    const card = el("div", "pax-card reveal");
    card.style.setProperty("--pc", p.color);
    let bags = "";
    if (p.type === "infant") {
      bags = `<div class="pax-bag yes">🍼 תיק תינוק (5 ק"ג)</div><div class="pax-bag yes">👶 עגלה — חינם!</div>`;
    } else {
      bags += p.checked ? `<div class="pax-bag yes">✅ מזוודה 20 ק"ג</div>` : `<div class="pax-bag no">❌ ללא מזוודה</div>`;
      bags += p.trolley ? `<div class="pax-bag yes">✅ טרולי 8 ק"ג</div>` : "";
      bags += `<div class="pax-bag yes">✅ תיק אישי</div>`;
    }
    card.innerHTML = `
      <div class="pax-emoji">${p.emoji}</div>
      <div class="pax-name">${p.name}</div>
      <div class="pax-role">${p.role}</div>
      <div class="pax-bags">${bags}</div>
      ${p.alert ? `<div class="pax-alert">⚠️ ${p.alert}</div>` : ""}
    `;
    paxGrid.appendChild(card);
  });

  /* ============================================================
     אריזה — טאבים + צ'קליסט עם שמירה
     ============================================================ */
  const pkTabs = $("#packingTabs"), pkPanel = $("#packingPanel");
  const STORE_KEY = "cyprus2026_packing";
  const packState = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  function savePack() { localStorage.setItem(STORE_KEY, JSON.stringify(packState)); }

  TRIP.passengers.forEach((p, idx) => {
    const t = el("button", "pk-tab" + (idx === 0 ? " active" : ""), `${p.emoji} ${p.name}`);
    t.style.setProperty("--pc", p.color);
    t.addEventListener("click", () => {
      $$(".pk-tab").forEach(x => x.classList.remove("active"));
      t.classList.add("active"); renderPacking(p);
    });
    pkTabs.appendChild(t);
  });
  function renderPacking(p) {
    packState[p.id] = packState[p.id] || {};
    pkPanel.style.setProperty("--pc", p.color);
    const items = p.packing.map((it, i) => {
      const done = packState[p.id][i] ? " done" : "";
      return `<li class="pk-item${done}" data-i="${i}"><span class="pk-check">${packState[p.id][i] ? "✓" : ""}</span><span class="pk-txt">${it}</span></li>`;
    }).join("");
    pkPanel.innerHTML = `
      <div class="pk-head"><span class="pk-em">${p.emoji}</span><div><div class="pk-nm">${p.name}</div></div></div>
      <div class="pk-sub">${p.packTitle}</div>
      <div class="pk-progress"><span id="pkBar"></span></div>
      <ul class="pk-list">${items}</ul>`;
    updateBar(p);
    $$(".pk-item", pkPanel).forEach(li => li.addEventListener("click", () => {
      const i = li.dataset.i; packState[p.id][i] = !packState[p.id][i];
      li.classList.toggle("done"); $(".pk-check", li).textContent = packState[p.id][i] ? "✓" : "";
      savePack(); updateBar(p);
    }));
  }
  function updateBar(p) {
    const total = p.packing.length;
    const done = p.packing.filter((_, i) => packState[p.id] && packState[p.id][i]).length;
    const bar = $("#pkBar"); if (bar) bar.style.width = (done / total * 100) + "%";
  }
  renderPacking(TRIP.passengers[0]);

  // טיפים אוניברסליים
  $("#tipsGrid").innerHTML = TRIP.universalTips.map(t =>
    `<div class="tip reveal"><div class="tip-ic">${t.icon}</div><div class="tip-t">${t.title}</div><div class="tip-x">${t.text}</div></div>`).join("");

  /* ============================================================
     מלון
     ============================================================ */
  const h = TRIP.hotel;
  $("#hotelWrap").innerHTML = `
    <div class="hotel-gallery">
      ${h.images.map(im => `<figure class="hg-fig"><img src="${im.src}" alt="${im.cap || h.nameHe}" loading="lazy" onerror="this.closest('.hg-fig').style.display='none'"><figcaption>${im.cap || ""}</figcaption></figure>`).join("")}
    </div>
    <div class="hotel-info">
      <div class="hotel-name">${h.nameHe}</div>
      <div class="hotel-stars">${"★".repeat(h.stars)}${"☆".repeat(5 - h.stars)}</div>
      <div class="hotel-blurb">${h.blurb}</div>
      <div class="hotel-facts">
        <span class="hfact">📍 ${h.address}</span>
        <span class="hfact">🛎️ צ'ק-אין ${h.checkIn}</span>
        <span class="hfact">🧳 צ'ק-אאוט ${h.checkOut}</span>
        <span class="hfact">🌙 ${h.nights} לילות</span>
        <span class="hfact">🍳 ${h.board}</span>
      </div>
      <div class="amenities">
        ${h.amenities.map(a => `<div class="amen"><span class="a-ic">${a.icon}</span>${a.text}</div>`).join("")}
      </div>
      <div class="hotel-btns">
        <a class="btn-primary" href="${h.videoUrl}" target="_blank" rel="noopener">▶️ סרטון המלון</a>
        <a class="btn-ghost" href="${h.mapUrl}" target="_blank" rel="noopener">🗺️ במפה</a>
        <a class="btn-ghost" href="${h.website}" target="_blank" rel="noopener">🌐 אתר המלון</a>
      </div>
    </div>`;

  /* ============================================================
     סביבה — מסעדות / אטרקציות / שווקים
     ============================================================ */
  const exContent = $("#exploreContent");
  function renderRest() {
    exContent.innerHTML = TRIP.restaurants.map(r => `
      <div class="place reveal in">
        <div class="place-top"><span class="place-emoji">${r.emoji}</span>
          <div><div class="place-name">${r.he}</div><div class="place-he">${r.name}</div></div></div>
        <span class="place-walk">🚶 ${r.walk}</span>
        <div class="place-cuisine">${r.cuisine} · ${r.price}</div>
        <ul class="place-menu">${r.menu.map(m => `<li>${m}</li>`).join("")}</ul>
        <a class="place-link" href="${r.mapUrl}" target="_blank" rel="noopener">📍 לניווט ↗</a>
      </div>`).join("");
  }
  function renderAttr() {
    const tx = TRIP.transport ? TRIP.transport.taxiUrl : "";
    exContent.innerHTML = TRIP.attractions.map(a => `
      <div class="place reveal in">
        <div class="place-top"><span class="place-emoji">${a.emoji}</span>
          <div><div class="place-name">${a.name}</div></div></div>
        <span class="place-tag">${a.tag}</span>
        <span class="place-walk">🚗 ${a.dist}${a.stroller ? " · ידידותי לעגלה 👶" : ""}</span>
        <div class="place-cuisine">${a.text}</div>
        <div class="place-links">
          <a class="place-link" href="https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lon}" target="_blank" rel="noopener">📍 ניווט ↗</a>
          ${tx ? `<a class="place-link taxi" href="${tx}" target="_blank" rel="noopener">🚕 מונית</a>` : ""}
        </div>
      </div>`).join("");
  }
  function renderMark() {
    const tx = TRIP.transport ? TRIP.transport.taxiUrl : "";
    const note = TRIP.transport ? `<div class="taxi-note">🚕 ${TRIP.transport.note}</div>` : "";
    exContent.innerHTML = note + TRIP.markets.map(m => `
      <div class="place reveal in">
        <div class="place-top"><span class="place-emoji">${m.emoji}</span>
          <div><div class="place-name">${m.name}</div>${m.en ? `<div class="place-he">${m.en}</div>` : ""}</div></div>
        <span class="place-tag">${m.kind ? m.kind + " · " : ""}${m.tag}</span>
        <span class="place-walk">🚕 ${m.taxi}${m.walk ? " · 🚶 " + m.walk : ""} <span class="from-hotel">מהמלון</span></span>
        <div class="place-cuisine">${m.text}</div>
        <div class="place-links">
          <a class="place-link" href="${m.mapUrl}" target="_blank" rel="noopener">📍 ניווט ↗</a>
          ${tx ? `<a class="place-link taxi" href="${tx}" target="_blank" rel="noopener">🚕 הזמן מונית</a>` : ""}
        </div>
      </div>`).join("");
  }
  $$(".ex-tab").forEach(tab => tab.addEventListener("click", () => {
    $$(".ex-tab").forEach(t => t.classList.remove("active")); tab.classList.add("active");
    const k = tab.dataset.tab;
    if (k === "rest") renderRest(); else if (k === "attr") renderAttr(); else renderMark();
  }));
  renderRest();

  /* ============================================================
     קשר
     ============================================================ */
  const c = TRIP.contact;
  const waMsg = encodeURIComponent("היי דיאנה! שאלה לגבי חופשת קפריסין שלנו 🌊");
  $("#contactCard").innerHTML = `
    <div class="ct-em">👩‍✈️</div>
    <div class="ct-name">${c.person}</div>
    <div class="ct-agency">סוכנות הנסיעות · ${c.agency}</div>
    <div class="ct-row">📞 ${c.phone}</div>
    <div class="ct-row">🏢 ${c.address}</div>
    <div class="ct-row">☎️ משרד: ${c.office}</div>
    <div class="contact-btns">
      <a href="tel:${c.phoneClean}">📞 חיוג</a>
      <a class="wa" href="https://wa.me/${c.phoneClean.replace('+','')}?text=${waMsg}" target="_blank" rel="noopener">💬 וואטסאפ</a>
    </div>`;

  /* ============================================================
     מפה חיה — Leaflet + MQTT
     ============================================================ */
  let map, myMarker, watchId = null, mqttClient = null;
  const others = {};
  const myId = "u" + Math.random().toString(36).slice(2, 8);
  const HOTEL = [TRIP.hotel.lat, TRIP.hotel.lon];

  function initMap() {
    map = L.map("liveMap", { scrollWheelZoom: false }).setView(HOTEL, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19,
    }).addTo(map);
    // סמן המלון
    L.marker(HOTEL, { icon: emojiIcon("🏨") }).addTo(map)
      .bindPopup(`<b>${TRIP.hotel.nameHe}</b><br>המלון שלנו`);
    // אטרקציות עיקריות
    TRIP.attractions.forEach(a => L.marker([a.lat, a.lon], { icon: emojiIcon(a.emoji) })
      .addTo(map).bindPopup(`<b>${a.name}</b>`));
    // מסעדות
    TRIP.restaurants.forEach(r => L.marker([r.lat, r.lon], { icon: emojiIcon(r.emoji) })
      .addTo(map).bindPopup(`<b>${r.he}</b><br>${r.walk}`));
    map.on("click", () => map.scrollWheelZoom.enable());
  }
  function emojiIcon(e, ring) {
    return L.divIcon({
      className: "", html: `<div style="font-size:26px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.3));${ring ? "background:" + ring + ";border-radius:50%;padding:2px 4px;border:2px solid #fff" : ""}">${e}</div>`,
      iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -16],
    });
  }

  const statusEl = $("#mapStatus");
  function setStatus(txt, on) { statusEl.textContent = txt; statusEl.classList.toggle("on", !!on); }

  function startSharing() {
    const name = ($("#meName").value || "").trim() || "אני";
    localStorage.setItem("cyprus2026_name", name);
    if (!navigator.geolocation) { alert("הדפדפן לא תומך במיקום"); return; }
    if (typeof mqtt === "undefined") { setStatus("ספריית MQTT לא נטענה", false); return; }

    setStatus("מתחבר…", false);
    const topic = "cyprus2026/" + TRIP.liveMap.room + "/loc";
    mqttClient = mqtt.connect(TRIP.liveMap.broker, { clean: true, connectTimeout: 8000, reconnectPeriod: 4000 });

    mqttClient.on("connect", () => {
      setStatus("מחובר · משתף מיקום 🟢", true);
      mqttClient.subscribe(topic);
      $("#shareLocBtn").style.display = "none";
      $("#stopLocBtn").style.display = "inline-flex";
      watchId = navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude } = pos.coords;
        const payload = JSON.stringify({ id: myId, name, lat: latitude, lon: longitude, t: Date.now() });
        mqttClient.publish(topic, payload);
        placeMe(latitude, longitude, name);
      }, err => { setStatus("אין הרשאת מיקום", false); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
    });

    mqttClient.on("message", (t, buf) => {
      try {
        const d = JSON.parse(buf.toString());
        if (d.id === myId) return;
        placeOther(d);
      } catch (e) {}
    });
    mqttClient.on("error", () => setStatus("שגיאת חיבור — מנסה שוב…", false));
    mqttClient.on("reconnect", () => setStatus("מתחבר מחדש…", false));
  }

  function placeMe(lat, lon, name) {
    if (!myMarker) {
      myMarker = L.marker([lat, lon], { icon: emojiIcon("📍", "#0ea5e9") }).addTo(map).bindPopup("📍 " + name + " (אני)");
      map.setView([lat, lon], 14);
    } else myMarker.setLatLng([lat, lon]);
  }
  function placeOther(d) {
    if (others[d.id]) others[d.id].marker.setLatLng([d.lat, d.lon]);
    else others[d.id] = { marker: L.marker([d.lat, d.lon], { icon: emojiIcon("🧑", "#fb7185") }).addTo(map).bindPopup("🧑 " + d.name) };
    others[d.id].marker.getPopup().setContent("🧑 " + d.name);
    others[d.id].t = Date.now();
  }
  // ניקוי מי שלא עדכן 2 דקות
  setInterval(() => {
    const now = Date.now();
    Object.keys(others).forEach(id => {
      if (now - others[id].t > 120000) { map.removeLayer(others[id].marker); delete others[id]; }
    });
  }, 30000);

  function stopSharing() {
    if (watchId != null) navigator.geolocation.clearWatch(watchId);
    if (mqttClient) mqttClient.end(true);
    mqttClient = null; watchId = null;
    setStatus("השיתוף הופסק", false);
    $("#shareLocBtn").style.display = "inline-flex";
    $("#stopLocBtn").style.display = "none";
  }
  $("#shareLocBtn").addEventListener("click", startSharing);
  $("#stopLocBtn").addEventListener("click", stopSharing);
  const savedName = localStorage.getItem("cyprus2026_name"); if (savedName) $("#meName").value = savedName;
  initMap();

  /* ============================================================
     גילוי בגלילה (reveal)
     ============================================================ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(x => io.observe(x));

  /* ============================================================
     קונפטי 🎉
     ============================================================ */
  const EMOJIS = ["🥕", "✨", "🌟", "⭐", "🪄", "💛", "🐭", "🐱", "🐶", "🌿", "🎉"];
  function burst() {
    for (let i = 0; i < 36; i++) {
      const p = el("div", "confetti-piece", EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = (2 + Math.random() * 2.5) + "s";
      p.style.fontSize = (1 + Math.random() * 1.6) + "rem";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4600);
    }
  }
  $("#confettiBtn").addEventListener("click", burst);

  /* ============================================================
     פתיחת הספר · התקנת אפליקציה (PWA) · פרלקסה
     ============================================================ */
  // כריכת הספר — לחיצה פותחת את האגדה
  const cover = $("#bookCover"), openBtn = $("#openBookBtn");
  if (cover && openBtn) {
    if (sessionStorage.getItem("cyprus2026_opened")) {
      cover.remove();
    } else {
      document.body.classList.add("locked");
      openBtn.addEventListener("click", () => {
        cover.classList.add("open");
        document.body.classList.remove("locked");
        sessionStorage.setItem("cyprus2026_opened", "1");
        burst();
        setTimeout(() => cover.remove(), 1300);
      });
    }
  } else {
    setTimeout(burst, 900);
  }

  // פרלקסה עדינה לרקע האגדה
  const storyBg = $(".story-bg");
  if (storyBg) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        storyBg.style.transform = "translateY(" + (window.scrollY * 0.16) + "px)";
        ticking = false;
      });
    }, { passive: true });
  }

  // התקנת אפליקציה (PWA)
  let deferredPrompt = null;
  const installBanner = $("#installBanner"), installBtn = $("#installBtn"),
        installClose = $("#installClose");
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const installDismissed = localStorage.getItem("cyprus2026_install_dismissed");
  const SHOW_KEY = "cyprus2026_install_shows";
  const installShows = () => parseInt(localStorage.getItem(SHOW_KEY) || "0", 10);
  const bumpInstallShows = () => localStorage.setItem(SHOW_KEY, String(installShows() + 1));
  // הבאנר יופיע פעמיים בלבד, ורק אם לא הותקן/נדחה
  const canShowInstall = () => !isStandalone && !installDismissed && installShows() < 2;

  async function runInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) {}
    deferredPrompt = null;
    if (installBanner) installBanner.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferredPrompt = e;
    if (installBanner && canShowInstall()) {
      installBanner.hidden = false; installBanner.style.cursor = "pointer"; bumpInstallShows();
    }
  });
  // לחיצה על כל הבאנר מתקינה את האפליקציה
  if (installBanner) installBanner.addEventListener("click", runInstall);
  if (installBtn) installBtn.addEventListener("click", (e) => { e.stopPropagation(); runInstall(); });
  if (installClose) installClose.addEventListener("click", (e) => {
    e.stopPropagation();
    if (installBanner) installBanner.hidden = true;
    localStorage.setItem("cyprus2026_install_dismissed", "1");
  });
  window.addEventListener("appinstalled", () => { if (installBanner) installBanner.hidden = true; });

  // רישום Service Worker (אופליין + התקנה)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ---------- עזר: תאריך עברי ---------- */
  function formatHeDate(iso) {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    const d = new Date(iso + "T00:00:00");
    return `יום ${days[d.getDay()]}, ${d.getDate()} ב${months[d.getMonth()]} ${d.getFullYear()}`;
  }
})();
