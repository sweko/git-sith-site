// contrast-test.js
(function(){
  const selectorsToTest = [
    { label: 'Body text on page', fg: 'body', bg: 'body' },
    { label: 'Nav link on nav background', fg: '.site-nav a', bg: '.site-nav' },
    { label: 'Article title on article-bg', fg: '.article-header h1', bg: '.article-container' },
    { label: 'Article paragraph on article-bg', fg: '.article-content p', bg: '.article-container' },
    { label: 'Post excerpt on post-card', fg: '.post-card .excerpt', bg: '.post-card' },
    { label: 'Code block text on pre', fg: '.article-content pre code, .code-sample pre code', bg: '.article-content pre' },
    { label: 'Coming-soon text', fg: '.coming-soon', bg: '.coming-soon' }
  ];

  function luminance(r,g,b){
    const sRGB = [r,g,b].map(v => v/255).map(u => u <= 0.03928 ? u/12.92 : Math.pow((u+0.055)/1.055,2.4));
    return 0.2126*sRGB[0] + 0.7152*sRGB[1] + 0.0722*sRGB[2];
  }

  function parseRGB(cs){
    // handles rgb(a), hex and 'transparent'
    if(!cs) return null;
    cs = cs.trim();
    if(cs.startsWith('rgb')){
      const m = cs.match(/rgba?\(([^)]+)\)/);
      if(!m) return null;
      const parts = m[1].split(',').map(s=>parseFloat(s));
      return parts.length === 3 ? [parts[0], parts[1], parts[2], 1] : [parts[0], parts[1], parts[2], parts[3]];
    }
    if(cs.startsWith('#')){
      let hex = cs.slice(1);
      if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      return [r,g,b,1];
    }
    if(cs === 'transparent') return [0,0,0,0];
    return null;
  }

  function compositeRGBA(top, bottom){
    // both arrays are [r,g,b,a]
    const [rT,gT,bT,aT] = top;
    const [rB,gB,bB,aB] = bottom;
    const outA = aT + aB*(1 - aT);
    if(outA === 0) return [0,0,0,0];
    const r = (rT*aT + rB*aB*(1 - aT))/outA;
    const g = (gT*aT + gB*aB*(1 - aT))/outA;
    const b = (bT*aT + bB*aB*(1 - aT))/outA;
    return [r,g,b,outA];
  }

  function contrastRatio(fgRgb, bgRgb){
    const L1 = luminance(fgRgb[0],fgRgb[1],fgRgb[2]);
    const L2 = luminance(bgRgb[0],bgRgb[1],bgRgb[2]);
    const lighter = Math.max(L1,L2);
    const darker = Math.min(L1,L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function getRenderedColor(el, prop){
    const cs = getComputedStyle(el);
    return cs.getPropertyValue(prop) || null;
  }

  function parseGradientAverage(grad){
    if(!grad) return null;
    // extract hex colors and average them
    const matches = Array.from(grad.matchAll(/#([0-9a-fA-F]{3,6})/g)).map(m=>m[0]);
    if(matches.length === 0) return null;
    const sum = [0,0,0];
    matches.forEach(h => {
      let hex = h.slice(1);
      if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      sum[0] += r; sum[1] += g; sum[2] += b;
    });
    return [Math.round(sum[0]/matches.length), Math.round(sum[1]/matches.length), Math.round(sum[2]/matches.length)];
  }

  function getBGColor(el){
    // compose backgrounds from body -> element to resolve alpha blending
    const bodyBgCs = getComputedStyle(document.body).getPropertyValue('background-color') || 'transparent';
    let accum;
    if(bodyBgCs && bodyBgCs !== 'transparent' && bodyBgCs !== 'rgba(0, 0, 0, 0)'){
      accum = parseRGB(bodyBgCs) || [255,255,255,1];
    } else {
      // fallback to averaging the --bg-gradient colors if present
      const rootGrad = getComputedStyle(document.documentElement).getPropertyValue('--bg-gradient');
      const avg = parseGradientAverage(rootGrad);
      if(avg) accum = [avg[0], avg[1], avg[2], 1];
      else accum = [255,255,255,1];
    }
    if(accum.length === 3) accum[3] = 1;

    const path = [];
    let cur = el;
    while(cur && cur !== document.documentElement){
      path.unshift(cur);
      cur = cur.parentElement;
    }
    for(const node of path){
      const bgCs = getComputedStyle(node).getPropertyValue('background-color');
      const bg = parseRGB(bgCs);
      if(bg && bg[3] !== 0){
        if(bg.length === 3) bg[3] = 1;
        accum = compositeRGBA(bg, accum);
      }
    }
    // return opaque rgb array
    return [Math.round(accum[0]), Math.round(accum[1]), Math.round(accum[2])];
  }

  async function checkTheme(theme){
    if(theme === 'normal') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);

    // Force style recalculation and wait a frame so CSS variables/transitions apply
    // This ensures getComputedStyle reflects the new --text-color/etc.
    void document.body.offsetHeight;
    await new Promise(r => requestAnimationFrame(() => r()));

    const rootTextVar = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
    const rootTextRgb = parseRGB(rootTextVar);
    const bodyColor = getComputedStyle(document.body).getPropertyValue('color');

    const results = selectorsToTest.map(s => {
      const fgNode = document.querySelector(s.fg);
      const bgNode = document.querySelector(s.bg);
      if(!fgNode || !bgNode) return { label: s.label, ok: null, note: 'Selector missing' };
      let fg = getRenderedColor(fgNode,'color') || getRenderedColor(fgNode,'-webkit-text-fill-color');
      // If this is the body or inherits directly from body, prefer the resolved --text-color var
      const inheritsBody = fg === bodyColor;
      let fgRgb = null;
      if((s.fg === 'body' || inheritsBody) && rootTextRgb){
        fgRgb = rootTextRgb;
      } else {
        fgRgb = parseRGB(fg);
      }
      const bgRgb = getBGColor(bgNode); // resolved opaque rgb array
      if(!fgRgb || !bgRgb) return { label: s.label, ok: null, fg, bg: bgRgb, note: 'Could not parse color' };
      // If FG has alpha, composite it over BG
      let fgOpaque;
      if(fgRgb.length === 4 && fgRgb[3] < 1){
        const comp = compositeRGBA([fgRgb[0],fgRgb[1],fgRgb[2],fgRgb[3]],[bgRgb[0],bgRgb[1],bgRgb[2],1]);
        fgOpaque = [Math.round(comp[0]), Math.round(comp[1]), Math.round(comp[2])];
      } else {
        fgOpaque = [Math.round(fgRgb[0]), Math.round(fgRgb[1]), Math.round(fgRgb[2])];
      }
      const ratio = contrastRatio(fgOpaque, bgRgb);
      const largeText = false;
      const pass = ratio >= 4.5 || (largeText && ratio >= 3.0);
      return { label: s.label, fg, bg: `rgb(${bgRgb.join(', ')})`, ratio: Math.round(ratio*100)/100, ok: pass };
    });
    return results;
  }

  function renderResults(theme, results){
    const container = document.getElementById('results');
    const heading = document.createElement('h3');
    heading.textContent = `Theme: ${theme}`;
    container.appendChild(heading);
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Element</th><th>fg</th><th>bg</th><th>Ratio</th><th>Result</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    results.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.label}</td><td>${r.fg||''}</td><td>${r.bg||''}</td><td>${r.ratio||''}</td><td>${r.ok===null? (r.note||'N/A') : (r.ok? '<span class="pass">PASS</span>' : '<span class="fail">FAIL</span>')}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const runBtn = document.getElementById('runBtn');
    const themeSelect = document.getElementById('themeSelect');
    const summary = document.getElementById('summary');
    runBtn.addEventListener('click', async ()=>{
      document.getElementById('results').innerHTML = '';
      let overallFail = false;
      for(const t of ['normal','light','dark']){
        themeSelect.value = t;
        const results = await checkTheme(t);
        renderResults(t, results);
        if(results.some(r => r.ok === false)) overallFail = true;
      }
      summary.textContent = overallFail ? 'Issues found' : 'All good';
      summary.style.color = overallFail ? '#b02a37' : 'green';
    });
  });
})();
