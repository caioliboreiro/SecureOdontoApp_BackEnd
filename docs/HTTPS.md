# HTTPS — Configuração Local (Self-Signed Certificate)

Este documento descreve como habilitar HTTPS na aplicação OdontoApp BackEnd em ambiente de desenvolvimento, utilizando um certificado autoassinado.

---

## Sumário

1. [Pré-requisitos](#pré-requisitos)
2. [Gerar o certificado](#gerar-o-certificado)
3. [Configurar variáveis de ambiente](#configurar-variáveis-de-ambiente)
4. [Executar com HTTPS](#executar-com-https)
5. [Fazer o navegador confiar no certificado](#fazer-o-navegador-confiar-no-certificado)
6. [Como funciona a implementação](#como-funciona-a-implementação)
7. [Produção](#produção)
8. [Renovar o certificado](#renovar-o-certificado)

---

## Pré-requisitos

- [OpenSSL](https://slproweb.com/products/Win32OpenSSL.html) instalado e disponível no PATH  
  Verificar: `openssl version`
- Node.js 18+

---

## Gerar o certificado

Execute o script fornecido a partir da raiz do projeto:

```bash
bash scripts/generate-cert.sh
```

Ou rode o comando OpenSSL diretamente:

```bash
# Windows (Git Bash / WSL)
MSYS_NO_PATHCONV=1 openssl req -x509 \
  -newkey rsa:4096 \
  -keyout certs/server.key \
  -out    certs/server.crt \
  -days   365 \
  -nodes \
  -subj   "//CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"
```

Os arquivos gerados ficam em `certs/` (ignorado pelo `.gitignore` — **nunca commitar chaves privadas**):

```
certs/
├── server.crt   ← certificado público
└── server.key   ← chave privada (manter em segredo)
```

> O atributo `subjectAltName` é obrigatório para que navegadores modernos aceitem o certificado. Sem ele, Chrome e Firefox rejeitam mesmo após a importação manual.

---

## Configurar variáveis de ambiente

Adicione ao arquivo `.env`:

```dotenv
HTTPS_ENABLED=true
SSL_CERT_PATH=./certs/server.crt
SSL_KEY_PATH=./certs/server.key
```

| Variável         | Tipo    | Padrão                  | Descrição                             |
|------------------|---------|-------------------------|---------------------------------------|
| `HTTPS_ENABLED`  | boolean | `false`                 | Ativa o servidor HTTPS                |
| `SSL_CERT_PATH`  | string  | `./certs/server.crt`    | Caminho para o certificado            |
| `SSL_KEY_PATH`   | string  | `./certs/server.key`    | Caminho para a chave privada          |

Quando `HTTPS_ENABLED=false` (padrão), a aplicação continua rodando em HTTP normalmente.

---

## Executar com HTTPS

```bash
npm run dev
```

A saída esperada é:

```
🚀 https server running at https://localhost:3333
```

Acesse: [https://localhost:3333/docs](https://localhost:3333/docs)

---

## Fazer o navegador confiar no certificado

Por padrão, navegadores bloqueiam certificados autoassinados. Para remover o aviso de segurança, importe o certificado como **Autoridade Certificadora Raiz Confiável** no seu sistema operacional.

### Windows

```powershell
# Executar como Administrador no PowerShell
certutil -addstore -f "ROOT" certs\server.crt
```

Para remover depois:

```powershell
certutil -delstore "ROOT" "localhost"
```

### macOS

```bash
sudo security add-trusted-cert \
  -d -r trustRoot \
  -k /Library/Keychains/System.keychain \
  certs/server.crt
```

Para remover depois:

```bash
sudo security delete-certificate -c "localhost" /Library/Keychains/System.keychain
```

### Linux (Ubuntu/Debian)

```bash
sudo cp certs/server.crt /usr/local/share/ca-certificates/odonto-app.crt
sudo update-ca-certificates
```

Para remover depois:

```bash
sudo rm /usr/local/share/ca-certificates/odonto-app.crt
sudo update-ca-certificates --fresh
```

### Firefox (independente de OS)

O Firefox possui sua própria loja de certificados. Além do comando de sistema acima, acesse:

`about:preferences#privacy` → **Certificados** → **Ver Certificados** → aba **Autoridades** → **Importar** → selecione `certs/server.crt` → marque "Confiar para identificar sites".

---

## Como funciona a implementação

### `src/env/index.ts`

Três variáveis foram adicionadas ao schema Zod:

```typescript
HTTPS_ENABLED: z.coerce.boolean().default(false),
SSL_CERT_PATH: z.string().default('./certs/server.crt'),
SSL_KEY_PATH:  z.string().default('./certs/server.key'),
```

### `src/app.ts`

O Fastify é inicializado com as opções TLS quando `HTTPS_ENABLED=true`:

```typescript
const fastifyOpts = env.HTTPS_ENABLED
  ? {
      https: {
        key:  readFileSync(env.SSL_KEY_PATH),
        cert: readFileSync(env.SSL_CERT_PATH),
      },
    }
  : {}

export const app = fastify(fastifyOpts as any).withTypeProvider<ZodTypeProvider>()
```

> O `as any` é necessário porque o TypeScript possui overloads distintos para `FastifyHttpOptions` e `FastifyHttpsOptions`. Neste caso, o cast é seguro — o Fastify resolve internamente o tipo de servidor com base na presença da propriedade `https`.

### `src/server.ts`

O log de inicialização exibe o protocolo correto:

```typescript
const protocol = env.HTTPS_ENABLED ? 'https' : 'http'
console.log(`🚀 ${protocol} server running at ${protocol}://localhost:${env.PORT}`)
```

---

## Produção

Em produção, **não use certificados autoassinados**. A infraestrutura do projeto já utiliza um reverse proxy externo (`proxy_network` no Docker Compose), que é o lugar correto para terminar TLS com um certificado válido (ex: Let's Encrypt via Traefik ou Nginx Proxy Manager).

Mantenha `HTTPS_ENABLED=false` nas variáveis de produção para que o Node.js receba requisições em HTTP interno do proxy.

---

## Renovar o certificado

O certificado tem validade de **365 dias**. Para renovar, delete os arquivos antigos e execute novamente o script:

```bash
rm certs/server.crt certs/server.key
bash scripts/generate-cert.sh
```

Após renovar, repita o processo de [importação no navegador](#fazer-o-navegador-confiar-no-certificado) com o novo certificado.
