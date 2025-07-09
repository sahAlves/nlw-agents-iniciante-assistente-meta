const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const enviarFormulario = (event) => {
    event.preventDefault(); // Impede o envio do formulário padrão
}

// addEventListener fica escutando o evento de submit do formulário
form.addEventListener('submit', enviarFormulario);