export const utils = {
  normalize: function (n, o, t, r, e) {
    return r + ((Math.max(Math.min(n, t), o) - o) / (t - o)) * (e - r);
  },
  findWhere: function (n, o) {
    for (const t of n) {
      let n = !0;
      for (const r in o)
        if (t[r] !== o[r]) {
          n = !1;
          break;
        }
      if (n) return t;
    }
    return null;
  },
  randomOneOf: function (n) {
    return n[Math.floor(Math.random() * n.length)];
  },
  randomFromRange: function (n, o) {
    return n + Math.random() * (o - n);
  },
  collide: function (n, o, t) {
    return n.position.clone().sub(o.position.clone()).length() < t;
  },
  makeTetrahedron: function (n, o, t, r) {
    return [
      n[0],
      n[1],
      n[2],
      o[0],
      o[1],
      o[2],
      t[0],
      t[1],
      t[2],
      o[0],
      o[1],
      o[2],
      t[0],
      t[1],
      t[2],
      r[0],
      r[1],
      r[2],
    ];
  },
  clamp: function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
};

export const isMobile = {
  any: function () {
    return (
      isMobile.Android() ||
      isMobile.iOS() ||
      isMobile.Opera() ||
      isMobile.Windows()
    );
  },
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
};
