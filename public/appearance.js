// Apply the saved choice before the page paints; otherwise follow the OS.
(() => {
  const key='workshop-appearance-v1';
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  let saved;
  try{saved=localStorage.getItem(key);}catch{}
  function apply(theme){
    document.documentElement.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#191b22':'#f2f0f4');
    for(const button of document.querySelectorAll('[data-theme-toggle]'))button.setAttribute('aria-pressed',String(theme==='dark'));
  }
  apply(saved==='dark'||saved==='light'?saved:system.matches?'dark':'light');
  document.addEventListener('DOMContentLoaded',()=>apply(document.documentElement.dataset.theme));
  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-theme-toggle]'))return;
    saved=document.documentElement.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem(key,saved);}catch{}
    apply(saved);
  });
  system.addEventListener('change',()=>{if(saved!=='dark'&&saved!=='light')apply(system.matches?'dark':'light');});
})();
