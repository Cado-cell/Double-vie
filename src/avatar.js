/* Deux Vies — avatars, direction A « flat géométrique doux ».
   Une seule constante globale : AV_A.
   AV_A.render(look, opts) renvoie une chaîne <svg viewBox="0 0 100 100">.
   Repère : visage centré en x = 50, sommet du crâne y = 25, menton y = 65.5 (adulte).
   Les enfants et bébés réutilisent le même dessin de tête, agrandi et descendu. */
const AV_A = (() => {
  'use strict';

  /* ---------- Palettes ---------- */
  const SKINS = ['#FBE4D5', '#F4D0B5', '#E9B992', '#D69F76', '#BA8059', '#9A6243', '#76462E', '#4E2D1F'];
  const HAIR_COLORS = ['#25201F', '#45302A', '#6E4A33', '#8A3D27', '#A47A4F', '#DDB677', '#EEE4CF', '#CB5F30', '#F1A9C0', '#5B84D6'];
  const EYE_COLORS = ['#6B4128', '#94683A', '#4E8152', '#3E7EBF', '#7E8C98', '#2A201D'];
  const TOP_COLORS = ['#D9704C', '#E3A93C', '#7EA68A', '#2F6F78', '#2E3F66', '#8D7BC2', '#E7A1A6', '#8E3049', '#EDE3D2', '#3B3E46'];
  const BG_COLORS = ['#F7E3D3', '#E2EDE3', '#DCE7F3', '#ECE1F1', '#FAEBC6', '#F6DAD8', '#D8EEEA', '#E8E3DC'];

  const HAIRS = ['court', 'rase', 'meche', 'boucle', 'afro', 'milong', 'long', 'carre', 'queue', 'chignon', 'tresses', 'crete', 'chauve', 'ondule', 'frange', 'undercut', 'pixie', 'locs', 'manbun', 'degarni'];
  const FACES = ['ovale', 'rond', 'carre', 'long', 'coeur'];
  const NOSES = ['droit', 'fin', 'large', 'retrousse', 'aquilin'];
  const LIPS = ['fines', 'moyennes', 'pleines'];
  const MAKEUPS = ['aucun', 'naturel', 'rouge', 'rose', 'prune', 'smoky'];
  const MARKS = ['aucune', 'grain', 'cicatrice', 'acne'];
  const EYES = ['ronds', 'amande', 'rieurs', 'miclos'];
  const BROWS = ['naturels', 'arques', 'epais', 'fins'];
  const BEARDS = ['aucune', 'barbe3j', 'barbe', 'bouc', 'moustache', 'barbelongue', 'collier', 'favoris', 'goatee'];
  const GLASSES = ['aucune', 'rondes', 'carrees', 'solaires', 'aviateur', 'chat', 'demi'];
  const ACCS = ['aucun', 'boucles', 'casquette', 'bonnet', 'bandeau', 'fleur', 'chapeau', 'bandana', 'voile', 'piercing'];
  const TOPS = ['tshirt', 'sweat', 'chemise', 'costume', 'robe', 'pull', 'polo', 'veste', 'debardeur', 'blouse'];

  /* Libellés prêts pour un éditeur */
  const LABELS = {
    hair: { ondule: 'Ondulé', frange: 'Frange', undercut: 'Undercut', pixie: 'Pixie', locs: 'Locks', manbun: 'Chignon homme', degarni: 'Dégarni', court: 'Court', rase: 'Rasé', meche: 'Mèche', boucle: 'Bouclé', afro: 'Afro', milong: 'Mi-long', long: 'Long', carre: 'Carré', queue: 'Queue-de-cheval', chignon: 'Chignon', tresses: 'Tresses', crete: 'Crête', chauve: 'Chauve' },
    eyes: { ronds: 'Ronds', amande: 'En amande', rieurs: 'Rieurs', miclos: 'Mi-clos' },
    brows: { naturels: 'Naturels', arques: 'Arqués', epais: 'Épais', fins: 'Fins' },
    beard: { barbelongue: 'Barbe longue', collier: 'Collier', favoris: 'Favoris', goatee: 'Bouc et moustache', aucune: 'Aucune', barbe3j: 'Barbe de 3 jours', barbe: 'Barbe', bouc: 'Bouc', moustache: 'Moustache' },
    glasses: { aviateur: 'Aviateur', chat: 'Œil de chat', demi: 'Demi-cerclées', aucune: 'Aucune', rondes: 'Rondes', carrees: 'Carrées', solaires: 'Solaires' },
    acc: { chapeau: 'Chapeau', bandana: 'Bandana', voile: 'Voile', piercing: 'Piercing au nez', aucun: 'Aucun', boucles: 'Boucles d’oreilles', casquette: 'Casquette', bonnet: 'Bonnet', bandeau: 'Bandeau', fleur: 'Fleur' },
    top: { polo: 'Polo', veste: 'Veste', debardeur: 'Débardeur', blouse: 'Blouse blanche', tshirt: 'T-shirt', sweat: 'Sweat à capuche', chemise: 'Chemise', costume: 'Costume', robe: 'Robe', pull: 'Col roulé' },
    face: { ovale: 'Ovale', rond: 'Rond', carre: 'Carré', long: 'Allongé', coeur: 'En cœur' }, nose: { droit: 'Droit', fin: 'Fin', large: 'Large', retrousse: 'Retroussé', aquilin: 'Aquilin' }, lips: { fines: 'Fines', moyennes: 'Moyennes', pleines: 'Pleines' }, makeup: { aucun: 'Aucun', naturel: 'Naturel', rouge: 'Rouge à lèvres', rose: 'Rose', prune: 'Prune', smoky: 'Smoky' }, mark: { aucune: 'Aucune', grain: 'Grain de beauté', cicatrice: 'Cicatrice', acne: 'Acné' },
    skin: ['Porcelaine', 'Claire', 'Pêche', 'Dorée', 'Caramel', 'Cannelle', 'Brune', 'Ébène'],
    hc: ['Noir', 'Brun foncé', 'Châtain', 'Auburn', 'Blond foncé', 'Blond', 'Platine', 'Roux', 'Rose pastel', 'Bleu'],
    eye: ['Marron', 'Noisette', 'Vert', 'Bleu', 'Gris', 'Noir'],
    topc: ['Terracotta', 'Moutarde', 'Sauge', 'Canard', 'Marine', 'Lavande', 'Rose poudré', 'Bordeaux', 'Crème', 'Anthracite'],
    bg: ['Pêche', 'Sauge', 'Ciel', 'Lilas', 'Paille', 'Rose', 'Menthe', 'Grège']
  };

  /* ---------- Couleurs ---------- */
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
  const mul = (a, b) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v * B[i] / 255)); };
  const lum = h => { const [r, g, b] = rgb(h); return (0.3 * r + 0.59 * g + 0.11 * b) / 255; };
  const gray = h => { const [r, g, b] = rgb(h); const l = 0.3 * r + 0.59 * g + 0.11 * b; return hex([r, g, b].map(v => v + (l - v) * 0.85)); };

  /* ---------- Outils ---------- */
  const f = n => String(Math.round(n * 100) / 100);
  const has = (arr, v) => arr.indexOf(v) >= 0;
  const idx = (v, n, d) => (Number.isInteger(v) && v >= 0 && v < n ? v : d);
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const wpick = (items, weights) => { let t = 0; for (const w of weights) t += w; let r = Math.random() * t; for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r < 0) return items[i]; } return items[items.length - 1]; };
  let UID = 0;

  /* ---------- Normalisation (ancien format compris) ---------- */
  const OLD_SKIN = [0, 1, 3, 4, 6, 7], OLD_HC = [0, 1, 2, 4, 5, 7], OLD_EYE = [0, 3, 2, 1], OLD_SHIRT = [3, 5, 2, 0, 4, 7, 9, 1];
  const OLD_HAIR = { H: ['court', 'meche', 'court', 'rase'], F: ['long', 'carre', 'milong', 'queue'] };

  function normalize(look, gender) {
    const g = gender === 'F' ? 'F' : 'H';
    const L = look && typeof look === 'object' ? look : {};
    let seed = 0; try { seed = hash(JSON.stringify(L) + g); } catch (e) { seed = 7; }
    const det = (arr, k) => arr[((seed >>> k) ^ (seed >>> (k + 7))) % arr.length];
    const old = typeof L.hair === 'number' || (L.shirt !== undefined && L.top === undefined);
    const o = {};
    if (old) {
      o.skin = OLD_SKIN[idx(L.skin, 6, 1)];
      o.hc = OLD_HC[idx(L.hc, 6, 1)];
      o.eye = OLD_EYE[idx(L.eye, 4, 0)];
      const hs = idx(L.hair, 4, 0);
      o.hair = OLD_HAIR[g][hs];
      o.beard = g === 'H' && hs === 2 ? 'barbe' : 'aucune';
      o.topc = OLD_SHIRT[idx(L.shirt, 8, 0)];
    } else {
      o.skin = idx(L.skin, 8, 1);
      o.hc = idx(L.hc, 10, 1);
      o.eye = idx(L.eye, 6, 0);
      o.hair = has(HAIRS, L.hair) ? L.hair : det(g === 'F' ? ['long', 'milong', 'carre', 'queue'] : ['court', 'meche', 'rase'], 3);
      o.beard = has(BEARDS, L.beard) ? L.beard : 'aucune';
      o.topc = idx(L.topc, 10, det([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5));
    }
    o.eyes = has(EYES, L.eyes) ? L.eyes : 'amande';
    o.brows = has(BROWS, L.brows) ? L.brows : 'naturels';
    o.glasses = has(GLASSES, L.glasses) ? L.glasses : 'aucune';
    o.acc = has(ACCS, L.acc) ? L.acc : 'aucun';
    o.top = has(TOPS, L.top) ? L.top : det(g === 'F' ? ['tshirt', 'pull', 'chemise', 'robe'] : ['tshirt', 'pull', 'chemise', 'sweat'], 9);
    o.bg = idx(L.bg, 8, det([0, 1, 2, 3, 4, 5, 6, 7], 13));
    o.freckles = L.freckles === true;
    o.face = has(FACES, L.face) ? L.face : det(FACES, 17);
    o.nose = has(NOSES, L.nose) ? L.nose : det(NOSES, 21);
    o.lips = has(LIPS, L.lips) ? L.lips : det(LIPS, 23);
    o.makeup = has(MAKEUPS, L.makeup) ? L.makeup : 'aucun';
    o.mark = has(MARKS, L.mark) ? L.mark : 'aucune';
    o.seed = seed;
    return o;
  }

  /* ---------- Formes paramétriques ---------- */
  // Points sur une ellipse (angles en degrés, sens horaire à l’écran)
  const ell = (cx, cy, rx, ry, a0, a1, n) => {
    const p = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return p;
  };
  // Arcs bombés vers la gauche du sens de parcours (vers l’extérieur en sens horaire)
  const bumps = (pts, k) => {
    let d = '';
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const r = Math.hypot(x1 - x0, y1 - y0) * (k || 0.62);
      d += `A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y1)}`;
    }
    return d;
  };
  const M = p => `M${f(p[0])} ${f(p[1])}`;
  const L_ = p => `L${f(p[0])} ${f(p[1])}`;
  const dots = (pts, r) => pts.map(([x, y]) => `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`).join('');
  const P = (d, fill, extra) => `<path d="${d}" fill="${fill}"${extra || ''}/>`;
  const S = (d, stroke, w, extra) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra || ''}/>`;

  /* ---------- Coiffures ---------- */
  // Renvoie {back, front, top} ; back = derrière la tête (et derrière le corps), front = devant le visage.
  function hairArt(style, c, hat) {
    const H = c.hair, D = c.hairD, Lh = c.hairL;
    const back = [], front = [];
    let top = 18;
    // calotte lisse commune (queue, chignon, tresses)
    const sleek = 'M32.3 47.5C30.7 31 38.4 19 50 19C61.6 19 69.3 31 67.7 47.5L66.6 47.5C66.2 40.4 64.6 35.2 61.6 32.4C56.2 30.2 43.8 30.2 38.4 32.4C35.4 35.2 33.8 40.4 33.4 47.5Z';
    switch (style) {
      case 'court':
        front.push(P('M32.2 47.5C30.4 32 37.5 18.4 50.5 18.4C63.5 18.4 70.2 29 67.9 47.5L66.7 47.5C66.4 41 65 36 62.2 32.6C56.5 34.4 46.5 33.8 39.8 30.8C36.8 34.2 34.8 39.8 34.2 47.5Z', H));
        front.push(S('M40.6 30.4C44.6 25.4 52.4 22.6 60.6 23.6M47.6 32.6C51.6 29.4 57 28.4 62 29.6', D, 1.1));
        top = 18.4; break;
      case 'rase':
        front.push(P('M33.2 44.8C32.5 30.4 39.6 21.8 50 21.8C60.4 21.8 67.5 30.4 66.8 44.8C66 38.6 64.4 34 61.6 31.8C55.2 29.8 44.8 29.8 38.4 31.8C35.6 34 34 38.6 33.2 44.8Z', c.buzz));
        top = 21.8; break;
      case 'meche':
        front.push(P('M32 48C29.6 31 37.2 16.8 52 17.2C65.2 17.6 71 29 68 48L66.8 48C66.4 41.6 64.8 36.6 62.4 33.8C57.6 36.6 47.4 37.2 38.8 37.8C36.2 39.4 34.8 42.8 34.3 48Z', H));
        front.push(S('M61.8 33.6C57.6 29.8 49.6 29 41.6 32M52.4 19.6C58.4 21.4 62.4 26 63.6 31', D, 1.1));
        top = 17.2; break;
      case 'boucle': {
        const ob = ell(50, 39.5, 24.5, 24.5, 112, 428, 14);
        back.push(P(M(ob[0]) + bumps(ob) + 'Z', D));
        const of = ell(50, 41, 20, 23.6, 162, 378, 10);
        const inner = [[66.4, 49.5], [65.8, 42], [63.2, 36], [57.6, 32.2], [50, 31.2], [42.4, 32.2], [36.8, 36], [34.2, 42], [33.6, 49.5]];
        front.push(P(M(of[0]) + bumps(of) + L_(inner[0]) + bumps(inner, 0.7) + 'Z', H));
        front.push(S('M40.6 22.6a2.6 2.6 0 0 1 4.2 1.6M53 19.6a2.6 2.6 0 0 1 4.2 1.4M30.6 37.6a2.6 2.6 0 0 1 3.2 3.2M66.6 33.4a2.6 2.6 0 0 1 2.6 3.4M46.6 26.4a2.4 2.4 0 0 1 3.8 .8', D, 1));
        top = 15; break;
      }
      case 'afro': {
        const ob = ell(50, 37, 30, 28.6, -90, 270, 18);
        back.push(P(M(ob[0]) + bumps(ob, 0.6) + 'Z', H));
        back.push(`<ellipse cx="50" cy="47" rx="19.6" ry="22.4" fill="${D}"/>`);
        const of = ell(50, 40, 19.6, 22.4, 166, 374, 9);
        const inner = [[66.2, 47], [65.4, 40.6], [62.6, 35], [57, 31.6], [50, 30.8], [43, 31.6], [37.4, 35], [34.6, 40.6], [33.8, 47]];
        front.push(P(M(of[0]) + bumps(of) + L_(inner[0]) + bumps(inner, 0.7) + 'Z', H));
        front.push(S('M28 26a3 3 0 0 1 4.6 1.4M40 13.6a3 3 0 0 1 4.6 .6M58.4 13.2a3 3 0 0 1 4.4 1.8M70.4 24.4a3 3 0 0 1 2.6 4M24.4 40a3 3 0 0 1 2 4.4M75.2 42a3 3 0 0 1 -1 4.6M48.4 21a2.6 2.6 0 0 1 4 .6', D, 1.1));
        top = 8.4; break;
      }
      case 'milong':
        back.push(P('M28.8 46C27 26 37.5 15.5 50 15.5C62.5 15.5 73 26 71.2 46C70.8 57 72 65.5 74.6 72C67 74.6 60 73.6 56.4 70.6L43.6 70.6C40 73.6 33 74.6 25.4 72C28 65.5 29.2 57 28.8 46Z', D));
        front.push(P('M27 70.4C29.6 63 30.8 54 30.6 44C30.4 29 38 17 50 17C63 17 69.6 30 69.4 44C69.3 54 70.4 63 73 70.4C68.2 71.4 64.8 69 64.2 63.6C63.4 56 64.6 46 63.8 37.4C57.6 35.6 49.2 30.6 45.2 23.4C43.2 27.2 39.4 32 37.2 39.4C35.8 46 37.6 56 36.6 64C35.8 69 32.2 71.4 27 70.4Z', H));
        front.push(S('M45.2 23.4C48.6 20.2 54 19 59.6 20.6M63.8 40C66.2 48 65.4 58 68.4 66.4M36.4 42C34.2 50 35.2 60 31.6 67.6', D, 1.05));
        top = 15.5; break;
      case 'long':
        back.push(P('M28 46C26.5 25 37 14.6 50 14.6C63 14.6 73.5 25 72 46C71.5 62 74.2 78 79.4 101L20.6 101C25.8 78 28.5 62 28 46Z', D));
        front.push(P('M25.6 95.4C28.8 80 30.7 62 30.6 44C30.4 29 38 17 50 17C63 17 69.6 30 69.4 44C69.3 62 71.2 80 74.4 95.4C70.6 97 66.6 96 65 92.4C63.4 82 64.2 66 64 56C63.9 49 64.6 43 63.8 37.4C57.6 35.6 49.2 30.6 45.2 23.4C43.2 27.2 39.4 32 37.2 39.4C35.6 50 36.8 72 35 92.4C33.4 96 29.4 97 25.6 95.4Z', H));
        front.push(S('M45.2 23.4C48.6 20.2 54 19 59.6 20.6M64.2 42C66.6 56 66.4 74 69.4 90M36.2 44C34 58 34.4 76 30.6 90', D, 1.05));
        top = 14.6; break;
      case 'carre':
        back.push(P('M28.6 45C27.6 25.5 37 15.6 50 15.6C63 15.6 72.4 25.5 71.4 45C71.2 53.5 72.2 60.5 73.4 64.6C66 67.2 34 67.2 26.6 64.6C27.8 60.5 28.8 53.5 28.6 45Z', D));
        front.push(P('M26.8 64.4C28.6 58 30 52 30 44C30 28.5 38.6 17.6 50 17.6C61.4 17.6 70 28.5 70 44C70 52 71.4 58 73.2 64.4C70.2 65.6 67.4 65.3 65.6 64.2C65.8 56 66.2 45 64.6 36.6C57 37.8 43 37.8 35.4 36.6C33.8 45 34.2 56 34.4 64.2C32.6 65.3 29.8 65.6 26.8 64.4Z', H));
        front.push(S('M43.4 29.4L42.8 36.6M50 29L50 37.2M56.6 29.4L57.2 36.6M66.6 44C67.6 52 67.2 58 69.4 63.4M33.4 44C32.4 52 32.8 58 30.6 63.4', D, 1));
        top = 15.6; break;
      case 'queue':
        if (!hat) back.push(P('M63 23.6C73.6 21.4 79.4 30.6 78.4 43C77.6 54.6 74.6 63 71 71.2C69.6 63 69.6 55 70.2 47C70.8 38.4 68.4 31.6 61.8 29.6Z', D), S('M71.6 32.4C74.6 40 74 54 71.4 64', c.hairDD, 1));
        front.push(P(sleek, H));
        front.push(S('M39.8 31C43.6 24.8 55.6 23.2 62.6 27.6M45 31.4C49 27.6 56 26.6 61 28.6', D, 1.05));
        if (!hat) front.push(`<circle cx="64.6" cy="25.8" r="2.7" fill="${c.tie}"/>`);
        top = 19; break;
      case 'chignon':
        if (!hat) {
          back.push(`<circle cx="50" cy="14.6" r="9.2" fill="${H}"/>`);
          back.push(S('M44.4 13.6C45.6 9.4 53.4 8.6 55.4 13.2M46.6 18.4C49.4 19.8 53.4 19.2 55.2 16.6', D, 1.05));
        }
        front.push(P(sleek, H));
        front.push(S('M40 31C44 25 56 25 60 31M50 19.6L50 23.4', D, 1.05));
        top = hat ? 19 : 5.4; break;
      case 'tresses': {
        back.push(P('M29.6 46C28 27 37.6 16.4 50 16.4C62.4 16.4 72 27 70.4 46C70 60 71.6 74 74 92L26 92C28.4 74 30 60 29.6 46Z', c.hairDD));
        const bL = 'M33.4 42C31.6 56 30.4 72 31 94M30 38.6C27.4 54 26 70 26.6 88.4M36 50.4C35 63 34.8 78 35.8 96.6';
        const bR = 'M66.6 42C68.4 56 69.6 72 69 94M70 38.6C72.6 54 74 70 73.4 88.4M64 50.4C65 63 65.2 78 64.2 96.6';
        front.push(P(sleek.replace('C56.2 30.2 43.8 30.2 38.4 32.4', 'C57.2 31 52.4 30.4 50 29C47.6 30.4 42.8 31 38.4 32.4'), H));
        front.push(S('M50 29L50 19.4M45.4 30.4C41.6 27.8 39 26 36 28M54.6 30.4C58.4 27.8 61 26 64 28', D, 1));
        front.push(S(bL + bR, H, 4.4));
        front.push(S(bL + bR, D, 4.4, ' stroke-dasharray="1.3 1.9"'));
        front.push(`<path d="${dots([[31, 94], [26.6, 88.4], [35.8, 96.6], [69, 94], [73.4, 88.4], [64.2, 96.6]], 1.5)}" fill="${c.gold}"/>`);
        top = 19; break;
      }
      case 'crete':
        front.push(P('M33.2 44.8C32.5 30.4 39.6 21.8 50 21.8C60.4 21.8 67.5 30.4 66.8 44.8C66 38.6 64.4 34 61.6 31.8C55.2 29.8 44.8 29.8 38.4 31.8C35.6 34 34 38.6 33.2 44.8Z', c.buzzL));
        if (!hat) {
          front.push(P('M43.4 31.6C41.8 22.6 44.4 12.4 51.8 6.8C53.4 12 57.8 15.4 58.2 23C58.4 27 57.6 29.8 56.6 31.6C52.4 30.6 47.6 30.6 43.4 31.6Z', H));
          front.push(S('M47.2 29.6C46.8 22 48.6 15 51.6 9.4M53.2 29.4C54.2 23 53.4 17.6 51.8 13', D, 1.05));
          top = 6.8;
        } else top = 21.8;
        break;
      case 'ondule':
        back.push(P('M28.8 46C27 26 37.5 15.5 50 15.5C62.5 15.5 73 26 71.2 46C71 55 72.4 62 75 68C72 71 69 69 66.6 72C64 75 61 72.4 58.6 74.6L41.4 74.6C39 72.4 36 75 33.4 72C31 69 28 71 25 68C27.6 62 29 55 28.8 46Z', D));
        front.push(P('M25.4 68C28.4 61 30.8 54 30.6 44C30.4 29 38 17 50 17C63 17 69.6 30 69.4 44C69.2 54 71.6 61 74.6 68C71.4 70.6 69 68.2 67 69.6C64.8 71.6 62 70 60.6 68C61.8 60 64.4 48 63.8 37.4C57.6 35.6 49.2 30.6 45.2 23.4C43.2 27.2 39.4 32 37.2 39.4C35.6 48 38.4 60 39.4 68C38 70 35.2 71.6 33 69.6C31 68.2 28.6 70.6 25.4 68Z', H));
        front.push(S('M45.2 23.4C48.6 20.2 54 19 59.6 20.6M64.4 42Q67.4 48 64.8 54Q62.4 60 65.6 66M35.6 42Q32.6 48 35.2 54Q37.6 60 34.4 66M52 21Q56 24 55 28', D, 1.05));
        top = 15.5; break;
      case 'frange':
        back.push(P('M28 46C26.5 25 37 14.6 50 14.6C63 14.6 73.5 25 72 46C71.5 62 74.2 78 79.4 101L20.6 101C25.8 78 28.5 62 28 46Z', D));
        front.push(P('M25.6 95.4C28.8 80 30.7 62 30.6 44C30.4 29 38 17 50 17C63 17 69.6 30 69.4 44C69.3 62 71.2 80 74.4 95.4C70.6 97 66.6 96 65 92.4C63.4 82 64.2 66 64 56C63.9 49 64.6 43 63.8 37.4L36.2 37.4C35.4 43 36.1 49 36 56C35.8 66 36.6 82 35 92.4C33.4 96 29.4 97 25.6 95.4Z', H));
        front.push(P('M30.8 45C29.8 27 38.4 16.4 50 16.4C61.6 16.4 70.2 27 69.2 45C68.8 41 67.8 38.4 66.2 36.4C58 40 42 40 33.8 36.4C32.2 38.4 31.2 41 30.8 45Z', H));
        front.push(S('M40 21C44 18.4 52 17.4 59 19.4M37.6 32Q41 35.6 38.6 38.6M45.6 31.4Q48.4 35.4 46.4 39M54 31.4Q56.6 35.4 54.6 39.2M62 32Q58.8 35.6 61.6 38.6', D, 1));
        top = 14.6; break;
      case 'undercut':
        front.push(P('M33.4 46C32.6 34 35 28 38.4 26.4L38.4 36C36 38 34.6 41 34.4 46ZM66.6 46C67.4 34 65 28 61.6 26.4L61.6 36C64 38 65.4 41 65.6 46Z', c.buzz));
        front.push(P('M36.4 35C33.8 22 41.6 12.4 52.4 12.8C62.8 13.2 67 21.4 64 33.4C61 27.4 54.4 25 46.6 27C42 28.2 38.6 31 36.4 35Z', H));
        front.push(S('M40 22.4C44.4 17.8 52.6 16 60.4 19M46 26.6C50 23 56 22 61.6 24', D, 1.1));
        top = 12.6; break;
      case 'pixie':
        front.push(P('M32 47C29.8 31 37.6 17 50.6 17.2C64 17.4 70.6 28.6 68 47L66.8 47C66.4 43 65.6 39.6 64 37C58.6 40.6 49 39.8 40.6 37.2C38 36.4 36 38.4 35 41C34.6 43 34.4 45 34.4 47Z', H));
        front.push(P('M31.6 52C30.8 46 31.6 42 33.6 40.4L35.2 50.6ZM68.4 52C69.2 46 68.4 42 66.4 40.4L64.8 50.6Z', H));
        front.push(S('M41 22.6C46 18.8 55 18.6 61.4 23M40.4 36.8C45.6 36 52 35 58 33.4M48 20.4Q51 25 49 29', D, 1.05));
        top = 17.2; break;
      case 'locs': {
        const rope = 'M30 38C27 52 26.4 68 27 90M34 44C31.6 58 31.6 74 33 96M70 38C73 52 73.6 68 73 90M66 44C68.4 58 68.4 74 67 96M40 34C37 50 38 70 39.6 98M60 34C63 50 62 70 60.4 98';
        back.push(P('M29.6 46C28 27 37.6 16.4 50 16.4C62.4 16.4 72 27 70.4 46C70 60 71.6 74 74 92L26 92C28.4 74 30 60 29.6 46Z', c.hairDD));
        back.push(S(rope, H, 4.2));
        back.push(S(rope, D, 4.2, ' stroke-dasharray="1.2 2.2"'));
        front.push(P(sleek, H));
        front.push(S('M40 31C44 25 56 25 60 31M44.6 21.8C48 19.8 53 19.8 56.4 21.8', D, 1));
        front.push(S('M32.4 44C30.4 56 30 70 30.8 86M67.6 44C69.6 56 70 70 69.2 86', H, 3.8));
        front.push(S('M32.4 44C30.4 56 30 70 30.8 86M67.6 44C69.6 56 70 70 69.2 86', D, 3.8, ' stroke-dasharray="1.2 2.2"'));
        top = 16.4; break;
      }
      case 'manbun':
        if (!hat) {
          back.push(`<circle cx="50" cy="12.6" r="7.6" fill="${H}"/>`);
          back.push(S('M44.8 11.6C46 8.4 52.6 8 55 11.6M45.6 15.8C48.4 17.4 52.4 17 54.6 14.8', D, 1.05));
        }
        front.push(P('M33.4 46C32.6 34 35 28 38.4 26.4L38.4 36C36 38 34.6 41 34.4 46ZM66.6 46C67.4 34 65 28 61.6 26.4L61.6 36C64 38 65.4 41 65.6 46Z', c.buzz));
        front.push(P('M36 36C34.6 23 41 17.6 50 17.4C59 17.6 65.4 23 64 36C60.4 30 56 27 50 27C44 27 39.6 30 36 36Z', H));
        front.push(S('M41 25C45 21.4 55 21.4 59 25', D, 1));
        top = hat ? 17.4 : 5; break;
      case 'degarni':
        front.push(P('M32.4 50.4C31.2 42 31.8 36 34.6 31.6C36 34.2 36.2 38.6 35.4 42.4C35 45.2 34.8 47.8 34.6 50.4Z', H));
        front.push(P('M67.6 50.4C68.8 42 68.2 36 65.4 31.6C64 34.2 63.8 38.6 64.6 42.4C65 45.2 65.2 47.8 65.4 50.4Z', H));
        front.push(`<ellipse cx="44" cy="31" rx="5" ry="2.4" transform="rotate(-22 44 31)" fill="${c.skinL}"/>`);
        top = 25; break;
      case 'bebe':
        front.push(S('M48.4 27.4C46 22.2 50.6 19.2 53.8 21.6C55.6 23.2 53.8 25.6 51.8 24.4', H, 2.3));
        front.push(S('M45.6 27.8C45.8 25.6 46.8 24.2 48 23.6', H, 1.4));
        top = 20; break;
      default: // chauve
        front.push(`<ellipse cx="43.6" cy="31" rx="5" ry="2.4" transform="rotate(-22 43.6 31)" fill="${c.skinL}"/>`);
        top = 25;
    }
    return { back: back.join(''), front: front.join(''), top };
  }

  /* ---------- Yeux ---------- */
  // Formes décrites pour l’œil droit (coin externe vers +x), puis symétrisées.
  const EYE_FORMS = {
    amande: { o: [[-4.3, 0.5], [-2.7, -3.1], [2.4, -3.6], [4.6, -0.6], [2.9, 2.7], [-2.4, 3.2]], ir: [0.2, 0, 2.7], lid: 1.25 },
    ronds: { o: [[-3.7, 0.2], [-3.5, -4.7], [3.5, -4.7], [3.7, 0.2], [3.5, 4.5], [-3.5, 4.5]], ir: [0, 0.3, 2.6], lid: 1.1 },
    rieurs: { o: [[-4.3, 0.9], [-2.6, -3.2], [2.6, -3.4], [4.6, 0.3], [2.6, -0.8], [-2.4, -0.6]], ir: [0.1, -0.6, 2.5], lid: 1.3 },
    miclos: { o: [[-4.3, 0.5], [-2.6, -1.5], [2.6, -1.8], [4.6, -0.2], [2.9, 2.8], [-2.4, 3.1]], ir: [0.2, 0.7, 2.6], lid: 1.45 }
  };
  function eyes(st, c, cx, cy, sc, uid, dead, baby, fx) {
    let out = '', defs = '';
    const hl = [], pu = [];
    [-1, 1].forEach((s, i) => {
      const X = x => cx + s * (cx === 50 ? 0 : 0) + s * x * sc; // placeholder (remplacé ci-dessous)
      void X;
    });
    const centers = [[cx - 7.7, cy], [cx + 7.7, cy]];
    centers.forEach(([ex, ey], i) => {
      const s = i === 0 ? -1 : 1;
      const T = ([x, y]) => [ex + s * x * sc, ey + y * sc];
      if (dead) {
        const a = T([-4, 0.4]), m = T([0, 3]), b = T([4.2, 0.2]);
        out += S(`${M(a)}Q${f(m[0])} ${f(m[1])} ${f(b[0])} ${f(b[1])}`, c.lash, 1.3 * Math.min(sc, 1.15));
        return;
      }
      const F = EYE_FORMS[st] || EYE_FORMS.amande;
      const o = F.o.map(T);
      if (fx && fx.shadow) out += `<ellipse cx="${f(ex + s * 0.5 * sc)}" cy="${f(ey - 3 * sc)}" rx="${f(5 * sc)}" ry="${f(2.4 * sc)}" fill="${fx.shadow}" fill-opacity="${fx.so}"/>`;
      const d = `${M(o[0])}C${f(o[1][0])} ${f(o[1][1])} ${f(o[2][0])} ${f(o[2][1])} ${f(o[3][0])} ${f(o[3][1])}C${f(o[4][0])} ${f(o[4][1])} ${f(o[5][0])} ${f(o[5][1])} ${f(o[0][0])} ${f(o[0][1])}Z`;
      const id = `ava${uid}e${i}`;
      defs += `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
      const [ix, iy] = T([F.ir[0], F.ir[1]]);
      const ir = F.ir[2] * sc;
      out += `<g class="blk" style="animation-delay:-${((uid * 7) % 50) / 10}s" clip-path="url(#${id})">${P(d, c.white)}<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="${c.eye}"/><circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir * 0.5)}" fill="${c.pupil}"/></g>`;
      hl.push([ix + ir * 0.36, iy - ir * 0.38, ir * 0.3], [ix - ir * 0.36, iy + ir * 0.38, ir * 0.14]);
      // paupière supérieure
      const l0 = T([F.o[0][0] - 0.2, F.o[0][1] + 0.1]), l3 = T([F.o[3][0] + 0.5, F.o[3][1] - 0.3]);
      out += S(`${M(l0)}C${f(o[1][0])} ${f(o[1][1] - 0.15 * sc)} ${f(o[2][0])} ${f(o[2][1] - 0.15 * sc)} ${f(l3[0])} ${f(l3[1])}`, c.lash, F.lid * Math.min(sc, 1.15));
      if (fx && fx.lash) { const t0 = T([F.o[3][0] + 0.1, F.o[3][1] - 0.2]); out += S(`${M(t0)}l${f(s * 1.8 * sc)} ${f(-1.4 * sc)}`, c.lash, 0.95 * Math.min(sc, 1.15)); }
      if (st === 'miclos') out += S(`${M(T([-3.6, -2.2]))}C${f(T([-1.6, -4])[0])} ${f(T([-1.6, -4])[1])} ${f(T([2.6, -4.2])[0])} ${f(T([2.6, -4.2])[1])} ${f(T([4.4, -2.6])[0])} ${f(T([4.4, -2.6])[1])}`, c.skinD, 0.9);
      if (st === 'rieurs') out += S(`${M(T([-2.6, 2.4]))}Q${f(T([0.4, 3.6])[0])} ${f(T([0.4, 3.6])[1])} ${f(T([3.4, 2.2])[0])} ${f(T([3.4, 2.2])[1])}`, c.skinD, 0.9);
    });
    if (hl.length) out += `<path d="${hl.map(([x, y, r]) => dots([[x, y]], r)).join('')}" fill="#FFFFFF"/>`;
    return { defs, out };
  }

  /* ---------- Sourcils ---------- */
  const BROW_FORMS = {
    naturels: { p: [[-3.9, 0.6], [-0.4, -1.7], [4.3, 0.3]], w: 1.7 },
    arques: { p: [[-3.9, 0.9], [0.8, -2.8], [4.4, 0.9]], w: 1.35 },
    epais: { p: [[-3.9, 0.4], [-0.2, -1.5], [4.3, 0.2]], w: 2.7 },
    fins: { p: [[-3.8, 0.6], [0, -1.6], [4.2, 0.4]], w: 1.0 }
  };
  function brows(st, c, cx, cy, mood, dead, sc) {
    const F = BROW_FORMS[st] || BROW_FORMS.naturels;
    const tilt = dead ? 0 : mood < 34 ? 1 : 0; const lift = dead ? 0 : mood >= 67 ? -0.6 : 0;
    let d = '';
    [[cx - 8, -1], [cx + 8, 1]].forEach(([bx, s]) => {
      const pt = ([x, y]) => [bx + s * x * sc, cy + (y + lift + tilt * (x / 4.2) * 1.1) * sc];
      const a = pt(F.p[0]), m = pt(F.p[1]), b = pt(F.p[2]);
      d += `${M(a)}Q${f(m[0])} ${f(m[1])} ${f(b[0])} ${f(b[1])}`;
    });
    return S(d, c.brow, F.w * sc);
  }

  /* ---------- Nez ---------- */
  function noseArt(st, c, small) {
    if (small) return S('M48.6 53.4Q50 54.6 51.4 53.4', c.skinD, 1.3);
    const sh = ' stroke-opacity=".5"', nos = (a, b, r) => `<path d="${dots([[a, 53.7], [b, 53.7]], r)}" fill="${c.skinD}" fill-opacity=".7"/>`;
    const tip = `<ellipse cx="50" cy="52.1" rx="1.5" ry="1" fill="${c.skinL}" fill-opacity=".55"/>`;
    switch (st) {
      case 'fin': return S('M48.7 47.6Q48.1 50.8 48.6 52.4', c.skinD, 0.8, sh) + S('M48 53.1Q50 54.7 52 53.1', c.skinD, 1.2) + tip;
      case 'large': return S('M48.2 47.4Q46.9 51 47.1 52.8', c.skinD, 0.95, sh) + S('M46.7 53.4Q48.2 55 50 54.3Q51.8 55 53.3 53.4', c.skinD, 1.45) + nos(47.7, 52.3, 0.55) + tip;
      case 'retrousse': return S('M49.1 48.6Q48.7 50.8 49.2 51.8', c.skinD, 0.8, sh) + S('M47.9 52.4Q50 55.1 52.1 52.4', c.skinD, 1.3) + nos(48.3, 51.7, 0.5) + tip;
      case 'aquilin': return S('M48.8 46.6Q47.5 49.8 48.4 52.6', c.skinD, 1.05, sh) + S('M47.9 53.1Q50 55 52.1 53.1', c.skinD, 1.35) + `<ellipse cx="50" cy="52.4" rx="1.3" ry="0.9" fill="${c.skinL}" fill-opacity=".45"/>`;
      default: return S('M48.9 47.8Q48.3 51 48.5 52.6', c.skinD, 0.85, sh) + S('M47.8 53Q50 55 52.2 53', c.skinD, 1.4) + nos(48.2, 51.8, 0.45) + tip;
    }
  }

  /* ---------- Bouche et lèvres ---------- */
  function mouth(c, mood, dead, y, sc, lp, lipC, gap) {
    const X = x => f(50 + x * sc), Y = v => f(y + v * sc);
    if (dead) return S(`M${X(-3.4)} ${Y(0.6)}Q${X(0)} ${Y(1.3)} ${X(3.4)} ${Y(0.6)}`, c.lip, 1.4 * sc);
    const k = lp === 'fines' ? 0.6 : lp === 'pleines' ? 1.45 : 1, u = 0.5 + 0.55 * k, l = 0.6 + 0.95 * k;
    if (mood >= 67) {
      const up = P(`M${X(-5.1)} ${Y(-0.9)}Q${X(0)} ${Y(0.4 - 2 * u)} ${X(5.1)} ${Y(-0.9)}Q${X(0)} ${Y(0.4)} ${X(-5.1)} ${Y(-0.9)}Z`, lipC);
      const lo = P(`M${X(-4.7)} ${Y(1.8)}Q${X(0)} ${Y(7.4 + 1.8 * l)} ${X(4.7)} ${Y(1.8)}Q${X(0)} ${Y(7.4)} ${X(-4.7)} ${Y(1.8)}Z`, lipC);
      return lo + up
        + P(`M${X(-5)} ${Y(-0.9)}Q${X(0)} ${Y(0.4)} ${X(5)} ${Y(-0.9)}Q${X(4.4)} ${Y(4.6)} ${X(0)} ${Y(4.6)}Q${X(-4.4)} ${Y(4.6)} ${X(-5)} ${Y(-0.9)}Z`, c.mouth)
        + P(`M${X(-4)} ${Y(-0.2)}Q${X(0)} ${Y(0.9)} ${X(4)} ${Y(-0.2)}L${X(3.7)} ${Y(1.2)}Q${X(0)} ${Y(2.1)} ${X(-3.7)} ${Y(1.2)}Z`, c.white)
        + (gap ? P(`M${X(-1.7)} ${Y(-0.3)}L${X(-0.4)} ${Y(-0.1)}L${X(-0.4)} ${Y(1.5)}L${X(-1.7)} ${Y(1.4)}Z`, c.mouth) : '')
        + P(`M${X(-2.6)} ${Y(3.9)}Q${X(0)} ${Y(2.2)} ${X(2.6)} ${Y(3.9)}Q${X(0)} ${Y(4.7)} ${X(-2.6)} ${Y(3.9)}Z`, c.tongue);
    }
    const yc = mood >= 34 ? 0 : 2.4, cc = mood >= 34 ? 2.4 : -0.6;
    const line = `M${X(-4.2)} ${Y(yc)}Q${X(0)} ${Y(cc)} ${X(4.2)} ${Y(yc)}`;
    const crescent = (sh) => `M${X(-4.2)} ${Y(yc)}Q${X(0)} ${Y(cc + sh)} ${X(4.2)} ${Y(yc)}Q${X(0)} ${Y(cc)} ${X(-4.2)} ${Y(yc)}Z`;
    return P(crescent(-2 * u), lipC) + P(crescent(2 * l), lipC) + S(line, c.lip, 1.15 * sc);
  }

  /* ---------- Barbes ---------- */
  function beardArt(st, c) {
    switch (st) {
      case 'barbe':
        return P('M33.4 46.6C33.2 52.4 34.4 57.6 37 61.6C40.2 67 45 70.6 50 70.6C55 70.6 59.8 67 63 61.6C65.6 57.6 66.8 52.4 66.6 46.6L64.8 46.6C64.6 51.6 63 55.4 60.4 56.8C57.4 54.6 54 53.8 50 53.8C46 53.8 42.6 54.6 39.6 56.8C37 55.4 35.4 51.6 35.2 46.6Z', c.hair)
          + P('M45.6 58.2Q50 57.2 54.4 58.2Q54 61.6 50 61.8Q46 61.6 45.6 58.2Z', c.skinD);
      case 'barbe3j':
        return P('M33.6 47C33.6 52.4 34.8 57.4 37.2 61.2C40.4 66.2 45 69 50 69C55 69 59.6 66.2 62.8 61.2C65.2 57.4 66.4 52.4 66.4 47L65 47C64.6 51.8 63 55.2 60.6 56.6C57.6 54.8 54 54.2 50 54.2C46 54.2 42.4 54.8 39.4 56.6C37 55.2 35.4 51.8 35 47Z', c.stubble);
      case 'bouc':
        return P('M43.4 57.2C45 54.4 48.6 54.4 50 55.4C51.4 54.4 55 54.4 56.6 57.2C54.6 56.6 52 56.8 50 57.4C48 56.8 45.4 56.6 43.4 57.2ZM45.2 61.6C46.6 62.6 53.4 62.6 54.8 61.6C55 65.6 52.8 68.8 50 68.8C47.2 68.8 45 65.6 45.2 61.6Z', c.hair);
      case 'moustache':
        return P('M42.6 57.6C44 54.2 48.4 54 50 55.2C51.6 54 56 54.2 57.4 57.6C55.4 56.8 52.6 57 50 57.8C47.4 57 44.6 56.8 42.6 57.6Z', c.hair);
      case 'barbelongue':
        return P('M33.4 46.6C33.2 54 34.8 60.4 38 66C41 72 45.4 78 50 79.6C54.6 78 59 72 62 66C65.2 60.4 66.8 54 66.6 46.6L64.8 46.6C64.6 51.6 63 55.4 60.4 56.8C57.4 54.6 54 53.8 50 53.8C46 53.8 42.6 54.6 39.6 56.8C37 55.4 35.4 51.6 35.2 46.6Z', c.hair)
          + S('M40 64C42 70 46 75 50 77M60 64C58 70 54 75 50 77M50 66L50 76', c.hairD, 0.9)
          + P('M45.6 58.2Q50 57.2 54.4 58.2Q54 61.6 50 61.8Q46 61.6 45.6 58.2Z', c.skinD);
      case 'collier':
        return S('M34.4 47C34.8 56 38.2 63.8 44.4 66.6Q50 68.6 55.6 66.6C61.8 63.8 65.2 56 65.6 47', c.hair, 2.1)
          + P('M45.4 64.8Q50 63.6 54.6 64.8Q54 68.4 50 68.8Q46 68.4 45.4 64.8Z', c.hair);
      case 'favoris':
        return P('M33.4 39C33 45.6 33.4 52.4 35.4 58.4L38 56C37 51.6 36.8 46 37 40Z', c.hair)
          + P('M66.6 39C67 45.6 66.6 52.4 64.6 58.4L62 56C63 51.6 63.2 46 63 40Z', c.hair)
          + P('M42.6 57.6C44 54.2 48.4 54 50 55.2C51.6 54 56 54.2 57.4 57.6C55.4 56.8 52.6 57 50 57.8C47.4 57 44.6 56.8 42.6 57.6Z', c.hair);
      case 'goatee':
        return beardArt('bouc', c) + beardArt('moustache', c)
          + S('M43.6 58.4C41.6 60.6 41.6 64 44.6 66.4M56.4 58.4C58.4 60.6 58.4 64 55.4 66.4', c.hair, 1.5);
      default: return '';
    }
  }

  /* ---------- Vêtements ---------- */
  function topArt(top, c, A) {
    const w = A.neckW, by = A.bodyTop, nl = 50 - w, nr = 50 + w;
    const body = P(A.body, c.top);
    const neckRect = (bottom) => P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${bottom}`, c.skinD);
    const neckU = P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by + 1)}Q50 ${f(by + 6)} ${f(nl)} ${f(by + 1)}Z`, c.skinD);
    void neckRect;
    switch (top) {
      case 'grenouillere':
        return body + neckU
          + S(`M${f(nl - 2.6)} ${f(by + 0.6)}Q50 ${f(by + 8.6)} ${f(nr + 2.6)} ${f(by + 0.6)}`, c.topL, 2.6)
          + `<path d="${dots([[50, by + 11.4], [50, by + 15.6]], 0.9)}" fill="${c.topD}"/>`;
      case 'sweat':
        return body
          + P(`M${f(nl - 7.6)} ${f(by + 1.4)}C${f(nl - 6)} ${f(by - 4.4)} ${f(nr + 6)} ${f(by - 4.4)} ${f(nr + 7.6)} ${f(by + 1.4)}C${f(nr + 4)} ${f(by + 8.4)} ${f(nl - 4)} ${f(by + 8.4)} ${f(nl - 7.6)} ${f(by + 1.4)}Z`, c.topD)
          + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by + 0.6)}Q50 ${f(by + 5.2)} ${f(nl)} ${f(by + 0.6)}Z`, c.skinD)
          + S(`M${f(nl - 3.4)} ${f(by + 1.6)}Q50 ${f(by + 8.6)} ${f(nr + 3.4)} ${f(by + 1.6)}`, c.top, 2.2)
          + S(`M47 ${f(by + 6.2)}L46.4 ${f(by + 14)}M53 ${f(by + 6.2)}L53.6 ${f(by + 14)}`, c.cord, 1.2)
          + `<path d="${dots([[46.4, by + 14.6], [53.6, by + 14.6]], 0.95)}" fill="${c.cord}"/>`;
      case 'chemise':
        return body
          + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by)}L50 ${f(by + 8)}L${f(nl)} ${f(by)}Z`, c.skinD)
          + P(`M${f(nl - 0.8)} ${f(by - 2.2)}L50 ${f(by + 8.2)}L${f(46.2)} ${f(by + 10)}L${f(nl - 5.4)} ${f(by + 2.4)}ZM${f(nr + 0.8)} ${f(by - 2.2)}L50 ${f(by + 8.2)}L${f(53.8)} ${f(by + 10)}L${f(nr + 5.4)} ${f(by + 2.4)}Z`, c.topL)
          + S(`M50 ${f(by + 9)}L50 101`, c.topD, 0.9)
          + `<path d="${dots([[50, by + 13], [50, by + 18.4]], 0.75)}" fill="${c.topD}"/>`;
      case 'costume':
        return body
          + P(`M${f(nl - 1.6)} ${f(by - 1.4)}L${f(nr + 1.6)} ${f(by - 1.4)}L50 ${f(by + 22)}Z`, c.shirt)
          + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by - 0.4)}L50 ${f(by + 5)}L${f(nl)} ${f(by - 0.4)}Z`, c.skinD)
          + P(`M${f(nl - 1)} ${f(by - 2)}L50 ${f(by + 5.2)}L46.8 ${f(by + 7)}L${f(nl - 3.6)} ${f(by + 1.6)}ZM${f(nr + 1)} ${f(by - 2)}L50 ${f(by + 5.2)}L53.2 ${f(by + 7)}L${f(nr + 3.6)} ${f(by + 1.6)}Z`, c.shirtD)
          + P(`M48.3 ${f(by + 5)}L51.7 ${f(by + 5)}L51.1 ${f(by + 7.8)}L48.9 ${f(by + 7.8)}ZM48.9 ${f(by + 8.4)}L51.1 ${f(by + 8.4)}L52.5 ${f(by + 19.6)}L50 ${f(by + 22.4)}L47.5 ${f(by + 19.6)}Z`, c.tie)
          + P(`M${f(nl - 2.4)} ${f(by - 1)}L${f(48)} ${f(by + 21)}L${f(43.6)} ${f(by + 14.4)}L${f(nl - 6.6)} ${f(by + 4.4)}ZM${f(nr + 2.4)} ${f(by - 1)}L${f(52)} ${f(by + 21)}L${f(56.4)} ${f(by + 14.4)}L${f(nr + 6.6)} ${f(by + 4.4)}Z`, c.topD);
      case 'robe':
        return body
          + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by + 2)}L${f(nl)} ${f(by + 2)}Z`, c.skinD)
          + P(`M${f(nl - 8.6)} ${f(by + 1.2)}C${f(nl - 4)} ${f(by - 0.8)} ${f(nr + 4)} ${f(by - 0.8)} ${f(nr + 8.6)} ${f(by + 1.2)}C${f(nr + 5.6)} ${f(by + 10.6)} ${f(nl - 5.6)} ${f(by + 10.6)} ${f(nl - 8.6)} ${f(by + 1.2)}Z`, c.skin)
          + S(`M${f(nl - 8.4)} ${f(by + 1.6)}C${f(nl - 5.4)} ${f(by + 10.4)} ${f(nr + 5.4)} ${f(by + 10.4)} ${f(nr + 8.4)} ${f(by + 1.6)}`, c.topD, 1.4);
      case 'polo':
        return body + neckU
          + P(`M${f(nl - 1)} ${f(by - 1.6)}L${f(nl + 3.2)} ${f(by + 1.4)}L50 ${f(by + 5.6)}L${f(nl - 5.8)} ${f(by + 3.4)}ZM${f(nr + 1)} ${f(by - 1.6)}L${f(nr - 3.2)} ${f(by + 1.4)}L50 ${f(by + 5.6)}L${f(nr + 5.8)} ${f(by + 3.4)}Z`, c.topL)
          + S(`M50 ${f(by + 4.6)}L50 ${f(by + 15)}`, c.topD, 0.9)
          + `<path d="${dots([[50, by + 8], [50, by + 12]], 0.7)}" fill="${c.topD}"/>`;
      case 'veste':
        return body
          + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by - 0.4)}L50 ${f(by + 6)}L${f(nl)} ${f(by - 0.4)}Z`, c.skinD)
          + P(`M${f(nl + 1)} ${f(by - 1)}L50 ${f(by + 3)}L${f(nr - 1)} ${f(by - 1)}L50 101L${f(nl + 1)} 101Z`.replace(/L50 101L\S+ 101Z/, 'L56 101L44 101Z'), c.shirt)
          + P(`M${f(nl - 2.4)} ${f(by - 1.6)}L47 ${f(by + 3.6)}L43.4 101L${f(nl - 7)} 101ZM${f(nr + 2.4)} ${f(by - 1.6)}L53 ${f(by + 3.6)}L56.6 101L${f(nr + 7)} 101Z`, c.topD)
          + S(`M${f(nl - 2.4)} ${f(by - 1.6)}L47 ${f(by + 3.6)}M${f(nr + 2.4)} ${f(by - 1.6)}L53 ${f(by + 3.6)}`, c.topL, 1.1);
      case 'debardeur': {
        const sk = P(A.body, c.skin) + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by + 2)}L${f(nl)} ${f(by + 2)}Z`, c.skinD);
        return sk
          + P(`M${f(nl - 9)} 101L${f(nl - 9.4)} ${f(by + 10)}Q${f(nl - 6.4)} ${f(by + 3)} ${f(nl - 3.2)} ${f(by + 0.6)}Q50 ${f(by + 10.6)} ${f(nr + 3.2)} ${f(by + 0.6)}Q${f(nr + 6.4)} ${f(by + 3)} ${f(nr + 9.4)} ${f(by + 10)}L${f(nr + 9)} 101Z`, c.top)
          + S(`M${f(nl - 3.2)} ${f(by + 0.6)}Q50 ${f(by + 10.6)} ${f(nr + 3.2)} ${f(by + 0.6)}`, c.topD, 1.4);
      }
      case 'blouse':
        return P(A.body, c.shirt)
          + P(`M${f(nl)} 54L${f(nr)} 54L${f(nr)} ${f(by - 0.4)}L50 ${f(by + 9)}L${f(nl)} ${f(by - 0.4)}Z`, c.skinD)
          + P(`M${f(nl + 1.4)} ${f(by + 1)}L50 ${f(by + 9.6)}L${f(nr - 1.4)} ${f(by + 1)}L50 101Z`, c.top)
          + P(`M${f(nl - 2.4)} ${f(by - 1.6)}L50 ${f(by + 10.4)}L45.6 ${f(by + 12.4)}L${f(nl - 7.4)} ${f(by + 3)}ZM${f(nr + 2.4)} ${f(by - 1.6)}L50 ${f(by + 10.4)}L54.4 ${f(by + 12.4)}L${f(nr + 7.4)} ${f(by + 3)}Z`, c.shirtD)
          + S(`M50 ${f(by + 11)}L50 101M${f(nl - 6)} ${f(by + 15)}L${f(nl - 6)} 101`, c.shirtD, 0.9)
          + `<path d="${dots([[56, by + 16], [56, by + 21]], 0.7)}" fill="${c.shirtD}"/>`;
      case 'pull': {
        const t0 = A.chin - 2.4, t1 = by + 2.6;
        return body
          + P(`M${f(nl - 1.4)} ${f(t0)}L${f(nr + 1.4)} ${f(t0)}L${f(nr + 2)} ${f(t1)}Q50 ${f(t1 + 2.6)} ${f(nl - 2)} ${f(t1)}Z`, c.topL)
          + P(`M${f(nl - 1.6)} ${f(t0 + 2.4)}Q50 ${f(t0 + 5)} ${f(nr + 1.6)} ${f(t0 + 2.4)}L${f(nr + 1.9)} ${f(t0 + 7.2)}Q50 ${f(t0 + 9.8)} ${f(nl - 1.9)} ${f(t0 + 7.2)}Z`, c.top)
          + S(`M${f(nl + 2)} ${f(t0 + 10)}L${f(nl + 1.8)} ${f(t1 - 1)}M50 ${f(t0 + 10.6)}L50 ${f(t1 + 0.4)}M${f(nr - 2)} ${f(t0 + 10)}L${f(nr - 1.8)} ${f(t1 - 1)}`, c.topD, 0.8);
      }
      default: // tshirt
        return body + neckU + S(`M${f(nl - 1.4)} ${f(by + 0.6)}Q50 ${f(by + 7.6)} ${f(nr + 1.4)} ${f(by + 0.6)}`, c.topD, 2);
    }
  }

  /* ---------- Accessoires ---------- */
  function accArt(acc, c, top) {
    switch (acc) {
      case 'casquette':
        return P('M31 36.8C29.6 22 38.8 13.8 50 13.8C61.2 13.8 70.4 22 69 36.8C61 34.4 39 34.4 31 36.8Z', c.acc)
          + S('M50 14.2C48.6 20 48.2 27.4 48.8 34.4', c.accD, 0.9)
          + `<circle cx="50" cy="14.4" r="1.6" fill="${c.accD}"/>`
          + P('M29 36.6C38 31.8 62 31.8 71 36.6C72.4 39.2 70.2 40.8 67.2 40C58.6 37.4 41.4 37.4 32.8 40C29.8 40.8 27.6 39.2 29 36.6Z', c.accD);
      case 'bonnet':
        return P('M30.8 38.6C29.2 21 38.6 13 50 13C61.4 13 70.8 21 69.2 38.6Z', c.acc)
          + P('M29.8 32C40 29.2 60 29.2 70.2 32L70.4 38.6C60 35.8 40 35.8 29.6 38.6Z', c.accD)
          + S('M35 31.4L35 37M40.6 30.6L40.6 36.2M46.2 30.2L46.2 35.8M53.8 30.2L53.8 35.8M59.4 30.6L59.4 36.2M65 31.4L65 37', c.acc, 0.8)
          + `<circle cx="50" cy="11.6" r="4.8" fill="${c.accL}"/>`;
      case 'bandeau':
        return S('M31.8 37.4C33.4 22.6 66.6 22.6 68.2 37.4', c.acc, 3.4)
          + S('M33.6 31.6C38 25.6 62 25.6 66.4 31.6', c.accL, 0.8);
      case 'fleur': {
        const cx = 36.4, cy = Math.max(top + 7.2, 24.6);
        const pet = [0, 72, 144, 216, 288].map(a => { const r = a * Math.PI / 180; return [cx + 2.7 * Math.cos(r - 1.57), cy + 2.7 * Math.sin(r - 1.57)]; });
        return `<path d="${dots(pet, 2.5)}" fill="${c.petal}"/><circle cx="${cx}" cy="${f(cy)}" r="1.7" fill="${c.gold}"/>`;
      }
      case 'boucles':
        return S('M33.2 51.6a2.2 2.2 0 1 0 0.01 0M66.8 51.6a2.2 2.2 0 1 0 0.01 0', c.gold, 1.1);
      case 'piercing':
        return `<circle cx="46.8" cy="53.7" r="0.8" fill="${c.gold}"/>` + S('M33.2 51.6a2.2 2.2 0 1 0 0.01 0', c.gold, 1.1);
      case 'chapeau':
        return P('M32.2 34C32 22.4 40 16.2 50 16.2C60 16.2 68 22.4 67.8 34Z', c.acc)
          + S('M40 17.4C44 22 56 22 60 17.4', c.accD, 0.9)
          + P('M31.8 30.4L68.2 30.4L68.2 34.2C58 32.8 42 32.8 31.8 34.2Z', c.accD)
          + P('M21 36.4C21 33.8 35 31.8 50 31.8C65 31.8 79 33.8 79 36.4C79 39.6 65 40.4 50 40.4C35 40.4 21 39.6 21 36.4Z', c.acc)
          + S('M24 36.6C34 38.2 66 38.2 76 36.6', c.accL, 0.8, ' stroke-opacity=".5"');
      case 'bandana':
        return P('M31.4 37C31.6 26.6 40 21 50 21C60 21 68.4 26.6 68.6 37C60 33 40 33 31.4 37Z', c.acc)
          + `<path d="${dots([[38, 29.4], [44.4, 26.2], [51.4, 25.2], [58.4, 26.8], [63.4, 30.4], [41, 33.2], [50, 30.4], [59, 32.4]], 0.9)}" fill="${c.accL}" fill-opacity=".85"/>`
          + P('M67.4 31.4L75 27.2L73.6 34L76.6 39.6L68.4 37Z', c.accD);
      case 'voile':
        return `<path fill-rule="evenodd" d="M27.4 60C26 38 33.6 19.6 50 19.6C66.4 19.6 74 38 72.6 60C72.4 66.6 70 71.4 65 75.6L35 75.6C30 71.4 27.6 66.6 27.4 60ZM35.6 45C35.6 35.4 41.4 30.4 50 30.4C58.6 30.4 64.4 35.4 64.4 45C64.4 54.6 59.6 62 50 62.6C40.4 62 35.6 54.6 35.6 45Z" fill="${c.acc}"/>`
          + S('M33.4 40C32 52 34 64 39 72M66.6 40C68 52 66 64 61 72', c.accD, 0.9, ' stroke-opacity=".7"')
          + S('M38 24C44 20.8 56 20.8 62 24', c.accL, 1.2, ' stroke-opacity=".6"')
          + S('M35.8 44.6C36 36.6 41 31.4 50 31.2C59 31.4 64 36.6 64.2 44.6', c.accD, 0.9, ' stroke-opacity=".55"');
      default: return '';
    }
  }

  function glassesArt(g, c) {
    const L = [42.3, 46.6], R = [57.7, 46.6];
    switch (g) {
      case 'rondes':
        return `<g fill="none" stroke="${c.frame}" stroke-width="1.25"><circle cx="${L[0]}" cy="${L[1]}" r="5.3" fill="${c.lens}"/><circle cx="${R[0]}" cy="${R[1]}" r="5.3" fill="${c.lens}"/><path d="M47.6 46.2Q50 44.8 52.4 46.2M37 45.6L33.6 44.6M63 45.6L66.4 44.6"/></g>`;
      case 'carrees':
        return `<g fill="none" stroke="${c.frame}" stroke-width="1.6" stroke-linejoin="round"><rect x="36.4" y="42.4" width="11.6" height="8.6" rx="2.2" fill="${c.lens}"/><rect x="52" y="42.4" width="11.6" height="8.6" rx="2.2" fill="${c.lens}"/><path d="M48 45.6Q50 44.4 52 45.6M36.4 44.6L33.6 44M63.6 44.6L66.4 44"/></g>`;
      case 'solaires':
        return P('M36 43.4C36 42.6 36.6 42.2 37.4 42.2L47.2 42.2C48 42.2 48.4 42.8 48.3 43.6L47.6 48.6C47.1 51 45.4 52 43.2 52L41.4 52C38.6 52 36.8 50.8 36.3 48.4ZM64 43.4C64 42.6 63.4 42.2 62.6 42.2L52.8 42.2C52 42.2 51.6 42.8 51.7 43.6L52.4 48.6C52.9 51 54.6 52 56.8 52L58.6 52C61.4 52 63.2 50.8 63.7 48.4Z', c.shade)
          + S('M48.3 44Q50 43 51.7 44M36.2 43.6L33.6 43.2M63.8 43.6L66.4 43.2', c.shade, 1.3)
          + S('M38.6 44.4L41.4 44.4M54.4 44.4L57.2 44.4', '#FFFFFF', 1, ' stroke-opacity=".55"');
      case 'aviateur':
        return `<g fill="${c.lens}" fill-opacity=".28" stroke="#C9A44A" stroke-width="1.15"><path d="M35.8 44.2C35.8 42.6 37.2 42 38.8 42L46.2 42C47.8 42 48.4 42.8 48.2 44.4C47.8 49.4 45 52.8 41.6 52.6C38.4 52.4 35.8 48.6 35.8 44.2Z"/><path d="M64.2 44.2C64.2 42.6 62.8 42 61.2 42L53.8 42C52.2 42 51.6 42.8 51.8 44.4C52.2 49.4 55 52.8 58.4 52.6C61.6 52.4 64.2 48.6 64.2 44.2Z"/></g>`
          + S('M48.2 43.8Q50 42.8 51.8 43.8M48.6 45.6Q50 44.8 51.4 45.6M35.8 43.6L33.6 43M64.2 43.6L66.4 43', '#C9A44A', 1);
      case 'chat':
        return `<g fill="${c.lens}" fill-opacity=".3" stroke="${c.frame}" stroke-width="1.5" stroke-linejoin="round"><path d="M34.6 41.4L46.6 43.2C48 43.4 48.4 44.6 48.2 46C47.8 49.8 45.6 52 42.6 52C39 52 36 49.4 35.8 45.8Z"/><path d="M65.4 41.4L53.4 43.2C52 43.4 51.6 44.6 51.8 46C52.2 49.8 54.4 52 57.4 52C61 52 64 49.4 64.2 45.8Z"/></g>`
          + S('M48.2 44.4Q50 43.4 51.8 44.4M34.6 41.4L33.2 40.4M65.4 41.4L66.8 40.4', c.frame, 1.3);
      case 'demi':
        return S('M36.4 45Q36.6 42.4 40 42.4L45.4 42.4Q47.8 42.4 48 44.6M52 44.6Q52.2 42.4 54.6 42.4L60 42.4Q63.4 42.4 63.6 45M48 43.8Q50 42.8 52 43.8M36.4 44.4L33.6 43.8M63.6 44.4L66.4 43.8', c.frame, 1.4)
          + `<path d="M37 45.4Q37.4 50.8 42.2 51Q46.4 50.8 47.4 45.4ZM63 45.4Q62.6 50.8 57.8 51Q53.6 50.8 52.6 45.4Z" fill="${c.lens}" fill-opacity=".22"/>`;
      default: return '';
    }
  }

  /* ---------- Forme du visage ---------- */
  function facePath(shape, A, baby, kid) {
    if (baby || kid || shape === 'ovale') return A.face;
    const cy = A.chinY;
    switch (shape) {
      case 'rond': return `M32.4 44C32.4 31 40 25 50 25C60 25 67.6 31 67.6 44C67.6 56.6 61.4 ${f(cy - 0.6)} 50 ${f(cy - 0.6)}C38.6 ${f(cy - 0.6)} 32.4 56.6 32.4 44Z`;
      case 'carre': return `M33 44C33 31 40.5 25 50 25C59.5 25 67 31 67 44C67 53 66.4 59.4 62 63.2C58.6 ${f(cy + 0.4)} 54.4 ${f(cy + 0.6)} 50 ${f(cy + 0.6)}C45.6 ${f(cy + 0.6)} 41.4 ${f(cy + 0.4)} 38 63.2C33.6 59.4 33 53 33 44Z`;
      case 'long': return `M33.6 43C33.6 30 40.8 25 50 25C59.2 25 66.4 30 66.4 43C66.4 56 60.4 ${f(cy + 2.3)} 50 ${f(cy + 2.3)}C39.6 ${f(cy + 2.3)} 33.6 56 33.6 43Z`;
      case 'coeur': return `M32.4 43C32.4 30.6 40.2 25 50 25C59.8 25 67.6 30.6 67.6 43C67.6 52 62.6 58.6 55.6 63.2C53 ${f(cy - 0.2)} 51.6 ${f(cy + 0.7)} 50 ${f(cy + 0.7)}C48.4 ${f(cy + 0.7)} 47 ${f(cy - 0.2)} 44.4 63.2C37.4 58.6 32.4 52 32.4 43Z`;
      default: return A.face;
    }
  }

  /* ---------- Enfants : proportions qui évoluent de 3 à 12 ans ---------- */
  function kidGeom(age) {
    const t = Math.max(0, Math.min(1, (age - 3) / 9)), L = 24 - 6 * t, R = 100 - L;
    const by = 83.6 - 2.8 * t;
    const body = `M${f(L)} 101C${f(L + 0.6)} ${f(92 - 2 * t)} ${f(31.4 - 4.4 * t)} ${f(85.4 - 2.8 * t)} ${f(41 - 2 * t)} ${f(84.2 - 2.8 * t)}Q50 ${f(83.4 - 3 * t)} ${f(59 + 2 * t)} ${f(84.2 - 2.8 * t)}C${f(68.6 + 4.4 * t)} ${f(85.4 - 2.8 * t)} ${f(R - 0.6)} ${f(92 - 2 * t)} ${f(R)} 101Z`;
    const hw = 18.4 - 1.0 * t, x0 = 50 - hw, x1 = 50 + hw;
    const face = `M${f(x0)} 45C${f(x0)} 31 39.8 25.4 50 25.4C60.2 25.4 ${f(x1)} 31 ${f(x1)} 45C${f(x1)} ${f(57.6 + 0.4 * t)} 60.8 65 50 65C39.2 65 ${f(x0)} ${f(57.6 + 0.4 * t)} ${f(x0)} 45Z`;
    return { s: 1.2 - 0.12 * t, dy: 4.6 - 2.2 * t, neckW: 5.4 + 0.4 * t, bodyTop: by, body, face, chinY: 65, eyeSc: 1.26 - 0.16 * t, eyeY: 48.2 - 0.8 * t };
  }

  /* ---------- Rendu ---------- */
  function render(look, opts) {
    opts = opts || {};
    const g = opts.gender === 'F' ? 'F' : 'H';
    const lk = normalize(look, g);
    const ageN = opts.age == null || opts.age === '' ? NaN : Number(opts.age);
    const age = Number.isFinite(ageN) ? Math.max(0, ageN) : 30;
    const moodN = opts.mood == null ? NaN : Number(opts.mood);
    const mood = Number.isFinite(moodN) ? moodN : 60;
    const dead = !!opts.dead;
    const baby = age < 3, kid = age < 13, teen = !kid && age < 18, senior = age >= 60, elder = age >= 75;
    const uid = ++UID;

    /* --- style effectif selon l’âge --- */
    let hair = lk.hair;
    if (baby) hair = 'bebe';
    else if (g === 'H' && has(['court', 'meche', 'rase', 'undercut', 'pixie', 'manbun'], hair) && ((elder && lk.seed % 10 < 6) || (age >= 50 && lk.seed % 10 < 3))) hair = 'degarni';
    const beard = age >= 16 ? lk.beard : 'aucune';
    let glasses = lk.glasses;
    if (opts.glasses && glasses === 'aucune') glasses = 'rondes';
    if (baby) glasses = 'aucune';
    let acc = lk.acc;
    if (baby && !has(['bonnet', 'bandeau', 'fleur'], acc)) acc = 'aucun';
    const hat = acc === 'casquette' || acc === 'bonnet' || acc === 'chapeau';
    const top = baby ? 'grenouillere' : lk.top;

    /* --- couleurs --- */
    const k = dead ? gray : (x => x);
    const sk = SKINS[lk.skin];
    let hcBase = HAIR_COLORS[lk.hc];
    if (lk.hc <= 7) {
      if (elder) hcBase = mix(hcBase, '#F1EEEA', 0.86);
      else if (senior) hcBase = mix(hcBase, '#B9B6B1', 0.58);
      else if (age >= 50) hcBase = mix(hcBase, '#B9B6B1', 0.22);
      else if (age >= 40) hcBase = mix(hcBase, '#B9B6B1', 0.08);
    }
    const hairD = mix(mul(hcBase, '#C9B7AE'), '#1b1210', lum(hcBase) < 0.2 ? 0.25 : 0.08);
    const darkSkin = lum(sk) < 0.45;
    const tc = TOP_COLORS[lk.topc];
    const accC = TOP_COLORS[[7, 4, 0, 1, 1, 0, 3, 1, 3, 0][lk.topc]];
    const c = {
      skin: k(sk), skinD: k(mul(sk, '#E8BCA8')), skinL: k(mix(sk, '#FFFFFF', 0.28)),
      hair: k(hcBase), hairD: k(hairD), hairDD: k(mix(hairD, '#000000', 0.18)), hairL: k(mix(hcBase, '#FFFFFF', 0.2)),
      buzz: k(mix(hcBase, sk, 0.28)), buzzL: k(mix(hcBase, sk, 0.5)),
      stubble: k(mix(sk, hcBase, lum(hcBase) > 0.55 ? 0.45 : 0.32)),
      brow: k(lk.hc >= 8 ? mix(hcBase, '#3A2A24', 0.65) : lk.hc === 6 ? mix(hcBase, '#7A6650', 0.55) : mix(hcBase, '#120a08', lum(hcBase) > 0.45 ? 0.3 : 0.12)),
      eye: k(EYE_COLORS[lk.eye]), pupil: k('#1C1412'), white: k('#FFFDF8'), lash: k(darkSkin ? '#1A100C' : '#2B1D19'),
      lip: k(mix(mul(sk, '#C99486'), '#5A1E1E', darkSkin ? 0.25 : 0.45)), mouth: k('#6A2A2C'), tongue: k('#E58A82'),
      blush: k('#F0857A'),
      top: k(tc), topD: k(mul(tc, '#CDBFB8')), topL: k(mix(tc, '#FFFFFF', 0.32)),
      shirt: k('#F7F3EC'), shirtD: k('#E4DDD2'), tie: k(TOP_COLORS[[7, 4, 7, 7, 7, 4, 4, 1, 7, 7][lk.topc]]),
      cord: k('#F6F1E8'),
      acc: k(accC), accD: k(mul(accC, '#CDBFB8')), accL: k(mix(accC, '#FFFFFF', 0.35)), tie2: k(accC),
      gold: k('#E2AE3E'), petal: k('#F4A3B5'), frame: k('#2E2420'), lens: k('#FFFFFF'), shade: k('#26232C'),
      bg: k(BG_COLORS[lk.bg])
    };
    const mk = lk.makeup;
    const lipMap = { naturel: '#C9776F', rouge: '#B3262E', rose: '#E0708F', prune: '#74305C', smoky: '#8A3A40' };
    c.lipF = k(mk === 'naturel' ? mix(sk, lipMap.naturel, 0.55) : lipMap[mk] || mix(sk, mix(mul(sk, '#C99486'), '#5A1E1E', darkSkin ? 0.25 : 0.45), 0.5));
    const shadowMap = { naturel: '#B58E7A', rose: '#E88FB0', prune: '#7C4B8C', smoky: '#3B2F38' };
    const fx = baby || kid ? null : { lash: g === 'F' || mk === 'smoky', shadow: shadowMap[mk] ? k(shadowMap[mk]) : null, so: mk === 'smoky' ? 0.55 : mk === 'naturel' ? 0.3 : 0.42 };
    c.tie = lk.top === 'costume' ? c.tie : c.tie;
    if (hair === 'queue') c.tie = c.acc;

    /* --- géométrie selon l’âge --- */
    const A = baby
      ? { s: 1.2, dy: 5.4, neckW: 5.2, bodyTop: 84.6, body: 'M22 101C22.6 92 30.6 86 41 85Q50 84.2 59 85C69.4 86 77.4 92 78 101Z', face: 'M31.6 46C31.6 32.5 40 26.4 50 26.4C60 26.4 68.4 32.5 68.4 46C68.4 57.6 60.6 64.6 50 64.6C39.4 64.6 31.6 57.6 31.6 46Z', chinY: 64.6 }
      : kid
        ? kidGeom(age)
        : teen
          ? { s: 1.02, dy: 0.8, neckW: 6.2, bodyTop: 79, body: 'M14 101C14.6 89 23.4 81 37 79.6Q50 78.4 63 79.6C76.6 81 85.4 89 86 101Z', face: 'M33 44.4C33 31 40.6 25 50 25C59.4 25 67 31 67 44.4C67 56 60 65.4 50 65.4C40 65.4 33 56 33 44.4Z', chinY: 65.4 }
          : { s: 1, dy: 0, neckW: 6.6, bodyTop: 78.2, body: 'M10 101C10.6 88.6 20.4 80.6 36 79Q50 77.6 64 79C79.6 80.6 89.4 88.6 90 101Z', face: 'M33 44C33 31 40.5 25 50 25C59.5 25 67 31 67 44C67 55.6 60 65.5 50 65.5C40 65.5 33 55.6 33 44Z', chinY: 65.5 };
    A.chin = 45 + (A.chinY - 45) * A.s + A.dy;
    const headT = A.s === 1 && A.dy === 0 ? '' : ` transform="matrix(${A.s} 0 0 ${A.s} ${f(50 - 50 * A.s)} ${f(45 - 45 * A.s + A.dy)})"`;

    /* --- traits --- */
    const eyeY = baby ? 48.4 : kid ? A.eyeY : 46.6;
    const eyeSc = baby ? 1.18 : kid ? A.eyeSc : teen ? 1.04 : 1;
    const eyeStyle = baby ? 'ronds' : lk.eyes;
    const ey = eyes(eyeStyle, c, 50, eyeY, eyeSc, uid, dead, baby, fx);
    const H = acc === 'voile' && !baby ? { back: '', front: '', top: 17 } : hairArt(hair, c, hat);
    const clipId = `ava${uid}c`;

    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="avsvg${dead ? ' dead' : ''}" aria-hidden="true" focusable="false">`;
    s += `<defs><clipPath id="${clipId}"><circle cx="50" cy="50" r="50"/></clipPath><radialGradient id="ava${uid}g" cx=".4" cy=".34" r=".78"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".2"/><stop offset=".55" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="${c.skinD}" stop-opacity=".5"/></radialGradient>${ey.defs}</defs>`;
    s += `<g clip-path="url(#${clipId})">`;
    if (opts.bg !== false) s += `<circle cx="50" cy="50" r="50" fill="${c.bg}"/>`;
    // cheveux arrière
    if (H.back) s += `<g${headT}>${H.back}</g>`;
    // corps
    s += topArt(top, c, A);
    if (acc === 'voile' && !baby) s += P('M24.6 66C22.6 40 32 17.4 50 17.4C68 17.4 77.4 40 75.4 66C75 77 80 88 92 101L8 101C20 88 25 77 24.6 66Z', c.acc) + S('M30 70C28 82 22 92 14 101M70 70C72 82 78 92 86 101', c.accD, 0.9, ' stroke-opacity=".6"');
    // tête
    s += `<g${headT}>`;
    s += `<path d="M33.6 42.8C30.4 42.4 29.6 45.4 30.2 48.2C30.8 51 32.6 52.6 34.6 52ZM66.4 42.8C69.6 42.4 70.4 45.4 69.8 48.2C69.2 51 67.4 52.6 65.4 52Z" fill="${c.skin}"/>`;
    s += S('M32.6 45.4Q31.6 47.4 33.2 49.6M67.4 45.4Q68.4 47.4 66.8 49.6', c.skinD, 0.9);
    const FP = facePath(lk.face, A, baby, kid);
    s += P(FP, c.skin);
    s += P(FP, `url(#ava${uid}g)`);
    // rides (de plus en plus marquées avec l’âge)
    if (!baby && !kid) {
      const so = o => ` stroke-opacity="${o}"`;
      if (age >= 35) s += S('M44.4 54.4Q42.6 57.2 44 60.2M55.6 54.4Q57.4 57.2 56 60.2', c.skinD, 0.75, so(age >= 60 ? 0.9 : age >= 45 ? 0.55 : 0.28));
      if (age >= 50) s += S('M35.4 45.4L33.8 44.6M35.4 47.4L33.8 48.2M64.6 45.4L66.2 44.6M64.6 47.4L66.2 48.2', c.skinD, 0.75, so(age >= 65 ? 0.9 : 0.5));
      if (age >= 55) s += S('M43 33.8Q50 32.8 57 33.8', c.skinD, 0.75, so(age >= 70 ? 0.9 : 0.5));
      if (age >= 72) s += S('M44.4 31.2Q50 30.4 55.6 31.2', c.skinD, 0.7, so(0.7));
      if (age >= 62) s += S('M39.6 50.6Q42.3 51.8 45 50.6M55 50.6Q57.7 51.8 60.4 50.6', c.skinD, 0.75, so(0.7));
    }
    // joues
    if (!dead) {
      const bo = baby ? 0.5 : kid ? 0.38 : mood >= 67 ? 0.26 : 0.16;
      const bry = baby ? 53.2 : kid ? 53 : 53.2;
      s += `<path d="${dots([[38.8, bry], [61.2, bry]], baby ? 3.6 : 3.2)}" fill="${c.blush}" fill-opacity="${bo}"/>`;
    }
    if (lk.freckles && !baby) s += `<path d="${dots([[38.4, 51.4], [40.8, 52.6], [37.6, 53.6], [40, 54.6], [42.6, 51.4], [61.6, 51.4], [59.2, 52.6], [62.4, 53.6], [60, 54.6], [57.4, 51.4], [48.6, 51.6], [51.4, 51.6]], 0.55)}" fill="${c.skinD}"/>`;
    // barbe (sous le nez et la bouche)
    s += beardArt(beard, c);
    // nez
    s += noseArt(lk.nose, c, baby || kid);
    // bouche
    s += mouth(c, mood, dead, baby ? 58.4 : kid ? 58.6 : 58.6, baby ? 0.85 : 1, baby || kid ? 'moyennes' : lk.lips, c.lipF, kid && age >= 6 && age <= 9 && lk.seed % 3 !== 0);
    if (baby && age < 2 && mood < 67 && !dead) s += `<ellipse cx="50" cy="59.6" rx="5.6" ry="3.8" fill="#F58FB8"/><ellipse cx="48.4" cy="58.4" rx="2.2" ry="1.1" fill="#FFFFFF" fill-opacity=".5"/><circle cx="50" cy="59.6" r="1.25" fill="#FFFFFF"/><circle cx="50" cy="64.8" r="2.5" fill="none" stroke="#F58FB8" stroke-width="1.2"/>`;
    // yeux & sourcils
    s += ey.out;
    if (!baby) s += brows(lk.brows, c, 50, eyeY - 6.4 - (kid ? 0.4 : 0), mood, dead, kid ? 0.95 : 1);
    else s += S('M39 41.6Q42 40.4 45 41.2M55 41.2Q58 40.4 61 41.6', c.brow, 0.9, ' stroke-opacity=".45"');
    if (!baby && !dead) {
      if (lk.mark === 'grain') s += `<circle cx="57.6" cy="56.4" r="0.8" fill="${c.hairD}"/>`;
      if (lk.mark === 'cicatrice') s += S('M58.6 36.8L62 44', k('#D59A8E'), 1.05) + S('M58.2 39.2L60.6 38.2M59.2 41.4L61.8 40.4M60 43.2L62.4 42.2', k('#D59A8E'), 0.6);
      if (lk.mark === 'acne' && age >= 11 && age <= 26) s += `<path d="${dots([[40, 50.4], [59.4, 49.8], [37.8, 55.6], [62, 55], [45.2, 38], [56, 36.4], [50.6, 34.6], [41.6, 36.8], [47, 56.4]], 0.65)}" fill="${k('#D9776C')}" fill-opacity=".75"/>`;
    }
    // cheveux avant
    s += H.front;
    if (!has(['bebe', 'degarni', 'chauve', 'rase', 'crete'], hair) && H.top <= 21) s += S(`M40 ${f(H.top + 12.5)}Q50.5 ${f(H.top + 3.2)} 61.5 ${f(H.top + 11.5)}`, c.hairL, 1.3, ' stroke-opacity=".3"');
    // accessoires
    if (acc === 'boucles') s += accArt('boucles', c, H.top);
    if (glasses !== 'aucune') s += glassesArt(glasses, c);
    if (acc !== 'boucles' && acc !== 'aucun') s += accArt(acc, c, H.top);
    if (opts.crown) {
      const topY = hat ? (acc === 'bonnet' ? 13 : 13.8) : H.top;
      const b = Math.max(topY + 5.4, 14);
      s += P(`M40.6 ${f(b)}L39 ${f(b - 8.8)}L44.6 ${f(b - 4.6)}L50 ${f(b - 10.8)}L55.4 ${f(b - 4.6)}L61 ${f(b - 8.8)}L59.4 ${f(b)}Z`, c.gold)
        + P(`M40.4 ${f(b - 1.6)}L59.6 ${f(b - 1.6)}L59.4 ${f(b + 0.6)}L40.6 ${f(b + 0.6)}Z`, k('#C8902A'))
        + `<path d="${dots([[39, b - 9.4], [50, b - 11.4], [61, b - 9.4]], 1.2)}" fill="${k('#F6D77A')}"/>`;
    }
    s += '</g></g></svg>';
    return s;
  }

  /* ---------- Génération ---------- */
  function random(gender) {
    const g = gender === 'F' ? 'F' : 'H';
    const skin = rnd(0, 7);
    const natural = skin >= 5 ? [0, 1, 2, 0, 1, 3] : skin >= 3 ? [0, 1, 2, 3, 4, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7, 2, 4];
    let hc = pick(natural);
    if (Math.random() < 0.05) hc = pick([8, 9, 6]);
    const curly = skin >= 5 ? 0.55 : skin >= 3 ? 0.28 : 0.15;
    let hair;
    if (g === 'F') hair = Math.random() < curly ? wpick(['boucle', 'afro', 'tresses', 'chignon', 'locs', 'ondule'], [4, 3, 3, 1, 1.4, 1.5]) : wpick(['long', 'milong', 'carre', 'queue', 'chignon', 'meche', 'court', 'rase', 'ondule', 'frange', 'pixie'], [6, 5, 4, 3, 2, 1, 1, 0.4, 4.5, 2.6, 1.6]);
    else hair = Math.random() < curly ? wpick(['boucle', 'afro', 'rase', 'tresses', 'locs', 'undercut'], [4, 2, 3, 1, 1.2, 1.2]) : wpick(['court', 'meche', 'rase', 'chauve', 'boucle', 'milong', 'crete', 'queue', 'undercut', 'manbun'], [7, 4, 3, 1, 1, 1, 0.4, 0.4, 3, 1.2]);
    const beard = g === 'H' ? wpick(['aucune', 'barbe3j', 'barbe', 'bouc', 'moustache', 'barbelongue', 'collier', 'favoris', 'goatee'], [10, 5, 4, 2, 1, 0.8, 1, 0.7, 1.5]) : 'aucune';
    const acc = g === 'F' ? wpick(['aucun', 'boucles', 'bandeau', 'fleur', 'bonnet', 'casquette', 'chapeau', 'bandana', 'voile', 'piercing'], [8, 5, 1, 1, 1, 0.6, 0.7, 1.1, 0.6, 1.2]) : wpick(['aucun', 'casquette', 'bonnet', 'boucles', 'chapeau', 'bandana', 'piercing'], [14, 2, 1.4, 0.6, 0.9, 0.7, 0.4]);
    const top = g === 'F' ? wpick(TOPS, [5, 2, 3, 1, 3, 3, 2, 2, 1.6, 0.4]) : wpick(TOPS, [5, 3, 3, 1.4, 0, 3, 2.4, 2, 0.5, 0.5]);
    return {
      skin, hair, hc, eye: skin >= 4 ? wpick([0, 1, 5, 2], [8, 2, 3, 0.3]) : wpick([0, 1, 2, 3, 4, 5], [5, 3, 2, 3, 1.5, 1]),
      eyes: wpick(EYES, [3, 5, 2, 1.4]), brows: g === 'F' ? wpick(BROWS, [4, 3, 1.4, 2]) : wpick(BROWS, [5, 1, 3, 1]),
      beard, glasses: wpick(GLASSES, [14, 2, 2, 0.6, 1, g === 'F' ? 1.2 : 0.2, 1.2]), acc, top, topc: rnd(0, 9), bg: rnd(0, 7),
      freckles: Math.random() < (skin <= 1 || hc === 7 ? 0.3 : 0.06),
      face: pick(FACES), nose: pick(NOSES), lips: g === 'F' ? wpick(LIPS, [1, 3, 3]) : wpick(LIPS, [2, 4, 1.4]),
      makeup: g === 'F' ? wpick(MAKEUPS, [9, 4, 2, 2, 1, 1]) : 'aucun',
      mark: wpick(MARKS, [80, 10, 4, 6])
    };
  }

  function inherit(a, b, gender) {
    const g = gender === 'F' ? 'F' : 'H';
    const A = normalize(a, 'H'), B = normalize(b || a, 'F');
    const lo = Math.min(A.skin, B.skin), hi = Math.max(A.skin, B.skin);
    const skin = Math.round(lo + (hi - lo) * (0.3 + Math.random() * 0.4));
    const nat = x => (x >= 8 ? (skin >= 5 ? 0 : 2) : x);
    const hc = Math.random() < 0.5 ? nat(A.hc) : nat(B.hc);
    const tex = l => (has(['afro', 'boucle', 'tresses'], l.hair) ? 2 : 0) + (l.skin >= 5 ? 1 : 0);
    const curlyScore = tex(A) + tex(B);
    let hair;
    if (curlyScore >= 3 || (curlyScore >= 1 && Math.random() < 0.45)) hair = g === 'F' ? wpick(['boucle', 'afro', 'tresses'], [4, 3, 2]) : wpick(['boucle', 'afro', 'rase'], [4, 3, 2]);
    else hair = g === 'F' ? wpick(['long', 'milong', 'carre', 'queue'], [4, 3, 2, 2]) : wpick(['court', 'meche', 'rase'], [5, 3, 1]);
    return {
      skin, hair, hc, eye: Math.random() < 0.5 ? A.eye : B.eye,
      eyes: Math.random() < 0.5 ? A.eyes : B.eyes, brows: Math.random() < 0.5 ? A.brows : B.brows,
      beard: 'aucune', glasses: 'aucune', acc: 'aucun', top: g === 'F' ? pick(['tshirt', 'pull', 'robe', 'sweat']) : pick(['tshirt', 'pull', 'sweat', 'chemise']),
      topc: rnd(0, 9), bg: rnd(0, 7), freckles: (A.freckles || B.freckles) ? Math.random() < 0.6 : Math.random() < 0.04,
      face: Math.random() < 0.5 ? A.face : B.face, nose: Math.random() < 0.5 ? A.nose : B.nose, lips: Math.random() < 0.5 ? A.lips : B.lips,
      makeup: 'aucun', mark: Math.random() < 0.9 ? 'aucune' : pick(['grain', 'grain', 'cicatrice'])
    };
  }

  return {
    render, random, inherit, normalize,
    SKINS, HAIR_COLORS, EYE_COLORS, TOP_COLORS, BG_COLORS,
    HAIRS, EYES, BROWS, BEARDS, GLASSES, ACCS, TOPS, FACES, NOSES, LIPS, MAKEUPS, MARKS, LABELS
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AV_A;

const AVATAR_R = AV_A;
