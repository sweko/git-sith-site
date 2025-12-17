(function(){
  const THEMES = ['light','normal','dark'];
  const KEY = 'git-sith:theme';
  const btnSelector = '.theme-toggle';

  function applyTheme(t){
    if(!t || t === 'normal'){
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem(KEY);
    } else {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(KEY, t);
    }
    updateButton();
  }

  function currentTheme(){
    const saved = localStorage.getItem(KEY);
    if(saved) return saved;
    return 'normal';
  }

  function nextTheme(){
    const cur = currentTheme();
    const idx = THEMES.indexOf(cur);
    return THEMES[(idx + 1) % THEMES.length];
  }

  function updateButton(){
    const btn = document.querySelector(btnSelector);
    if(!btn) return;
    const cur = currentTheme();
    btn.textContent = cur === 'normal' ? 'Theme: Normal' : `Theme: ${cur.charAt(0).toUpperCase()+cur.slice(1)}`;
    btn.setAttribute('aria-pressed', (cur !== 'normal').toString());
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const saved = localStorage.getItem(KEY);
    if(saved) document.documentElement.setAttribute('data-theme', saved);
    updateButton();

    const btn = document.querySelector(btnSelector);
    if(btn){
      btn.addEventListener('click', ()=>{
        const t = nextTheme();
        applyTheme(t);
      });
    }
  });
})();
