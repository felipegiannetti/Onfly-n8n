# Conector Random para n8n

Conector personalizado do n8n que encapsula a API do Random.org para gerar números inteiros verdadeiramente aleatórios. O repositório inclui um ambiente Docker Compose com n8n e PostgreSQL já configurados para carregar o node automaticamente.

## Requisitos
- Node.js 22+ (LTS)
- npm 10+
- Docker Engine 24+ e Docker Compose v2

## Estrutura do projeto
```
.
├─ n8n-random-connector/
│  ├─ docker-compose.yml            # Stack com n8n 1.85.4 + PostgreSQL e volumes
│  ├─ .env.example                  # Template das variáveis de ambiente
│  └─ custom/
│     └─ n8n-nodes-random/
│        ├─ package.json            # Metadados do node (author, deps, scripts)
│        ├─ tsconfig.json           # Configuração do TypeScript (outDir: dist)
│        ├─ resources/
│        │  └─ random.svg           # Ícone utilizado no editor do n8n
│        ├─ src/
│        │  └─ Random.node.ts       # Implementação da operação "True Random Number Generator"
│        ├─ dist/                   # Saída compilada (gerada pelo build)
│        └─ test/
│           └─ random.node.test.js  # Testes de integração simples
└─ README.md                        # Este arquivo
```

## Passo a passo

### 1) Copie o arquivo de variáveis padrão (na pasta n8n-random-connector)

PowerShell (Windows):
```powershell
cd .\n8n-random-connector
Copy-Item .env.example .env
```

### 2) Instale as dependências do node customizado (na pasta do pacote)
```powershell
cd .\custom\n8n-nodes-random
npm install
```

### 3) Compile o node (gera a pasta dist/ e copia os recursos)
```powershell
npm run build
```

### 4) Execute o n8n localmente com Docker (na pasta n8n-random-connector)
```powershell
cd ..\..   # volta para n8n-random-connector
docker compose up -d
```

### 5) Acesse o painel do n8n em http://localhost:5678
- No editor de workflows, busque pelo node "Random" e selecione a operação "True Random Number Generator".
- Informe os inteiros Min e Max (inclusive) para gerar um número via Random.org.

## Segurança (local vs. produção)
- As credenciais e chaves em .env.example são apenas para desenvolvimento local.
- Em produção, defina valores fortes para:
	- N8N_BASIC_AUTH_USER e N8N_BASIC_AUTH_PASSWORD (se usar basic auth)
	- N8N_ENCRYPTION_KEY (obrigatória para criptografia segura no n8n)
	- Variáveis de banco (host, user, password, database)

## Configuração do ambiente
- Arquivo .env (baseado em .env.example) define as variáveis do n8n e do PostgreSQL.
- O docker-compose.yml monta a pasta local `./custom` em `/home/node/.n8n/custom` no container do n8n, e o n8n carrega os nodes a partir dali (via N8N_CUSTOM_EXTENSIONS).
- O banco PostgreSQL é provisionado automaticamente conforme as variáveis do .env.

## Fluxo de desenvolvimento
- Recompile após qualquer alteração em `src/Random.node.ts`:
```powershell
cd .\n8n-random-connector\custom\n8n-nodes-random
npm run build
```
- Reinicie o contêiner do n8n para recarregar o node compilado:
```powershell
cd ..\..\
docker compose restart n8n
```
- No navegador, faça um hard refresh (Ctrl+F5) no editor para aparecer/atualizar o node.
- Dica: para compilar em modo "watch":
```powershell
npm run dev
```

## Executar os testes
- Os testes são de integração e chamam o Random.org de verdade. É necessário estar online.
	Importante: os caminhos abaixo são relativos à raiz do repositório `Onfly-n8n`.
	- Se você já está na raiz do repositório (`Onfly-n8n`), use:
		```powershell
		cd .\n8n-random-connector\custom\n8n-nodes-random
		```
```powershell
npm test
```
- Nota (TLS nos testes): para evitar o erro SELF_SIGNED_CERT_IN_CHAIN em redes com proxy/inspeção SSL, adicionamos um setup que desabilita a validação de certificado somente durante os testes. Obs: Não utilize isso em produção.
	- Arquivo: custom/n8n-nodes-random/test/setup.js
	- Importado em: custom/n8n-nodes-random/test/random.node.test.js

## Integração com Random.org
- A operação realiza um GET para `https://www.random.org/integers/` com `num=1`, repassando os limites Min/Max e solicitando retorno em texto puro.
- O resultado é validado para garantir que o payload seja um inteiro; respostas inválidas disparam erro e o node falha no workflow.

## Comandos úteis
- Acompanhar logs do n8n:
```powershell
docker compose logs -f n8n
```
- Reiniciar apenas o n8n:
```powershell
docker compose restart n8n
```
- Encerrar a stack:
```powershell
docker compose down
```
- Encerrar e remover volumes (reset total):
```powershell
docker compose down -v
```
- Limpar artefatos compilados do node:
```powershell
cd .\n8n-random-connector\custom\n8n-nodes-random
npm run clean
```

## Observações
- Min = Max é permitido; o node só falha se `Min > Max` (mensagem: "Min must be less than Max").
- O node usa `fetch` no runtime do n8n; não requer credenciais.
- Em ambientes corporativos com restrição de rede, garanta que o container tenha saída para `random.org`.

## Autor
Felipe Giannetti Fontenelle
