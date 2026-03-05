# 📄 Currículo AI — Frontend

Frontend em **React + TypeScript** (Vite) para análise inteligente e ajuste de currículos com IA.  
Envia o currículo para uma API backend, exibe o resultado da análise (score, pontos fortes/fracos, sugestões) e permite download do currículo ajustado em PDF.

---

## 📸 Funcionalidades

| Funcionalidade          | Descrição                                                           |
| ----------------------- | ------------------------------------------------------------------- |
| **Upload de currículo** | Aceita arquivos PDF e TXT (drag-and-drop ou click)                  |
| **Apenas análise**      | Retorna score, análise detalhada e sugestões de melhoria            |
| **Analisar e ajustar**  | Retorna um PDF com o currículo reescrito pela IA                    |
| **Score visual**        | Card colorido (verde/amarelo/vermelho) com barra de progresso       |
| **Abas de resultado**   | Análise e sugestões separadas em abas para leitura limpa            |
| **Download**            | Exporta análise em `.txt` ou currículo ajustado em `.pdf`           |
| **Tratamento de erros** | Mensagens claras para timeout, conexão recusada e erros do servidor |

---

## 🛠️ Tecnologias

- [React 19](https://react.dev/) — Interface de usuário
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática
- [Vite](https://vitejs.dev/) — Build tool ultra-rápido

---

## 📁 Estrutura do Projeto

```
frontend-curriculo/
├── .env                        # Variáveis de ambiente (URL da API, timeout)
├── index.html                  # Entry HTML
├── package.json                # Dependências e scripts
├── vite.config.ts              # Configuração Vite
├── tsconfig.json               # Configuração TypeScript
├── src/
│   ├── main.tsx                # Entry point React
│   ├── App.tsx                 # Componente principal
│   ├── App.css                 # Estilos do App
│   ├── index.css               # Estilos globais (tema escuro)
│   ├── components/
│   │   ├── Header.tsx          # Cabeçalho
│   │   ├── FileUpload.tsx      # Upload de arquivo (drag & drop)
│   │   ├── ModeSelector.tsx    # Seletor de modo (análise / ajuste)
│   │   ├── ScoreCard.tsx       # Card de pontuação visual
│   │   ├── ResultTabs.tsx      # Abas de resultado
│   │   └── Footer.tsx          # Rodapé
│   └── services/
│       └── apiClient.ts        # Cliente HTTP para o backend
└── README.md
```

---

## ⚡ Início Rápido

### 1. Clone o repositório

```bash
git clone https://github.com/Ramon1337/front-analise-curriculo-com-ia.git
cd front-analise-curriculo-com-ia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=120000
```

| Variável             | Descrição                            | Padrão                  |
| -------------------- | ------------------------------------ | ----------------------- |
| `VITE_API_BASE_URL`  | URL do backend da API                | `http://localhost:8000` |
| `VITE_API_TIMEOUT`   | Timeout da requisição em milissegundos | `120000`               |

### 4. Execute

```bash
npm run dev
```

A aplicação estará disponível em **http://localhost:3000**.

### 5. Build para produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`.

---

## 📡 API Esperada

O frontend se comunica com o backend via:

```
POST {VITE_API_BASE_URL}/resume/analyze
Content-Type: multipart/form-data
```

### Campos do formulário

| Campo    | Tipo    | Obrigatório          | Descrição                                                          |
| -------- | ------- | -------------------- | ------------------------------------------------------------------ |
| `file`   | arquivo | ✅                   | Currículo em PDF ou TXT                                            |
| `adjust` | boolean | ❌ (padrão: `false`) | `true` = retorna PDF reescrito, `false` = retorna JSON com análise |

### Resposta — Apenas análise (`adjust=false`)

```json
{
  "analysis": "1) Pontos fortes: ...",
  "suggestions": "1) Sugestões: ...",
  "score": 8
}
```

**Content-Type:** `application/json`

### Resposta — Analisar e ajustar (`adjust=true`)

Retorna o arquivo PDF diretamente.

**Content-Type:** `application/pdf`

---

## 🧠 Lógica do Frontend

### Separação inteligente de conteúdo

Quando a API retorna o mesmo texto nos campos `analysis` e `suggestions`, o frontend detecta automaticamente e separa o conteúdo usando regex, buscando seções como:

- "Sugestões", "Melhorias", "Recomendações"
- "Pontos a melhorar", "O que melhorar"

### Score com feedback visual

| Faixa | Cor         | Indicador                        |
| ----- | ----------- | -------------------------------- |
| 7–10  | 🟢 Verde    | Currículo forte                  |
| 4–6   | 🟡 Amarelo  | Precisa de ajustes               |
| 0–3   | 🔴 Vermelho | Precisa de revisão significativa |

---

## 📋 Requisitos

- Python **3.12** ou superior
- Backend rodando em `API_BASE_URL` com o endpoint `/resume/analyze`

---

## 👨‍💻 Autor

**Ramon Godinho**  
🌐 [portfolioramondev.com.br](https://www.portfolioramondev.com.br)  
📂 [GitHub](https://github.com/Ramon1337)
