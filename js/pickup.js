document.addEventListener("bakery:ready", (event) => {
  const site = event.detail.site;
  const B = window.Bakery;
  const pickup = site.pickup || {};
  const title = document.getElementById("page-title");
  const intro = document.getElementById("page-intro");
  if (title) title.textContent = pickup.title || "Pickup and delivery";
  if (intro) intro.textContent = pickup.intro || "";
  const copy = document.getElementById("pickup-copy");
  const paragraphs = (pickup.paragraphs || []).map((paragraph) => "<p>" + B.esc(paragraph) + "</p>").join("");
  const neighborhoods = Array.isArray(pickup.neighborhoods) ? pickup.neighborhoods.filter(Boolean) : [];
  const list = neighborhoods.length
    ? "<h2>Nearby delivery</h2><ul>" + neighborhoods.map((name) => "<li>" + B.esc(name) + "</li>").join("") + "</ul><p class=\"hint\">Still confirmed by text.</p>"
    : "";
  copy.innerHTML = paragraphs + list;
  const caption = document.getElementById("map-caption");
  if (caption && pickup.map) caption.textContent = pickup.map.caption || "";

  const fallback = document.getElementById("map-fallback");
  const mapEl = document.getElementById("map");
  if (!window.L || !mapEl) {
    if (fallback) {
      fallback.hidden = false;
      fallback.innerHTML = 'The map could not load. Pacific Beach is the coastal neighborhood of San Diego just north of Mission Bay. <a href="https://www.openstreetmap.org/#map=14/32.796/-117.243" target="_blank" rel="noopener noreferrer">Open Pacific Beach on OpenStreetMap</a>.';
    }
    return;
  }
  const mapInfo = pickup.map || {};
  const lat = Number(mapInfo.lat) || 32.796;
  const lng = Number(mapInfo.lng) || -117.243;
  const radius = Number(mapInfo.radiusMeters) || 1800;
  const map = window.L.map(mapEl, { scrollWheelZoom: false }).setView([lat, lng], Number(mapInfo.zoom) || 13);
  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);
  const circle = window.L.circle([lat, lng], {
    radius,
    color: "#7a5c49",
    weight: 1.5,
    fillColor: "#e6d3c0",
    fillOpacity: 0.45
  }).addTo(map);
  map.fitBounds(circle.getBounds(), { padding: [24, 24] });
});
