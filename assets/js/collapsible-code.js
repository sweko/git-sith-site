document.addEventListener('DOMContentLoaded', () => {
  // Only apply on small screens; change breakpoint if needed
  if (!window.matchMedia('(max-width: 640px)').matches) return;

  const pres = document.querySelectorAll('.article-content pre');
  pres.forEach(pre => {
    // avoid double-wrapping
    if (pre.closest('details.collapsible-code')) return;

    const details = document.createElement('details');
    details.className = 'collapsible-code';

    const summary = document.createElement('summary');
    summary.className = 'collapsible-code-summary';
    summary.textContent = 'Show code';
    summary.setAttribute('aria-expanded', 'false');

    // Move the pre inside the details
    pre.parentNode.insertBefore(details, pre);
    details.appendChild(summary);
    details.appendChild(pre);

    details.addEventListener('toggle', () => {
      const opened = details.open;
      summary.textContent = opened ? 'Hide code' : 'Show code';
      summary.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  });
});
