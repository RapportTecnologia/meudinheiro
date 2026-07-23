const button = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-navigation');

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
    }
  });
}

