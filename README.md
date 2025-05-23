# Sistema de Cadastro de Voluntários

## 📝 Descrição Breve

Aplicação web front-end para cadastro e listagem de voluntários, simulando uma plataforma de ONG. Permite login de usuários, cadastro com busca de endereço via CEP, listagem com imagens aleatórias e manipulação da lista de voluntários.

## ✨ Funcionalidades Principais

- **Autenticação de Usuários:** Login e logout com controle de acesso.
- **Cadastro de Voluntários:**
  - Validação de nome, email, CEP e senha.
  - Prevenção de e-mails duplicados.
  - Integração com a API [ViaCEP](https://viacep.com.br/) para preenchimento automático do endereço.
  - Exibição de clima via [OpenWeather API](https://openweathermap.org/api), baseado no CEP.
- **Listagem de Voluntários:**
  - Exibição em cards com imagens da [Unsplash API](https://unsplash.com/developers), com fallback.
  - Busca dinâmica (nome, email, cidade, estado).
  - Remoção individual ou total.
- **Persistência de Dados:** Utilização do `LocalStorage` para salvar voluntários e o estado da sessão.

## 🛠️ Tecnologias e APIs Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **APIs Externas:**
  - [ViaCEP](https://viacep.com.br/)
  - [Unsplash API](https://unsplash.com/developers)
  - [OpenWeather API](https://openweathermap.org/api)
- **Armazenamento Local:** `LocalStorage`

## 📂 Estrutura do Projeto

/meu-projeto-voluntarios/
├── index.html
├── pages/
│ ├── login.html
│ └── volunteers.html
├── js/
│ ├── auth.js
│ ├── register.js
│ └── volunteers.js
├── css/
│ └── styles.css
└── README.md
