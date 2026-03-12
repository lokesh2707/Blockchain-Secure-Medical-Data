# Blockchain Secure Medical Data

A secure medical data management system built with Next.js, Node.js, MongoDB, and Ethereum blockchain using Hardhat.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### One-Command Setup

**Mac/Linux:**
```bash
chmod +x setup_and_run.sh
./setup_and_run.sh
```

**Windows:**
```cmd
setup_and_run.bat
```

The script will:
1. ✅ Install all dependencies (Frontend, Backend, Blockchain)
2. ✅ Create VS Code tasks for easy service management
3. ✅ Verify MongoDB connection
4. ✅ Open VS Code with the project

### Starting Services

After running the setup script, in VS Code:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: `Tasks: Run Task`
3. Select: `Start All Services`

This will start all four services in sequence:
- **Hardhat Blockchain** - localhost:8545
- **Smart Contract Deployment** - Deploys MedicalDataLedger contract
- **Backend Server** - localhost:5000
- **Frontend** - localhost:3000

## 📋 Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install

# Blockchain dependencies
cd blockchain
npm install
cd ../..
```

### 2. Start MongoDB

**Mac:**
```bash
brew services start mongodb-community
```

**Windows:**
- Start MongoDB service from Services panel, or
- Run `mongod` in a terminal

**Linux:**
```bash
sudo systemctl start mongodb
```

### 3. Start Services (in separate terminals)

**Terminal 1 - Hardhat Blockchain:**
```bash
cd backend/blockchain
npx hardhat node
```

**Terminal 2 - Deploy Contracts:**
```bash
cd backend/blockchain
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Backend:**
```bash
cd backend
npm start
```

**Terminal 4 - Frontend:**
```bash
npm run dev
```

## 🏗️ Project Architecture

```
blockchain-secure-medical-data/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility functions
├── public/                 # Static assets
├── backend/
│   ├── blockchain/
│   │   ├── contracts/      # Solidity smart contracts
│   │   ├── scripts/        # Deployment scripts
│   │   └── hardhat.config.js
│   ├── server.js           # Express backend
│   └── .env                # Environment variables
├── setup_and_run.sh        # Mac/Linux setup script
└── setup_and_run.bat       # Windows setup script
```

## 🔧 Technology Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, MongoDB, JWT Authentication
- **Blockchain**: Hardhat, Solidity, Ethereum
- **Smart Contract**: MedicalDataLedger for secure record management

## 🌐 Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Hardhat Blockchain**: http://localhost:8545
- **MongoDB**: mongodb://127.0.0.1:27017/medical_chain

## 📝 Environment Variables

The backend uses the following environment variables (`.env`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medical_chain
JWT_SECRET=supersecretkey
```

## 🔐 Features

- User authentication (Patient, Doctor, Researcher roles)
- Secure medical record upload and storage
- Blockchain-based data integrity verification
- Consent management for data sharing
- Real-time blockchain ledger tracking
- Encrypted file storage

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Solidity Documentation](https://docs.soliditylang.org/)

