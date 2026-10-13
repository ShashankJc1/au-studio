/* AU Studio — placeholder interior illustrations.
   Any element with data-scene="living|bedroom|kitchen|salon|cafe|office|gym|clinic|play|detail|bare"
   and data-tone="sage|clay|stone|night|blush|ocean" gets an SVG room drawn into it.
   Replace with real photos by swapping the element for an <img>. */
(function () {
  /* ---------- Placeholder interior scenes ---------- */
  var TONES = {
    sage:   { wall: "#C9D0C2", wall2: "#B9C2B1", floor: "#A88B6A", wood: "#8A6A4A", fabric: "#EDE6DA", accent: "#9C7535", dark: "#2B3530", glass: "#E4EAE2" },
    clay:   { wall: "#D9C4B3", wall2: "#CBB19C", floor: "#8E7058", wood: "#6E5040", fabric: "#F1E7DC", accent: "#3E5A50", dark: "#2E2A26", glass: "#EFE5DA" },
    stone:  { wall: "#D6D6D0", wall2: "#C4C5BD", floor: "#9C9A92", wood: "#7B6650", fabric: "#2F3A36", accent: "#B08A4A", dark: "#22292A", glass: "#ECEDE8" },
    night:  { wall: "#2F3B37", wall2: "#26312D", floor: "#5A4636", wood: "#7C5C40", fabric: "#C8B8A0", accent: "#D2AA62", dark: "#151B19", glass: "#4A5A55" },
    blush:  { wall: "#E6D3CF", wall2: "#D9C1BC", floor: "#B79C84", wood: "#8E6E55", fabric: "#FAF3EE", accent: "#2F4A44", dark: "#3A2E2C", glass: "#F3E9E6" },
    ocean:  { wall: "#C3CED3", wall2: "#AFBDC3", floor: "#8F7B66", wood: "#6C5644", fabric: "#EFEDE6", accent: "#B4793E", dark: "#1E2A30", glass: "#E2EAEE" }
  };

  function arch(x, y, w, h, t) {
    var r = w / 2;
    return '<path d="M' + x + ' ' + (y + h) + ' V' + (y + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + ' V' + (y + h) + ' Z" fill="' + t.glass + '"/>' +
      '<path d="M' + x + ' ' + (y + h) + ' V' + (y + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + ' V' + (y + h) + '" fill="none" stroke="' + t.wood + '" stroke-width="3"/>' +
      '<line x1="' + (x + r) + '" y1="' + y + '" x2="' + (x + r) + '" y2="' + (y + h) + '" stroke="' + t.wood + '" stroke-width="2"/>' +
      '<line x1="' + x + '" y1="' + (y + r + 10) + '" x2="' + (x + w) + '" y2="' + (y + r + 10) + '" stroke="' + t.wood + '" stroke-width="2"/>';
  }
  function pendant(x, len, t, s) {
    s = s || 1;
    return '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + len + '" stroke="' + t.dark + '" stroke-width="1"/>' +
      '<path d="M' + (x - 16 * s) + ' ' + (len + 14 * s) + ' A' + 16 * s + ' ' + 14 * s + ' 0 0 1 ' + (x + 16 * s) + ' ' + (len + 14 * s) + ' Z" fill="' + t.accent + '"/>' +
      '<ellipse cx="' + x + '" cy="' + (len + 15 * s) + '" rx="' + 8 * s + '" ry="2" fill="#FFF3D6" opacity=".9"/>';
  }
  function plant(x, base, t, s) {
    s = s || 1;
    var g = "#5F7559", g2 = "#4A6046";
    return '<ellipse cx="' + (x - 10 * s) + '" cy="' + (base - 46 * s) + '" rx="' + 9 * s + '" ry="' + 22 * s + '" fill="' + g + '" transform="rotate(-25 ' + x + ' ' + base + ')"/>' +
      '<ellipse cx="' + (x + 10 * s) + '" cy="' + (base - 48 * s) + '" rx="' + 9 * s + '" ry="' + 24 * s + '" fill="' + g2 + '" transform="rotate(22 ' + x + ' ' + base + ')"/>' +
      '<ellipse cx="' + x + '" cy="' + (base - 58 * s) + '" rx="' + 8 * s + '" ry="' + 26 * s + '" fill="' + g + '"/>' +
      '<path d="M' + (x - 14 * s) + ' ' + (base - 24 * s) + ' h' + 28 * s + ' l-4 ' + 24 * s + ' h-' + 20 * s + ' Z" fill="' + t.fabric + '" stroke="' + t.dark + '" stroke-opacity=".15"/>';
  }
  function rug(cx, cy, w, t) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + w + '" ry="' + w * 0.16 + '" fill="' + t.fabric + '" opacity=".75"/>';
  }
  function sofa(x, base, w, t) {
    return '<rect x="' + x + '" y="' + (base - 58) + '" width="' + w + '" height="34" rx="10" fill="' + t.fabric + '"/>' +
      '<rect x="' + (x - 8) + '" y="' + (base - 40) + '" width="' + (w + 16) + '" height="30" rx="10" fill="' + t.fabric + '" stroke="' + t.dark + '" stroke-opacity=".12"/>' +
      '<rect x="' + (x + 12) + '" y="' + (base - 52) + '" width="26" height="20" rx="6" fill="' + t.accent + '" opacity=".85"/>' +
      '<line x1="' + (x + w / 2) + '" y1="' + (base - 38) + '" x2="' + (x + w / 2) + '" y2="' + (base - 14) + '" stroke="' + t.dark + '" stroke-opacity=".12"/>' +
      '<rect x="' + x + '" y="' + (base - 10) + '" width="4" height="10" fill="' + t.dark + '"/><rect x="' + (x + w - 4) + '" y="' + (base - 10) + '" width="4" height="10" fill="' + t.dark + '"/>';
  }
  function roundTable(cx, base, r, t) {
    return '<ellipse cx="' + cx + '" cy="' + (base - 30) + '" rx="' + r + '" ry="' + r * 0.22 + '" fill="' + t.wood + '"/>' +
      '<rect x="' + (cx - 2) + '" y="' + (base - 30) + '" width="4" height="30" fill="' + t.dark + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + base + '" rx="' + r * 0.5 + '" ry="3" fill="' + t.dark + '"/>';
  }
  function stool(cx, base, t) {
    return '<rect x="' + (cx - 10) + '" y="' + (base - 26) + '" width="20" height="6" rx="3" fill="' + t.accent + '"/>' +
      '<line x1="' + (cx - 7) + '" y1="' + (base - 20) + '" x2="' + (cx - 10) + '" y2="' + base + '" stroke="' + t.dark + '" stroke-width="2"/>' +
      '<line x1="' + (cx + 7) + '" y1="' + (base - 20) + '" x2="' + (cx + 10) + '" y2="' + base + '" stroke="' + t.dark + '" stroke-width="2"/>';
  }
  function shelf(x, y, w, t) {
    var books = "";
    for (var i = 0; i < 6; i++) {
      var bw = 6 + (i * 7) % 6, bh = 16 + (i * 5) % 9;
      books += '<rect x="' + (x + 6 + i * 13) + '" y="' + (y - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + [t.accent, t.dark, t.fabric, t.wood][i % 4] + '" opacity=".85"/>';
    }
    return books + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="4" fill="' + t.wood + '"/>';
  }
  function frame(x, y, w, h, t) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + t.fabric + '" stroke="' + t.wood + '" stroke-width="3"/>' +
      '<circle cx="' + (x + w * 0.4) + '" cy="' + (y + h * 0.55) + '" r="' + Math.min(w, h) * 0.22 + '" fill="' + t.accent + '" opacity=".7"/>' +
      '<rect x="' + (x + w * 0.5) + '" y="' + (y + h * 0.3) + '" width="' + w * 0.28 + '" height="' + h * 0.45 + '" fill="' + t.wall2 + '"/>';
  }

  function room(t, floorY) {
    floorY = floorY || 220;
    var s = '<rect width="400" height="300" fill="' + t.wall + '"/>';
    s += '<rect x="0" y="' + floorY + '" width="400" height="' + (300 - floorY) + '" fill="' + t.floor + '"/>';
    for (var i = 1; i < 8; i++) s += '<line x1="' + (i * 60 - 40) + '" y1="' + floorY + '" x2="' + (i * 80 - 120) + '" y2="300" stroke="' + t.dark + '" stroke-opacity=".08"/>';
    s += '<rect x="0" y="' + (floorY - 6) + '" width="400" height="6" fill="' + t.wall2 + '"/>';
    return s;
  }

  var SCENES = {
    bare: function () {
      var t = { wall: "#B9B7B1", wall2: "#A9A7A0", floor: "#8C8A85", wood: "#7A776F", fabric: "#D8D5CE", accent: "#6F6C66", dark: "#3F3D3A", glass: "#CFD3D3" };
      var s = room(t, 220);
      s += "<rect x=\"250\" y=\"50\" width=\"100\" height=\"140\" fill=\"" + t.glass + "\" stroke=\"" + t.dark + "\" stroke-width=\"3\"/><line x1=\"300\" y1=\"50\" x2=\"300\" y2=\"190\" stroke=\"" + t.dark + "\" stroke-width=\"2\"/>";
      s += "<line x1=\"150\" y1=\"0\" x2=\"150\" y2=\"60\" stroke=\"#222\"/><circle cx=\"150\" cy=\"66\" r=\"7\" fill=\"#F3E7B5\"/>";
      s += "<path d=\"M60 250 L90 120 L120 250 M68 215 h44 M76 180 h28 M83 150 h16\" stroke=\"" + t.wood + "\" stroke-width=\"4\" fill=\"none\"/>";
      s += "<rect x=\"170\" y=\"200\" width=\"60\" height=\"44\" fill=\"#B39A78\"/><rect x=\"190\" y=\"170\" width=\"44\" height=\"32\" fill=\"#A88E6C\"/><rect x=\"300\" y=\"226\" width=\"22\" height=\"26\" rx=\"3\" fill=\"#E8E6E0\"/><rect x=\"328\" y=\"230\" width=\"18\" height=\"22\" rx=\"3\" fill=\"#D0CEC8\"/>";
      s += "<path d=\"M20 120 q20 -8 40 4 M330 30 q14 10 30 2\" stroke=\"" + t.dark + "\" stroke-opacity=\".25\" fill=\"none\"/>";
      return s;
    },
    living: function (t) {
      return room(t) + arch(250, 50, 100, 150, t) + frame(70, 70, 70, 52, t) + rug(170, 252, 150, t) +
        sofa(80, 222, 150, t) + roundTable(285, 240, 30, t) + plant(370, 222, t, 1.1) + pendant(160, 40, t);
    },
    bedroom: function (t) {
      var bed = '<rect x="90" y="120" width="220" height="80" rx="6" fill="' + t.wood + '"/>' +
        '<rect x="70" y="180" width="260" height="34" rx="6" fill="' + t.fabric + '"/>' +
        '<rect x="110" y="160" width="70" height="26" rx="10" fill="#FFFFFF" opacity=".85"/><rect x="220" y="160" width="70" height="26" rx="10" fill="#FFFFFF" opacity=".85"/>' +
        '<path d="M70 198 h260 v20 h-260 Z" fill="' + t.accent + '" opacity=".75"/>';
      var side = '<rect x="30" y="180" width="34" height="40" fill="' + t.wood + '"/><rect x="336" y="180" width="34" height="40" fill="' + t.wood + '"/>' +
        '<rect x="42" y="160" width="10" height="20" fill="' + t.fabric + '"/><path d="M36 160 h22 l-5 -16 h-12 Z" fill="' + t.accent + '"/>';
      return room(t, 222) + bed + side + pendant(350, 70, t, 0.8) + rug(200, 262, 170, t);
    },
    kitchen: function (t) {
      var s = room(t, 230);
      s += '<rect x="20" y="40" width="360" height="60" fill="' + t.wall2 + '"/>';
      for (var i = 0; i < 4; i++) s += '<rect x="' + (30 + i * 88) + '" y="48" width="80" height="44" fill="' + t.fabric + '" stroke="' + t.dark + '" stroke-opacity=".12"/>';
      s += '<rect x="20" y="150" width="360" height="80" fill="' + t.fabric + '"/><rect x="20" y="144" width="360" height="8" fill="' + t.dark + '"/>';
      for (var j = 0; j < 6; j++) s += '<line x1="' + (32 + j * 60) + '" y1="168" x2="' + (52 + j * 60) + '" y2="168" stroke="' + t.accent + '" stroke-width="3"/>';
      s += '<rect x="110" y="196" width="190" height="60" fill="' + t.wood + '"/><rect x="104" y="190" width="202" height="8" fill="' + t.dark + '"/>';
      s += stool(130, 280, t) + stool(205, 280, t) + stool(280, 280, t) + pendant(150, 120, t, 0.8) + pendant(260, 120, t, 0.8);
      return s;
    },
    salon: function (t) {
      var s = room(t);
      [70, 200, 330].forEach(function (x) {
        s += '<ellipse cx="' + x + '" cy="105" rx="40" ry="55" fill="' + t.glass + '" stroke="' + t.accent + '" stroke-width="4"/>';
        s += '<rect x="' + (x - 50) + '" y="168" width="100" height="10" fill="' + t.wood + '"/>';
        s += '<rect x="' + (x - 22) + '" y="190" width="44" height="34" rx="10" fill="' + t.dark + '"/><rect x="' + (x - 18) + '" y="222" width="36" height="8" rx="4" fill="' + t.dark + '"/>' +
          '<rect x="' + (x - 2) + '" y="228" width="4" height="22" fill="' + t.accent + '"/><ellipse cx="' + x + '" cy="252" rx="18" ry="4" fill="' + t.accent + '"/>';
      });
      return s + pendant(135, 26, t, 0.7) + pendant(265, 26, t, 0.7);
    },
    cafe: function (t) {
      var s = room(t, 225);
      s += '<rect x="20" y="40" width="130" height="80" fill="' + t.dark + '"/>';
      for (var i = 0; i < 4; i++) s += '<line x1="34" y1="' + (58 + i * 16) + '" x2="' + (90 + (i % 2) * 40) + '" y2="' + (58 + i * 16) + '" stroke="' + t.fabric + '" stroke-opacity=".7" stroke-width="2"/>';
      s += arch(200, 40, 70, 130, t) + arch(300, 40, 70, 130, t);
      s += roundTable(90, 260, 34, t) + stool(48, 262, t) + stool(132, 262, t) + roundTable(290, 268, 34, t) + stool(248, 270, t) + stool(332, 270, t);
      s += plant(190, 225, t, 0.9) + pendant(90, 150, t, 0.7) + pendant(290, 160, t, 0.7);
      return s;
    },
    office: function (t) {
      var s = room(t, 228);
      s += '<rect x="20" y="40" width="160" height="150" fill="' + t.glass + '" stroke="' + t.dark + '" stroke-width="3"/><line x1="100" y1="40" x2="100" y2="190" stroke="' + t.dark + '" stroke-width="2"/>';
      s += shelf(220, 90, 150, t) + shelf(220, 140, 150, t);
      s += '<rect x="110" y="186" width="200" height="8" fill="' + t.wood + '"/><rect x="118" y="194" width="6" height="50" fill="' + t.dark + '"/><rect x="296" y="194" width="6" height="50" fill="' + t.dark + '"/>';
      s += '<rect x="170" y="146" width="62" height="38" rx="2" fill="' + t.dark + '"/><rect x="196" y="184" width="10" height="4" fill="' + t.dark + '"/>';
      s += '<rect x="230" y="196" width="40" height="30" rx="8" fill="' + t.accent + '"/><rect x="246" y="226" width="6" height="18" fill="' + t.dark + '"/>';
      return s + plant(360, 228, t, 1) + pendant(210, 60, t, 0.8);
    },
    gym: function (t) {
      var s = room(t, 230);
      for (var i = 0; i < 4; i++) s += '<rect x="' + (20 + i * 92) + '" y="40" width="84" height="150" fill="' + t.glass + '" stroke="' + t.dark + '" stroke-opacity=".3"/>';
      s += '<rect x="40" y="200" width="160" height="6" fill="' + t.dark + '"/>';
      for (var j = 0; j < 5; j++) s += '<rect x="' + (50 + j * 30) + '" y="190" width="18" height="10" rx="4" fill="' + t.accent + '"/>';
      s += '<rect x="230" y="216" width="130" height="12" rx="4" fill="' + t.dark + '"/><rect x="240" y="228" width="6" height="22" fill="' + t.dark + '"/><rect x="344" y="228" width="6" height="22" fill="' + t.dark + '"/>';
      s += '<line x1="200" y1="0" x2="200" y2="30" stroke="' + t.dark + '"/><rect x="0" y="0" width="400" height="10" fill="' + t.wall2 + '"/>';
      return s + rug(120, 262, 110, t);
    },
    clinic: function (t) {
      var s = room(t, 226);
      s += arch(40, 50, 90, 140, t) + '<circle cx="290" cy="90" r="40" fill="' + t.accent + '" opacity=".25"/><circle cx="320" cy="110" r="26" fill="' + t.accent + '" opacity=".35"/>';
      s += '<path d="M170 226 V176 a20 20 0 0 1 20 -20 h170 v70 Z" fill="' + t.fabric + '"/><rect x="170" y="150" width="190" height="8" rx="4" fill="' + t.wood + '"/>';
      s += '<rect x="20" y="210" width="120" height="16" rx="8" fill="' + t.accent + '"/><rect x="26" y="226" width="4" height="20" fill="' + t.dark + '"/><rect x="130" y="226" width="4" height="20" fill="' + t.dark + '"/>';
      return s + plant(380, 226, t, 0.9) + pendant(260, 40, t, 0.8);
    },
    play: function (t) {
      var s = room(t, 224);
      s += '<path d="M30 200 A60 60 0 0 1 150 200 Z" fill="' + t.accent + '" opacity=".5"/><path d="M60 200 A30 30 0 0 1 120 200 Z" fill="' + t.wall + '"/>';
      s += '<circle cx="250" cy="80" r="28" fill="#E3B65A" opacity=".8"/><rect x="300" y="60" width="60" height="60" rx="8" fill="' + t.accent + '" opacity=".55"/><path d="M200 140 l24 -40 l24 40 Z" fill="#C97A5C" opacity=".7"/>';
      s += '<rect x="190" y="210" width="150" height="8" rx="4" fill="' + t.wood + '"/><rect x="200" y="218" width="5" height="26" fill="' + t.dark + '"/><rect x="325" y="218" width="5" height="26" fill="' + t.dark + '"/>';
      s += '<rect x="170" y="226" width="24" height="18" rx="5" fill="#E3B65A"/><rect x="345" y="226" width="24" height="18" rx="5" fill="#C97A5C"/>';
      return s + rug(110, 262, 100, t);
    },
    detail: function (t) {
      var s = '<rect width="400" height="300" fill="' + t.wall + '"/>';
      for (var i = 0; i < 14; i++) s += '<rect x="' + (i * 30) + '" y="0" width="22" height="300" fill="' + t.wall2 + '" opacity=".7"/>';
      s += '<rect x="0" y="200" width="400" height="100" fill="' + t.wood + '"/><rect x="0" y="196" width="400" height="6" fill="' + t.dark + '"/>';
      s += '<rect x="80" y="140" width="40" height="56" rx="4" fill="' + t.fabric + '"/><circle cx="210" cy="170" r="26" fill="' + t.accent + '" opacity=".9"/><rect x="270" y="110" width="12" height="86" fill="' + t.dark + '"/>';
      return s + plant(330, 196, t, 0.9);
    }
  };

  function drawScenes(root) {
    (root || document).querySelectorAll("[data-scene]").forEach(function (el) {
      if (el.querySelector("svg")) return;
      var t = TONES[el.dataset.tone] || TONES.sage;
      var fn = SCENES[el.dataset.scene] || SCENES.living;
      el.insertAdjacentHTML("afterbegin",
        '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' +
        (el.dataset.label || "Interior illustration") + '">' + fn(t) + "</svg>");
    });
  }
  function draw(root) {
    (root || document).querySelectorAll("[data-scene]").forEach(function (el) {
      if (el.querySelector(":scope > svg")) return;
      var t = TONES[el.dataset.tone] || TONES.sage;
      var fn = SCENES[el.dataset.scene] || SCENES.living;
      el.insertAdjacentHTML("afterbegin",
        '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' +
        (el.dataset.label || "Interior illustration") + '">' + fn(t) + "</svg>");
    });
  }
  window.AUScenes = { draw: draw, tones: TONES };
  draw();
})();
