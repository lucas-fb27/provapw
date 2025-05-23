const UNSPLASH_API_KEY = 'rB5PHYidpS1KV2yCLG3e8oQrxrmuc8ceCBQxMgdrqKg';

document.addEventListener('DOMContentLoaded', () => {
    const volunteersGrid = document.getElementById('volunteers-grid');
    const searchInput = document.getElementById('search');
    const clearAllButton = document.getElementById('clear-all-volunteers-btn');

    if (volunteersGrid && searchInput && clearAllButton) {
        if (typeof checkAuth !== 'function') {
            console.error("Fatal Error: checkAuth() function is not defined. Make sure auth.js is loaded before volunteers.js.");
            alert("Erro de autenticação. Por favor, recarregue a página ou contate o suporte.");
            return;
        }

        if (!checkAuth()) {
            window.location.href = '/pages/login.html';
            return;
        }

        let allVolunteersData = [];

        function loadVolunteers() {
            try {
                const storedVolunteers = localStorage.getItem('volunteers');
                allVolunteersData = storedVolunteers ? JSON.parse(storedVolunteers) : [];
                if (!Array.isArray(allVolunteersData)) {
                    allVolunteersData = [];
                    localStorage.setItem('volunteers', JSON.stringify([]));
                }
            } catch (error) {
                console.error("Erro ao parsear voluntários do localStorage:", error);
                allVolunteersData = [];
            }
            displayVolunteers(allVolunteersData);
        }

        async function displayVolunteers(volunteersToShow) {
            volunteersGrid.innerHTML = '';
            if (volunteersToShow.length === 0) {
                volunteersGrid.innerHTML = `
                    <div class="no-volunteers">
                        <p>Nenhum voluntário encontrado.</p>
                    </div>`;
                return;
            }

            const cardPromises = volunteersToShow.map(volunteer => createVolunteerCard(volunteer));
            const cards = await Promise.all(cardPromises);
            cards.forEach(card => volunteersGrid.appendChild(card));
        }

        async function getUnsplashImageUrl(theme, volunteerName) {
            const placeholderImageUrl = `https://placehold.co/300x300/E0E0E0/757575?text=${encodeURIComponent(volunteerName.split(' ')[0])}`;
            const sourceUnsplashUrl = `https://source.unsplash.com/featured/300x300/?${encodeURIComponent(theme)},portrait&sig=${Date.now()}`;

            if (UNSPLASH_API_KEY && UNSPLASH_API_KEY !== '') {
                const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)},portrait&client_id=${UNSPLASH_API_KEY}&orientation=squarish&content_filter=high`;
                try {
                    const response = await fetch(apiUrl);
                    if (!response.ok) {
                        try {
                            const errorData = await response.json();
                            console.warn('Unsplash API error data:', errorData);
                        } catch (jsonError) {
                            const responseText = await response.text().catch(() => 'Could not read response text');
                        }
                        return sourceUnsplashUrl;
                    }

                    const data = await response.json();
                    if (data && data.urls && data.urls.small) {
                        return data.urls.small;
                    } else {
                        return sourceUnsplashUrl;
                    }
                } catch (error) {
                    console.error('Network error or other issue fetching from Unsplash API:', error);
                    return sourceUnsplashUrl;
                }
            } else {
                return sourceUnsplashUrl;
            }
        }

        async function createVolunteerCard(volunteer) {
            const card = document.createElement('div');
            card.className = 'volunteer-card';

            const nameSum = volunteer.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const themes = ['people', 'community', 'helping', 'nature', 'city', 'service', 'support', 'team', 'hands', 'volunteerism', 'charity', 'giving back'];
            const theme = themes[nameSum % themes.length];

            const imageUrl = await getUnsplashImageUrl(theme, volunteer.name);
            const placeholderImageUrl = `https://placehold.co/300x300/E0E0E0/757575?text=${encodeURIComponent(volunteer.name.split(' ')[0])}`;

            card.innerHTML = `
                <img 
                    src="${imageUrl}" 
                    alt="Imagem representativa para ${volunteer.name}" 
                    class="volunteer-image" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${placeholderImageUrl}';"
                >
                <div class="volunteer-info">
                    <div class="volunteer-header">
                        <h2 class="volunteer-name">${volunteer.name}</h2>
                        <button class="remove-volunteer-btn" data-volunteer-id="${volunteer.id}" title="Remover voluntário">
                            <span style="color: red; font-weight: bold; cursor: pointer;">X</span>
                        </button>
                    </div>
                    <p class="volunteer-email">${volunteer.email}</p>
                    <div class="volunteer-address">
                        <p>${volunteer.street || 'Rua não informada'}, ${volunteer.number || 'S/N'}${(volunteer.complement ? ` - ${volunteer.complement}` : '')}</p>
                        <p>${volunteer.neighborhood || 'Bairro não informado'} - ${volunteer.city || 'Cidade não informada'}/${volunteer.state || 'UF'}</p>
                        <p>CEP: ${volunteer.cep || 'Não informado'}</p>
                    </div>
                </div>
            `;
            return card;
        }

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredVolunteers = allVolunteersData.filter(volunteer =>
                volunteer.name.toLowerCase().includes(searchTerm) ||
                volunteer.email.toLowerCase().includes(searchTerm) ||
                (volunteer.city && volunteer.city.toLowerCase().includes(searchTerm)) ||
                (volunteer.state && volunteer.state.toLowerCase().includes(searchTerm))
            );
            displayVolunteers(filteredVolunteers);
        });

        volunteersGrid.addEventListener('click', function(event) {
            let removeButton = null;
            if (event.target.classList.contains('remove-volunteer-btn')) {
                removeButton = event.target;
            } else if (event.target.parentNode && event.target.parentNode.classList.contains('remove-volunteer-btn')) {
                removeButton = event.target.parentNode;
            }

            if (removeButton) {
                const volunteerIdToRemove = removeButton.dataset.volunteerId;
                const volunteerCard = removeButton.closest('.volunteer-card');
                const volunteerNameElement = volunteerCard ? volunteerCard.querySelector('.volunteer-name') : null;
                const volunteerName = volunteerNameElement ? volunteerNameElement.textContent : 'este voluntário';

                if (confirm(`Tem certeza que deseja remover ${volunteerName}?`)) {
                    allVolunteersData = allVolunteersData.filter(volunteer => volunteer.id !== volunteerIdToRemove);
                    localStorage.setItem('volunteers', JSON.stringify(allVolunteersData));
                    displayVolunteers(allVolunteersData);
                }
            }
        });

        clearAllButton.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja remover TODOS os voluntários? Esta ação não pode ser desfeita.')) {
                allVolunteersData = [];
                localStorage.removeItem('volunteers');
                displayVolunteers(allVolunteersData);
            }
        });

        loadVolunteers();
    } else {
        if (!volunteersGrid) console.error("Elemento 'volunteers-grid' não encontrado.");
        if (!searchInput) console.error("Elemento 'search' não encontrado.");
        if (!clearAllButton) console.error("Elemento 'clear-all-volunteers-btn' não encontrado.");
    }
});
