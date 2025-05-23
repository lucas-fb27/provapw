const OPENWEATHER_API_KEY = 'af4010f87c8ada5f5df23f8a20d97120';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const cepInput = document.getElementById('cep');

    if (form && cepInput) {
        cepInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            if (value.length > 5) {
                value = value.slice(0, 5) + '-' + value.slice(5);
            }
            e.target.value = value;
        });

        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');

            if (cep.length === 8) {
                try {
                    clearError('cep');
                    const responseViaCEP = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    if (!responseViaCEP.ok) {
                        throw new Error(`Network response from ViaCEP was not ok: ${responseViaCEP.statusText}`);
                    }
                    const dataViaCEP = await responseViaCEP.json();

                    if (dataViaCEP.erro) {
                        showError('cep', 'CEP não encontrado.');
                        ['street', 'neighborhood', 'city', 'state'].forEach(id => {
                            const el = document.getElementById(id);
                            if (el) el.value = '';
                        });
                    } else {
                        const streetEl = document.getElementById('street');
                        if (streetEl) streetEl.value = dataViaCEP.logradouro || '';
                        const neighborhoodEl = document.getElementById('neighborhood');
                        if (neighborhoodEl) neighborhoodEl.value = dataViaCEP.bairro || '';
                        const cityEl = document.getElementById('city');
                        if (cityEl) cityEl.value = dataViaCEP.localidade || '';
                        const stateEl = document.getElementById('state');
                        if (stateEl) stateEl.value = dataViaCEP.uf || '';
                        const numberEl = document.getElementById('number');
                        if (numberEl) numberEl.focus();

                        if (OPENWEATHER_API_KEY === 'SUA_CHAVE_API_AQUI' || !OPENWEATHER_API_KEY) {
                            return;
                        } else if (dataViaCEP.localidade && dataViaCEP.uf) {
                            fetchWeatherAndShowPopup(dataViaCEP.localidade, dataViaCEP.uf);
                        }
                    }
                } catch (error) {
                    showError('cep', 'Falha ao buscar CEP. Verifique a conexão.');
                }
            } else if (cep.length > 0) {
                showError('cep', 'CEP deve conter 8 dígitos.');
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();
            if (validateRegistrationForm()) {
                const formData = {
                    id: Date.now().toString(),
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    cep: document.getElementById('cep').value,
                    street: document.getElementById('street').value,
                    number: document.getElementById('number').value,
                    complement: document.getElementById('complement').value,
                    neighborhood: document.getElementById('neighborhood').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value
                };

                const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
                volunteers.push(formData);
                localStorage.setItem('volunteers', JSON.stringify(volunteers));

                alert('Cadastro realizado com sucesso!');
                window.location.href = '/pages/login.html';
            }
        });
    }
});

async function fetchWeatherAndShowPopup(city, stateAbbreviation) {
    if (!city || !stateAbbreviation) return;
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${encodeURIComponent(stateAbbreviation)},BR&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao buscar dados do clima: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
        }
        const weatherData = await response.json();
        displayWeatherPopup(weatherData);
    } catch (error) {
        console.error('Falha ao buscar ou exibir dados do clima (OpenWeather):', error);
    }
}

function displayWeatherPopup(weatherData) {
    const existingPopup = document.getElementById('weather-popup-modal');
    if (existingPopup) {
        existingPopup.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'weather-popup-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white; padding: 25px; border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2); text-align: center;
        min-width: 300px; max-width: 90%;
    `;

    const weatherIconCode = weatherData.weather[0].icon;
    const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherIconCode}@2x.png`;

    modalContent.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">Clima em ${weatherData.name}</h3>
        <img src="${weatherIconUrl}" alt="${weatherData.weather[0].description}" style="width: 80px; height: 80px; margin-bottom: 10px;">
        <p style="font-size: 1.5em; margin: 5px 0; color: #555;">${Math.round(weatherData.main.temp)}°C</p>
        <p style="text-transform: capitalize; margin-bottom: 20px; color: #666;">${weatherData.weather[0].description}</p>
        <button id="weather-popup-ok-btn" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em;">OK</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('weather-popup-ok-btn').addEventListener('click', () => {
        modal.remove();
    });

    function closeOnEsc(event) {
        if (event.key === "Escape") {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    }
    document.addEventListener('keydown', closeOnEsc);

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
}

function validateRegistrationForm() {
    let isValid = true;
    const requiredFields = ['name', 'email', 'cep', 'street', 'number', 'neighborhood', 'city', 'state', 'password', 'confirm-password'];

    requiredFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input && !input.value.trim()) {
            showError(fieldId, 'Este campo é obrigatório.');
            isValid = false;
        }
    });

    const nameInput = document.getElementById('name');
    if (nameInput && nameInput.value.trim().length > 0 && nameInput.value.trim().length < 3) {
        showError('name', 'O nome deve ter no mínimo 3 caracteres.');
        isValid = false;
    }

    const emailInput = document.getElementById('email');
    if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        showError('email', 'Formato de email inválido.');
        isValid = false;
    }

    if (emailInput && emailInput.value) {
        const volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
        if (volunteers.some(v => v.email === emailInput.value)) {
            const emailErrorSpan = emailInput.closest('.form-group')?.querySelector('.error-message');
            if (!emailErrorSpan || emailErrorSpan.textContent === '' || emailErrorSpan.textContent === 'Este campo é obrigatório.') {
                showError('email', 'Este email já está cadastrado.');
            }
            isValid = false;
        }
    }

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (passwordInput && confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
        showError('confirm-password', 'As senhas não coincidem.');
        isValid = false;
    }
    if (passwordInput && passwordInput.value.length > 0 && passwordInput.value.length < 6) {
        showError('password', 'A senha deve ter no mínimo 6 caracteres.');
        isValid = false;
    }

    const cepValInput = document.getElementById('cep');
    if (cepValInput && cepValInput.value && !/^\d{5}-?\d{3}$/.test(cepValInput.value)) {
        showError('cep', 'Formato de CEP inválido.');
        isValid = false;
    }

    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorSpan = field.closest('.form-group')?.querySelector('.error-message') || field.nextElementSibling;
        if (errorSpan && (errorSpan.classList.contains('error-message') || errorSpan.tagName === 'SPAN')) {
            errorSpan.textContent = message;
        }
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
        const errorSpan = field.closest('.form-group')?.querySelector('.error-message') || field.nextElementSibling;
        if (errorSpan && (errorSpan.classList.contains('error-message') || errorSpan.tagName === 'SPAN')) {
            errorSpan.textContent = '';
        }
    }
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
    document.querySelectorAll('.form-group input.error, .form-group select.error').forEach(input => input.classList.remove('error'));
}
