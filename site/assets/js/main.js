const button = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-navigation');
const groupToggles = document.querySelectorAll('.nav-group-toggle');

const closeGroups = (exception = null) => {
  groupToggles.forEach((toggle) => {
    if (toggle === exception) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.closest('.nav-group')?.classList.remove('open');
  });
};

groupToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    closeGroups(toggle);
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.closest('.nav-group')?.classList.toggle('open', opening);
  });
});

if (button && navigation) {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('open', !expanded);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      button.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
      closeGroups();
    }
  });
}

document.addEventListener('click', (event) => {
  if (event.target instanceof Node && !event.target.closest?.('.nav-group')) {
    closeGroups();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeGroups();
  button?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('open');
  button?.focus();
});
