# Sheclk AI Agent

> 🚀 Autonomous AI Agent on Solana — powered by OOBE Protocol & AceDataCloud
>
> Registered on Synapse Agent Protocol (SAP) mainnet with on-chain AI capabilities.

## Overview

Sheclk AI Agent is an autonomous on-chain AI agent that runs on the Solana blockchain via the Synapse Agent Protocol (SAP). It discovers tools through the SAP network, executes AI tasks using AceDataCloud services, and runs continuously as a systemd daemon — all without human intervention.

### Key Features

- **On-Chain Registration** — Registered on SAP mainnet with discoverable capabilities
- **3 AI Services** — Chat (GPT-4o-mini), Image Generation (DALL-E 3), Text Embedding
- **SAP Tool Discovery** — Discovers tools and agents via the SAP network registry
- **Fully Autonomous** — systemd daemon runs every 5 minutes, checks balance, queries SAP, executes AI tasks
- **Open Source** — MIT License

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Sheclk AI Agent                           │
├────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Chat   │  │  Image   │  │Embedding │  │   SAP    │   │
│  │ (GPT-4o) │  │(DALL-E 3)│  │(text-3)  │  │Discovery │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴──────────────┘        │
│                       │                                    │
│              ┌────────┴────────┐                           │
│              │ AceDataCloud API │                          │
│              └────────┬────────┘                           │
│                       │                                    │
│              ┌────────┴────────┐                           │
│              │  SAP Mainnet    │                           │
│              │ (Solana Chain)  │                           │
│              └─────────────────┘                           │
└────────────────────────────────────────────────────────────┘
```

## Solana Integration

- **Network**: Solana Mainnet-Beta
- **Protocol**: Synapse Agent Protocol (SAP)
- **Agent PDA**: `5caF2hZGtk2C4b8cJe6Pc3yKEyRXvcnh1641A8pDLtPT`
- **Wallet**: `ds4N6jPQa599ni2839n4eJ7kDS4axzFxcDXP8uXk9ZQ`
- **Registration TX**: [View on Solscan](https://solscan.io/tx/3qxXdsw6n8AcWsoTtKJXSo9Dss7HaEBmeh4GWxfZ3P7jmTRbhSPciwFQpdYq1694C23Usj7hPj4s13bfpQ5qsWe4)

The agent:
1. Registers on SAP mainnet with on-chain identity and capabilities
2. Discovers other agents and tools via the SAP Discovery registry
3. Publishes tool descriptors for its AI services
4. Plans to support x402 payment workflows for autonomous payments

## Agent Autonomy

The agent operates with **limited human involvement**:

| Aspect | Implementation |
|--------|---------------|
| **Trigger** | systemd timer — starts on boot, runs continuously |
| **Execution** | Every 5 minutes: check wallet → query SAP network → execute AI tasks → log results |
| **Decision Making** | Tool discovery via SAP registry, capability-based agent selection |
| **Error Handling** | Automatic restart on crash, exception logging with full stack traces |
| **Payments** | x402 protocol integration planned for autonomous payment settlement |

## AceDataCloud Services Used

The agent uses 3 distinct AceDataCloud services via their unified API:

| Service | Model | Purpose |
|---------|-------|---------|
| Chat Completion | `gpt-4o-mini` | Crypto market sentiment analysis |
| Image Generation | `dall-e-3` | Market visualization cards |
| Text Embedding | `text-embedding-3-small` | Semantic search and memory |

## Prerequisites

- Node.js >= 18
- Solana wallet with a small amount of SOL for transaction fees
- AceDataCloud API key (free credits available on signup)

## Installation

```bash
git clone https://github.com/sheclk68/sheclk-ai-agent.git
cd sheclk-ai-agent
npm install
```

## Configuration

Edit `agent-daemon.js` and set your credentials:

```js
const ACEDATA_KEY = "your-acedata-cloud-api-key";
const PRIVATE_KEY = "your-solana-wallet-private-key-base58";
```

## Running

### One-time run
```bash
node agent-daemon.js
```

### As a systemd service
```bash
sudo cp oobe-agent.service /etc/systemd/system/
sudo systemctl enable oobe-agent
sudo systemctl start oobe-agent
```

## SAP Registration

```bash
node register-sap.cjs
```

## Tool Registration (requires SOL for fees)

```bash
node register-tools.cjs
```

## Tool Discovery

```bash
node tool-discoverer.js
```

## Demo

Live dashboard: [http://168.144.37.63/oobe](http://168.144.37.63/oobe)

## Project Structure

```
├── agent-daemon.js       # Main daemon — runs every 5 min
├── tool-discoverer.js    # SAP network tool discovery module
├── register-sap.cjs      # SAP mainnet registration
├── register-tools.cjs    # Tool descriptor registration
├── agent.js              # One-shot agent test
├── demo.html             # Web demo page
├── agent-data.json       # Agent metadata
└── synapse-sap-sdk/      # SAP SDK (git submodule)
```

## License

MIT
