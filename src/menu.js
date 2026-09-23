const menus = [...document.querySelectorAll('.mobile-menu')];

menus.forEach((menu) => {
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => { menu.open = false; });
  });
});

document.addEventListener('click', (event) => {
  menus.forEach((menu) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  menus.forEach((menu) => {
    if (!menu.open) return;
    menu.open = false;
    menu.querySelector('summary')?.focus();
  });
});

window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
  if (event.matches) menus.forEach((menu) => { menu.open = false; });
});
