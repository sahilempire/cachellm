<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/cachellm-white?style=for-the-badge&labelColor=000&color=000&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeD0iNCIgeT0iMTgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXdlaWdodD0iYm9sZCI+Qzwv dGV4dD48L3N2Zz4=">
    <img alt="cachellm" src="https://img.shields.io/badge/cachellm-black?style=for-the-badge&labelColor=fff&color=fff">
  </picture>
</p>

<h3 align="center">Suas chamadas de LLM estão desperdiçando dinheiro. Corrija em uma linha.</h3>

<p align="center">
  Envolve seu cliente Anthropic / OpenAI / Gemini SDK. Analisa estabilidade de prompts.<br>
  Injeta pontos de cache automaticamente. <b>Reduz custos de API 60-90%.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/cachellm"><img src="https://img.shields.io/npm/v/cachellm?style=flat&color=cb3837" alt="versão npm"></a>&nbsp;
  <a href="https://pypi.org/project/cachellm-py/"><img src="https://img.shields.io/pypi/v/cachellm-py?style=flat&color=3775A9" alt="versão PyPI"></a>&nbsp;
  <a href="https://www.npmjs.com/package/cachellm"><img src="https://img.shields.io/npm/dw/cachellm?style=flat&color=black" alt="downloads semanais"></a>&nbsp;
  <a href="https://bundlephobia.com/package/cachellm"><img src="https://img.shields.io/bundlephobia/minzip/cachellm?style=flat&color=green" alt="tamanho do bundle"></a>&nbsp;
  <a href="https://github.com/sahilempire/cachellm/actions"><img src="https://img.shields.io/github/actions/workflow/status/sahilempire/cachellm/ci.yml?style=flat&label=testes" alt="CI"></a>&nbsp;
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat" alt="licença"></a>&nbsp;
  <a href="https://github.com/sahilempire/cachellm"><img src="https://img.shields.io/badge/TypeScript-strict-blue?style=flat" alt="TypeScript"></a>&nbsp;
  <a href="https://github.com/sahilempire/cachellm"><img src="https://img.shields.io/github/stars/sahilempire/cachellm?style=flat" alt="estrelas"></a>
</p>

<p align="center">
  <a href="#instalar">Instalar</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#início-rápido">Início Rápido</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#como-funciona">Como Funciona</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#suporte-a-provedores">Provedores</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#configuração">Configuração</a>
</p>

<br>

```typescript
// antes — você paga preço integral pelos mesmos tokens em cada chamada
const client = new Anthropic()

// depois — mesma API, mesmos tipos, 90% menos em tokens em cache
const client = optimizeAnthropic(new Anthropic())
```

<br>

> **$900/mês → $135/mês** — baseado em 10K req/dia com prompt de sistema de 3K tokens no Claude Sonnet.
> Seu prompt de sistema, schemas de ferramentas e mensagens anteriores são cacheados automaticamente.
> Você só paga o preço integral pelo que realmente muda.

<br>

---

## O Problema

Toda vez que você chama Claude ou GPT, envia os mesmos tokens repetidamente:

```
Chamada 1:  [Prompt do sistema: 2000 tokens] + "receita de pasta"     → você paga por 2000 + consulta
Chamada 2:  [Prompt do sistema: 2000 tokens] + "receita de biryani"   → você paga por 2000 + consulta de novo
Chamada 3:  [Prompt do sistema: 2000 tokens] + "receita de dosa"      → novamente...
```

Você está pagando o preço integral pelas **mesmas instruções** em cada solicitação.

Anthropic e OpenAI ambos suportam cache de prompts (até **90% de desconto** em tokens em cache), mas configurar isso corretamente é manual, tedioso e fácil de errar.

**cachellm faz isso por você. Automaticamente. Em uma linha.**

---

## Instalar

```bash
npm install cachellm        # node / typescript
pip install cachellm-py     # python
```

---

## Início Rápido

### Node.js / TypeScript

#### Anthropic (Claude) — economiza até 90%

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { optimizeAnthropic } from 'cachellm'

// envolva seu cliente — essa é a única mudança
const client = optimizeAnthropic(new Anthropic())

// tudo mais funciona exatamente igual
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: 'Você é um assistente de culinária útil que conhece todas as receitas de todas as cozinhas...',
  messages: [{ role: 'user', content: 'Como faço biryani?' }],
})

// veja quanto você economizou
client.printStats()
```

#### OpenAI (GPT) — economiza até 50%

```typescript
import OpenAI from 'openai'
import { optimizeOpenAI } from 'cachellm'

const client = optimizeOpenAI(new OpenAI())

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Você é um assistente útil...' },
    { role: 'user', content: 'Olá' },
  ],
})

client.printStats()
```

### Python

#### Anthropic (Claude)

```python
from anthropic import Anthropic
from cachellm import optimize_anthropic

client = optimize_anthropic(Anthropic())

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="Você é um assistente de culinária útil...",
    messages=[{"role": "user", "content": "Como faço biryani?"}],
)

client.print_stats()
```

#### OpenAI (GPT)

```python
from openai import OpenAI
from cachellm import optimize_openai

client = optimize_openai(OpenAI())

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Você é um assistente útil..."},
        {"role": "user", "content": "Olá"},
    ],
)

client.print_stats()
```

---

## Como Funciona

1. **Analisar** — escaneia sua estrutura de prompt, identifica instruções do sistema, schemas de ferramentas e histórico de conversa
2. **Pontuar** — avalia cada segmento por estabilidade usando hashing de conteúdo e heurísticas posicionais
3. **Injetar** — coloca pontos de quebra `cache_control` em posições ideais (Anthropic) ou reordena mensagens para correspondência de prefixo (OpenAI)
4. **Rastrear** — monitora taxas de acerto de cache, contagens de tokens e calcula economias reais em dólares

---

## Suporte a Provedores

| Provedor | Método | Economia | Tokens Mín | TTL |
|:---------|:-------|:--------|:-----------|:----|
| **Anthropic** (Claude) | injeção `cache_control` | até 90% | 1,024 | 5min / 1hr |
| **OpenAI** (GPT) | reordenação de prefixo | até 50% | 1,024 | 5-10min |
| **Gemini** | gerenciamento de objeto em cache | até 90% | 32,768 | configurável |

---

## Economia de Custos

| Escala | Sem | Com cachellm | Economizado/dia |
|:------|:--------|:--------------|:----------|
| 100 req/dia | $9.00 | $1.35 | $7.65 |
| 500 req/dia | $45.00 | $6.75 | $38.25 |
| 1,000 req/dia | $90.00 | $13.50 | $76.50 |
| 10,000 req/dia | $900 | $135 | $765 |

*Baseado em prompt de sistema de 3K tokens, Claude Sonnet, taxa de acerto de cache de 90%*

---

## Configuração

<details>
<summary><b>TypeScript</b></summary>

```typescript
const client = optimizeAnthropic(new Anthropic(), {
  strategy: 'auto',
  maxBreakpoints: 4,
  ttl: '5m',
  minTokens: 1024,
  debug: false,
  onOptimize: (event) => {
    console.log(`colocados ${event.breakpointsPlaced} pontos de quebra`)
  },
})
```

</details>

<details>
<summary><b>Python</b></summary>

```python
from cachellm import optimize_anthropic
from cachellm.types import AnthropicCacheOptions

client = optimize_anthropic(Anthropic(), AnthropicCacheOptions(
    strategy="auto",
    max_breakpoints=4,
    ttl="5m",
    min_tokens=1024,
    debug=False,
))
```

</details>

---

## Princípios de Design

- **Zero dependências** — sem tiktoken (3MB), sem Redis, sem serviços externos. A estimação de tokens usa uma heurística rápida.
- **Zero infraestrutura** — tudo é executado em processo. Sem proxy, sem banco de dados, sem arquivos de configuração.
- **Zero mudanças de código** — envolve seu cliente existente. Todos os métodos, propriedades e tipos funcionam sem mudanças.
- **< 15KB comprimido** — menor do que a maioria dos favicons.

---

## Contribuindo

Contribuições são bem-vindas! Verifique os [problemas abertos](https://github.com/sahilempire/cachellm/issues) — qualquer coisa etiquetada como `good first issue` é um ótimo lugar para começar.

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para configuração de desenvolvimento.

---

## Licença

[MIT](./LICENSE)
