(function () {
  // Generate retro-looking “error” parts
  const hex = (n, len) => n.toString(16).toUpperCase().padStart(len, "0");
  const rand16 = () => Math.floor(Math.random() * 0xFFFF);

  const codeEl = document.getElementById("code");
  const addrEl = document.getElementById("addr");
  const modEl  = document.getElementById("mod");
  if (codeEl && addrEl && modEl) {
    codeEl.textContent = ["0E", "06", "0D", "0C"][Math.floor(Math.random()*4)];
    const seg = hex(rand16(), 4);
    const off = hex(Math.floor(Math.random()*0xFFFFFF), 7);
    addrEl.textContent = `${seg}:${off}`;
    modEl.textContent  = `VXD IPV4_EVENTS(${hex(Math.floor(Math.random()*4)+1,2)})`;
  }

  // Countdown + auto-redirect (10 → 0)
  const secsEl = document.getElementById("secs");
  let remaining = 10;
  const homeURL = "/"; // ipv4.events is on apex, so "/" is correct
  const timer = setInterval(() => {
    remaining -= 1;
    if (secsEl) secsEl.textContent = String(remaining);
    if (remaining <= 0) {
      clearInterval(timer);
      location.href = homeURL;
    }
  }, 1000);

  // “Press any key to continue…”
  const goHome = () => { location.href = homeURL; };
  document.addEventListener("keydown", goHome);
  document.addEventListener("click", goHome);
})();