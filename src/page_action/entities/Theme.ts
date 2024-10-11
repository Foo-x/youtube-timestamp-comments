export const updateTheme = (theme?: Theme) => {
  document.documentElement.classList.remove('theme-light');
  document.documentElement.classList.remove('theme-dark');

  switch (theme) {
    case 'light':
      document.documentElement.classList.add('theme-light');
      break;

    case 'dark':
      document.documentElement.classList.add('theme-dark');
      break;

    default:
  }
};
