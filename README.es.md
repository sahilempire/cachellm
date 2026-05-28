<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/cachellm-white?style=for-the-badge&labelColor=000&color=000&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeD0iNCIgeT0iMTgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXdlaWdodD0iYm9sZCI+Qzwv dGV4dD48L3N2Zz4=">
    <img alt="cachellm" src="https://img.shields.io/badge/cachellm-black?style=for-the-badge&labelColor=fff&color=fff">
  </picture>
</p>

<h3 align="center">Tus llamadas a LLM están desperdiciando dinero. Arréglalo en una línea.</h3>

<p align="center">
  Envuelve tu cliente de Anthropic / OpenAI / Gemini SDK. Analiza la estabilidad de prompts.<br>
  Inyecta puntos de caché automáticamente. <b>Reduce costos de API 60-90%.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/cachellm"><img src="https://img.shields.io/npm/v/cachellm?style=flat&color=cb3837" alt="versión npm"></a>&nbsp;
  <a href="https://pypi.org/project/cachellm-py/"><img src="https://img.shields.io/pypi/v/cachellm-py?style=flat&color=3775A9" alt="versión PyPI"></a>&nbsp;
  <a href="https://www.npmjs.com/package/cachellm"><img src="https://img.shields.io/npm/dw/cachellm?style=flat&color=black" alt="descargas semanales"></a>&nbsp;
  <a href="https://bundlephobia.com/package/cachellm"><img src="https://img.shields.io/bundlephobia/minzip/cachellm?style=flat&color=green" alt="tamaño del paquete"></a>&nbsp;
  <a href="https://github.com/sahilempire/cachellm/actions"><img src="https://img.shields.io/github/actions/workflow/status/sahilempire/cachellm/ci.yml?style=flat&label=pruebas" alt="CI"></a>&nbsp;
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat" alt="licencia"></a>&nbsp;
  <a href="https://github.com/sahilempire/cachellm"><img src="https://img.shields.io/badge/TypeScript-strict-blue?style=flat" alt="TypeScript"></a>&nbsp;
  <a href="https://github.com/sahilempire/cachellm"><img src="https://img.shields.io/github/stars/sahilempire/cachellm?style=flat" alt="estrellas"></a>
</p>

<p align="center">
  <a href="#instalar">Instalar</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#inicio-rápido">Inicio Rápido</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#cómo-funciona">Cómo Funciona</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#proveedores-soportados">Proveedores</a>&nbsp;&nbsp;&bull;&nbsp;&nbsp;<a href="#configuración">Configuración</a>
</p>

<br>

```typescript
// antes — pagas precio completo por los mismos tokens cada llamada
const client = new Anthropic()

// después — misma API, mismos tipos, 90% menos en tokens en caché
const client = optimizeAnthropic(new Anthropic())
```

<br>

> **$900/mes → $135/mes** — basado en 10K req/día con prompt de sistema de 3K tokens en Claude Sonnet.
> Tu prompt de sistema, esquemas de herramientas y mensajes anteriores se cachean automáticamente.
> Solo pagas precio completo por lo que realmente cambia.

<br>

---

## El Problema

Cada vez que llamas a Claude o GPT, envías los mismos tokens una y otra vez:

```
Llamada 1:  [Prompt del sistema: 2000 tokens] + "receta de pasta"     → pagas por 2000 + consulta
Llamada 2:  [Prompt del sistema: 2000 tokens] + "receta de biryani"   → pagas por 2000 + consulta de nuevo
Llamada 3:  [Prompt del sistema: 2000 tokens] + "receta de dosa"      → y de nuevo...
```

Estás pagando precio completo por las **mismas instrucciones** en cada solicitud.

Anthropic y OpenAI ambos soportan caché de prompts (hasta **90% de descuento** en tokens en caché), pero configurarlo correctamente es manual, tedioso y fácil de hacer mal.

**cachellm lo hace por ti. Automáticamente. En una línea.**

---

## Instalar

```bash
npm install cachellm        # node / typescript
pip install cachellm-py     # python
```

---

## Inicio Rápido

### Node.js / TypeScript

#### Anthropic (Claude) — ahorra hasta 90%

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { optimizeAnthropic } from 'cachellm'

// envuelve tu cliente — ese es el único cambio
const client = optimizeAnthropic(new Anthropic())

// todo lo demás sigue exactamente igual
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: 'Eres un asistente de cocina útil que conoce todas las recetas de todas las cocinas...',
  messages: [{ role: 'user', content: '¿Cómo hago biryani?' }],
})

// ve cuanto ahorraste
client.printStats()
```

#### OpenAI (GPT) — ahorra hasta 50%

```typescript
import OpenAI from 'openai'
import { optimizeOpenAI } from 'cachellm'

const client = optimizeOpenAI(new OpenAI())

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Eres un asistente útil...' },
    { role: 'user', content: 'Hola' },
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
    system="Eres un asistente de cocina útil...",
    messages=[{"role": "user", "content": "¿Cómo hago biryani?"}],
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
        {"role": "system", "content": "Eres un asistente útil..."},
        {"role": "user", "content": "Hola"},
    ],
)

client.print_stats()
```

---

## Cómo Funciona

1. **Analizar** — escanea tu estructura de prompt, identifica instrucciones del sistema, esquemas de herramientas e historial de conversación
2. **Puntuar** — califica cada segmento por estabilidad usando hashing de contenido y heurísticas posicionales
3. **Inyectar** — coloca puntos de quiebre de `cache_control` en posiciones óptimas (Anthropic) o reordena mensajes para coincidencia de prefijos (OpenAI)
4. **Rastrear** — monitorea tasas de acierto de caché, conteos de tokens y calcula ahorros reales en dólares

---

## Soporte de Proveedores

| Proveedor | Método | Ahorros | Tokens Mín | TTL |
|:---------|:-------|:--------|:-----------|:----|
| **Anthropic** (Claude) | inyección `cache_control` | hasta 90% | 1,024 | 5min / 1hr |
| **OpenAI** (GPT) | reordenamiento de prefijos | hasta 50% | 1,024 | 5-10min |
| **Gemini** | gestión de objetos en caché | hasta 90% | 32,768 | configurable |

---

## Ahorros de Costos

| Escala | Sin | Con cachellm | Ahorrado/día |
|:------|:--------|:--------------|:----------|
| 100 req/día | $9.00 | $1.35 | $7.65 |
| 500 req/día | $45.00 | $6.75 | $38.25 |
| 1,000 req/día | $90.00 | $13.50 | $76.50 |
| 10,000 req/día | $900 | $135 | $765 |

*Basado en prompt de sistema de 3K tokens, Claude Sonnet, tasa de acierto de caché del 90%*

---

## Configuración

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
    console.log(`colocados ${event.breakpointsPlaced} puntos de quiebre`)
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

## Principios de Diseño

- **Cero dependencias** — sin tiktoken (3MB), sin Redis, sin servicios externos. La estimación de tokens usa una heurística rápida.
- **Cero infraestructura** — todo se ejecuta en proceso. Sin proxy, sin base de datos, sin archivos de configuración.
- **Cero cambios de código** — envuelve tu cliente existente. Todos los métodos, propiedades y tipos pasan sin cambios.
- **< 15KB comprimido** — más pequeño que la mayoría de favicons.

---

## Contribuyendo

¡Las contribuciones son bienvenidas! Consulta los [problemas abiertos](https://github.com/sahilempire/cachellm/issues) — cualquier cosa etiquetada como `good first issue` es un gran lugar para empezar.

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para configuración de desarrollo.

---

## Licencia

[MIT](./LICENSE)
