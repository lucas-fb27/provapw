// js/auth.js

const AUTH_KEY = 'currentUser';

function updateNavigation(isAuthenticated) {
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-btn');
    const volunteersLink = document.getElementById('volunteers-link');

    if (loginLink) {
        // Assume que o link de login deve apontar para /pages/login.html
        // A visibilidade é alternada, mas o href deve estar correto no HTML.
        loginLink.classList.toggle('hidden', isAuthenticated);
    }
    if (logoutBtn) {
        logoutBtn.classList.toggle('hidden', !isAuthenticated);
    }
    if (volunteersLink) {
        // Assume que o link de lista de voluntários deve apontar para /pages/volunteers.html
        // A visibilidade é alternada, mas o href deve estar correto no HTML.
        volunteersLink.classList.toggle('hidden', !isAuthenticated);
    }
}

function checkAuth() {
    const storedUser = localStorage.getItem(AUTH_KEY);
    if (storedUser) {
        updateNavigation(true);
        return true;
    }
    updateNavigation(false);
    return false;
}

function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    updateNavigation(false);
    // Verifica se a página atual JÁ É a de login dentro da pasta /pages/
    // ou a página de cadastro (index.html no root) ou a raiz.
    if (!window.location.pathname.endsWith('/pages/login.html') &&
        !window.location.pathname.endsWith('/index.html') && // Assumindo que index.html (cadastro) está na raiz
        window.location.pathname !== '/') { // Assumindo que a raiz também é pública ou cadastro
       window.location.href = '/pages/login.html'; // ATUALIZADO AQUI (já estava correto no seu código)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = loginForm.querySelector('#email');
            const passwordInput = loginForm.querySelector('#password');

            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            loginForm.querySelectorAll('.error-message').forEach(span => span.textContent = '');
            loginForm.querySelectorAll('.form-group .error').forEach(el => el.classList.remove('error'));

            const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
            const user = volunteers.find(v => v.email === email && v.password === password);

            if (user) {
                localStorage.setItem(AUTH_KEY, JSON.stringify(user));
                window.location.href = '/pages/volunteers.html'; // ATUALIZADO AQUI (já estava correto no seu código)
            } else {
                if (emailInput) {
                    emailInput.classList.add('error');
                    const emailErrorSpan = emailInput.closest('.form-group')?.querySelector('.error-message');
                    if (emailErrorSpan) emailErrorSpan.textContent = 'Email ou senha incorretos.';
                }
                if (passwordInput) {
                    passwordInput.classList.add('error');
                    const passwordErrorSpan = passwordInput.closest('.form-group')?.querySelector('.error-message');
                    if (passwordErrorSpan && passwordErrorSpan.textContent === '') {
                         passwordErrorSpan.textContent = 'Email ou senha incorretos.';
                    }
                }
                const formHasErrorMessages = Array.from(loginForm.querySelectorAll('.form-group .error-message')).some(span => span.textContent !== '');
                if (!formHasErrorMessages && emailInput && passwordInput) {
                    alert('Email ou senha incorretos.');
                }
            }
        });
    }
});
