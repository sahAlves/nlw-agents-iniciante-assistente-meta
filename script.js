const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

// Função para converter Markdown para HTML
// Usando a biblioteca showdown para converter Markdown em HTML
const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

// Função que monta a requisição para a API do Gemini
// Ela recebe a pergunta, o jogo e a chave da API como parâmetros
// Ela faz a requisição para a API do Gemini e retorna a resposta da IA
const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.0-flash";
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const perguntaLOL = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas do usuários com base no seu conhecimento do jogo, estratégias, build e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não é sobre o jogo ${game}'.
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres.
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        pergunta do usuário: Melhor build rengar jungle?
        resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n **Runas:**\n\n coloque as runas aqui.\n\n **Estratégia:**\n\n coloque a estratégia aqui.\n\n **Dicas:**\n\n coloque as dicas aqui. 

        ---
        Aqui está a pergunta do usuário: ${question}
    `

    const perguntaValorant = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas dos usuários com base no seu conhecimento do jogo, estratégias, composição de agentes e dicas de gameplay.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não é sobre o jogo ${game}'.
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda algo que você não tenha certeza de que existe no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres.
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        pergunta do usuário: Qual a melhor composição para Ascent?
        resposta: A comp meta atual para Ascent é:\n\n **Agentes:** Jett, Sova, Killjoy, Omen, KAY/O.\n\n **Estratégia:** Controle de meio com Sova + KAY/O e execuções rápidas no A.\n\n **Dicas:** Use o drone do Sova no round eco para garantir info e controle.

        ---
        Aqui está a pergunta do usuário: ${question}
    `

    const perguntaCSGO = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas dos usuários com base no seu conhecimento do jogo, estratégias, armas, granadas e dicas de gameplay.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não é sobre o jogo ${game}'.
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o meta atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda algo que você não tenha certeza de que existe no meta atual.

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo 500 caracteres.
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        pergunta do usuário: Qual a melhor estratégia de TR em Mirage?
        resposta: A tática mais usada é:\n\n **Execução A:** 3 ramp + 2 palace com smokes padrão (CT, Jungle, Stairs).\n\n **Dicas:** Use fake no B antes para forçar rotação.\n\n **Armas:** AK-47 e AWP para entry e pós-plant.

        ---
        Aqui está a pergunta do usuário: ${question}
    `

    let pergunta = '';

    if (game == 'valorant') {
        pergunta = perguntaValorant
    } else if (game == 'lol') {
        pergunta = perguntaLOL
    } else if (game == 'csgo') {
        pergunta = perguntaCSGO
    }

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // Chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Função que envia o formulário e chama a IA
// Ela impede o envio padrão do formulário, coleta os dados e chama a função perguntarAI
// Ela também trata o estado do botão de pergunta e exibe a resposta da IA
const enviarFormulario = async (event) => {
    event.preventDefault(); // Impede o envio do formulário padrão
    const apiKey = apiKeyInput.value
    const game = gameSelect.value;
    const question = questionInput.value;

    if (!apiKey || !game || !question) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');

    try {
        // perguntar para a IA
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }
}

// addEventListener fica escutando o evento de submit do formulário
form.addEventListener('submit', enviarFormulario);