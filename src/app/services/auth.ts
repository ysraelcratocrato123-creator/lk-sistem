export const auth = {
  login: (user: string, pass: string) => {
    // Credenciais que estão na sua imagem
    if ((user === 'admin' && pass === 'admin123') || (user === 'gerente' && pass === 'gerente123')) {
      localStorage.setItem('lk_auth', 'true');
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('lk_auth');
    window.location.href = '/login'; // Redireciona para o login ao sair
  },
  isAuthenticated: () => {
    return localStorage.getItem('lk_auth') === 'true';
  }
};