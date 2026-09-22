document.querySelectorAll('.mobile-menu').forEach((menu) => {
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => { menu.open = false; });
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
