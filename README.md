# 🔍 GoldenEra Scan

**GoldenEra Scan** is a high-performance, web-based blockchain explorer for the **GoldenEra blockchain**. It provides a real-time, user-friendly interface to browse blocks, transactions, addresses, and network statistics.

## ✨ Features

- 🧱 **Block Explorer** - Real-time view of latest blocks and their details.
- 💸 **Transaction Tracking** - Track all transfers and their details.
- 🌐 **Address Analysis** - View balances, transaction history, and token holdings for any address.
- 🪙 **Token Support** - Browse and search for native and custom tokens.
- ⚡ **Real-time Mempool** - Monitor pending transactions before they are confirmed.
- 📱 **Responsive Design** - Fully optimized for desktop, tablet, and mobile browsers.

---

## 🛠 Prerequisites

- **Docker** and **Docker Compose** plugin installed.
- Access to a **GoldenEra Node** API.

---

## 🚀 Quick Start

### 1. Create Project Directory

```bash
mkdir scan && cd scan
```

### 2. Create `docker-compose.yml`

```yaml
services:
  goldenera-scan:
    image: ghcr.io/goldeneraglobal/goldenera-scan:latest
    container_name: goldenera_scan
    restart: unless-stopped
    pull_policy: always
    env_file:
      - .env
    ports:
      - '${LISTEN_PORT:-3000}:3000'
    networks:
      - goldenera_network

networks:
  goldenera_network:
    driver: bridge
    name: goldenera_network
```

### 3. Configure Environment

Create a `.env` file with your node connection details:

```dotenv
# Node Connection
NODE_API_URL="https://your-node-api.example.com"
NODE_API_KEY="your_node_api_key"

# App Configuration
APP_NAME="GoldenEra Scan"
LISTEN_PORT=3000
```

### 4. Run the Explorer

```bash
docker compose up -d
```

Access the explorer at: **http://localhost:3000**

---

## 🏗 Tech Stack

The application is built using modern, type-safe technologies:

- **Framework:** [TanStack Start](https://tanstack.com/start) (React + TanStack Router + Nitro)
- **Bundler:** [Vite](https://vitejs.dev/)
- **UI & Styling:** [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Internalization:** [Inlang Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglide-js)
- **Server:** [Nitro](https://nitro.unjs.io/)

---

## 🔧 Development

### Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

### Refresh the Explorer API client

Build the local node image first, then refresh the checked-in OpenAPI document
and generated TypeScript client from the running image:

```bash
cd ../goldenera-node
IMAGE_TAG=goldenera-node:sandbox-local ./scripts/build-sandbox-image.sh

cd ../goldenera-scan
pnpm update:api
```

The update command starts isolated node and PostgreSQL containers, follows the
node logs until Spring is ready, downloads `/v3/api-docs/Explorer%20API`, runs
the API generator, and removes all temporary Docker resources. Override
`NODE_IMAGE` or `POSTGRES_IMAGE` when using different local image names.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
