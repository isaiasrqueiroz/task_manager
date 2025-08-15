# React Task Manager

Um aplicativo completo de gerenciamento de tarefas construído com React, TypeScript e Tailwind CSS. Ele permite que os usuários realizem operações CRUD (Criar, Ler, Atualizar, Excluir) em tarefas, importem/exportem dados em massa e visualizem métricas de desempenho em um dashboard interativo.

## Funcionalidades Principais

- **Gerenciamento de Tarefas (CRUD):** Crie, edite e exclua tarefas através de um formulário modal intuitivo.
- **Dashboard de Performance:** Analise o progresso do projeto com:
  - **Curva S de Entrega:** Compare as horas planejadas acumuladas com as horas entregues/previstas.
  - **Gráficos de Pizza:** Visualize a distribuição de tarefas por status e o status geral de conclusão (concluídas vs. pendentes).
  - **Cards de Status:** Contagem rápida de tarefas em cada estágio do fluxo de trabalho.
- **Visualização de Timeline (Gráfico de Gantt):** Visualize as tarefas em um cronograma interativo para entender a sobreposição e a duração.
- **Importação e Exportação de XLS/XLSX:** Adicione tarefas em massa a partir de uma planilha do Excel e exporte a lista de tarefas atual para o mesmo formato.
- **Análise com IA (Gemini):** Obtenha insights e sugestões acionáveis sobre o status do projeto analisando os dados do dashboard com a API do Google Gemini.
- **Filtro Dinâmico:** Pesquise e filtre tarefas rapidamente na visualização de tabela.
- **Suporte a Múltiplos Idiomas:** Interface disponível em Português (pt-br) e Inglês (en).
- **Tema Escuro/Claro:** Alterne entre os modos claro, escuro ou use a preferência do sistema.
- **Design Responsivo:** A interface se adapta a diferentes tamanhos de tela, de desktops a dispositivos móveis.

## Tech Stack

- **Frontend:**
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) para estilização.
- **Bibliotecas:**
  - [Recharts](https://recharts.org/): Para a criação dos gráficos do dashboard.
  - [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/): Para exportar o dashboard como PDF.
  - [xlsx](https://sheetjs.com/): Para manipulação de arquivos Excel (importação/exportação).
  - [@google/genai](https://www.npmjs.com/package/@google/genai): Para integração com a API do Google Gemini.
- **Ambiente de Desenvolvimento:**
  - O projeto utiliza um `importmap` no `index.html` para carregar as dependências diretamente de uma CDN (esm.sh), eliminando a necessidade de um passo de `npm install` para as bibliotecas do frontend.

## Estrutura do Projeto

```
/
├── components/          # Componentes React reutilizáveis (UI, formulários, etc.)
│   ├── ui/              # Componentes de UI genéricos (Modal, Switch, etc.)
│   └── ...
├── contexts/            # Contextos React (ThemeProvider)
├── locales/             # Arquivos de tradução JSON (i18n)
├── services/            # Lógica de negócio (taskService, aiService)
├── App.tsx              # Componente principal da aplicação
├── constants.tsx        # Constantes da aplicação (cores, ícones, etc.)
├── i18n.tsx             # Configuração do provedor de internacionalização
├── index.html           # Ponto de entrada HTML
├── index.tsx            # Ponto de entrada do React
├── metadata.json        # Metadados da aplicação
├── README.md            # Este arquivo
└── types.ts             # Definições de tipos TypeScript
```

## Como Executar o Projeto (Build e Instruções)

Este projeto foi projetado para ser executado sem um processo de build complexo. Ele consiste em arquivos estáticos (`.html`, `.tsx`) que podem ser servidos por qualquer servidor web simples.

### Pré-requisitos

1.  **Servidor Web Local:** Você precisará de uma maneira de servir os arquivos localmente. Uma opção popular e fácil é o pacote `serve` do Node.js.
2.  **API Key do Gemini:** Para que as funcionalidades de IA funcionem (Análise do Dashboard), uma chave de API do Google Gemini é necessária.

### Passos para a Instalação

1.  **Clone o repositório (ou tenha os arquivos localmente):**
    Se você estivesse usando git:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA>
    ```

2.  **Instale o `serve` (se ainda não o tiver):**
    ```bash
    npm install -g serve
    ```

3.  **Configure a Chave de API:**
    A chave de API do Google Gemini foi configurada diretamente no arquivo `services/aiService.ts` para permitir o funcionamento das funcionalidades de IA no ambiente de desenvolvimento.

4.  **Inicie o Servidor:**
    No diretório raiz do projeto, execute o seguinte comando:
    ```bash
    serve .
    ```

5.  **Acesse a Aplicação:**
    O comando `serve` informará o endereço local onde a aplicação está sendo executada, geralmente `http://localhost:3000`. Abra este endereço em seu navegador.

A aplicação agora está em execução localmente!

## Deploy com GitHub Pages

Você pode publicar esta aplicação gratuitamente usando o GitHub Pages.

1.  **Crie um repositório no GitHub:** Se ainda não o fez, crie um novo repositório e envie todos os arquivos do projeto para ele.

2.  **Vá para as Configurações:** No seu repositório no GitHub, clique na aba **"Settings"**.

3.  **Navegue até "Pages":** No menu lateral esquerdo, clique em **"Pages"**.

4.  **Configure a Fonte de Publicação:**
    - Em "Build and deployment", na seção "Source", selecione **"Deploy from a branch"**.
    - Na seção "Branch", certifique-se de que a branch `main` (ou `master`) está selecionada.
    - Mantenha a pasta como `/(root)`.
    - Clique em **"Save"**.

5.  **Aguarde a Publicação:** O GitHub Actions iniciará um processo para publicar seu site. Isso pode levar alguns minutos. A página será atualizada com o link do seu site ao vivo (algo como `https://<seu-usuario>.github.io/<seu-repositorio>/`) assim que estiver pronto.