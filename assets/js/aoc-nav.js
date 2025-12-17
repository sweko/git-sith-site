// aoc-nav.js
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const prev = document.querySelector('.aoc-nav a.prev');
    const next = document.querySelector('.aoc-nav a.next');

    function goto(el){ if(!el) return; window.location.href = el.href; }

    document.addEventListener('keydown', function(e){
      if(e.altKey || e.ctrlKey || e.metaKey) return; // ignore combos
      const tag = (e.target && e.target.tagName) || '';
      if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.defaultPrevented) return;
      if(e.key === 'ArrowLeft' && prev){ e.preventDefault(); goto(prev); }
      if(e.key === 'ArrowRight' && next){ e.preventDefault(); goto(next); }
      // also support single-letter shortcuts
      if((e.key === 'p' || e.key === 'P') && prev){ e.preventDefault(); goto(prev); }
      if((e.key === 'n' || e.key === 'N') && next){ e.preventDefault(); goto(next); }
    });

    if(prev && !prev.getAttribute('title')) prev.setAttribute('title', prev.getAttribute('aria-label') || prev.textContent.trim());
    if(next && !next.getAttribute('title')) next.setAttribute('title', next.getAttribute('aria-label') || next.textContent.trim());
  });
})();
