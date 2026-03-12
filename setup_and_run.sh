#!/bin/bash

# Blockchain Secure Medical Data - Setup & Run Script (Mac/Linux)

echo "==========================================================="
echo "  Blockchain Secure Medical Data - Setup & Run Script"
echo "==========================================================="
echo ""
echo "This script will open VS Code terminals for each service"
echo ""

# Get the project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

# Create VS Code tasks configuration for running the services
if [ ! -d ".vscode" ]; then
    mkdir ".vscode"
fi

# Create tasks.json for VS Code terminal integration
cat > ".vscode/tasks.json" <<EOL
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "1. Hardhat Blockchain",
            "type": "shell",
            "command": "npx hardhat node",
            "options": {
                "cwd": "\${workspaceFolder}/backend/blockchain"
            },
            "isBackground": true,
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "2. Deploy Contracts",
            "type": "shell",
            "command": "sleep 5 && npx hardhat run scripts/deploy.js --network localhost",
            "options": {
                "cwd": "\${workspaceFolder}/backend/blockchain"
            },
            "isBackground": false,
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "3. Backend (Node.js)",
            "type": "shell",
            "command": "npm start",
            "options": {
                "cwd": "\${workspaceFolder}/backend"
            },
            "isBackground": true,
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "4. Frontend (Next.js)",
            "type": "shell",
            "command": "npm run dev",
            "options": {
                "cwd": "\${workspaceFolder}"
            },
            "isBackground": true,
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated",
                "group": "services"
            }
        },
        {
            "label": "Start All Services",
            "dependsOn": [
                "1. Hardhat Blockchain",
                "2. Deploy Contracts",
                "3. Backend (Node.js)",
                "4. Frontend (Next.js)"
            ],
            "dependsOrder": "sequence",
            "problemMatcher": [],
            "presentation": {
                "reveal": "always"
            }
        },
        {
            "label": "Install Dependencies",
            "type": "shell",
            "command": "cd backend/blockchain && npm install && cd ../.. && cd backend && npm install && cd .. && npm install",
            "options": {
                "cwd": "\${workspaceFolder}"
            },
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "dedicated"
            }
        }
    ]
}
EOL

echo "[OK] VS Code tasks.json created!"
echo ""

# Check if code command is available
if ! command -v code &> /dev/null; then
    echo "[WARNING] 'code' command not found in PATH."
    echo "   Please ensure VS Code is installed and added to PATH."
    echo ""
    echo "   After fixing, you can run services manually with:"
    echo "      VS Code: Terminal > Run Task > Start All Services"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "[WARNING] MongoDB not found!"
    echo "   Please install MongoDB:"
    echo "   Mac: brew install mongodb-community"
    echo "   Ubuntu: sudo apt-get install mongodb"
    echo ""
    echo "   Then start MongoDB:"
    echo "   Mac: brew services start mongodb-community"
    echo "   Ubuntu: sudo systemctl start mongodb"
    echo ""
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found!"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/3] Checking dependencies..."

# Blockchain dependencies
if [ ! -d "backend/blockchain/node_modules" ]; then
    echo "Installing Blockchain dependencies (Hardhat)..."
    cd backend/blockchain
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Blockchain dependencies failed to install."
        exit 1
    fi
    cd ../..
fi

# Backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing Backend dependencies..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Backend dependencies failed to install."
        exit 1
    fi
    cd ..
fi

# Frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Frontend dependencies failed to install."
        exit 1
    fi
fi

echo ""
echo "[2/3] Checking MongoDB connection..."

# Try to connect to MongoDB
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.version()" --quiet mongodb://127.0.0.1:27017/medical_chain &> /dev/null
    if [ $? -ne 0 ]; then
        echo "[WARNING] Could not connect to MongoDB at mongodb://127.0.0.1:27017"
        echo "   Make sure MongoDB is running before starting the backend."
    else
        echo "[OK] MongoDB is running!"
    fi
elif command -v mongo &> /dev/null; then
    mongo --eval "db.version()" --quiet mongodb://127.0.0.1:27017/medical_chain &> /dev/null
    if [ $? -ne 0 ]; then
        echo "[WARNING] Could not connect to MongoDB at mongodb://127.0.0.1:27017"
        echo "   Make sure MongoDB is running before starting the backend."
    else
        echo "[OK] MongoDB is running!"
    fi
else
    echo "[WARNING] MongoDB client not found. Cannot verify connection."
fi

echo ""
echo "[3/3] Opening VS Code..."

# Open VS Code in the project folder
code "$PROJECT_ROOT"

echo ""
echo "[OK] VS Code is now open with your project!"
echo ""
echo "  TO START ALL SERVICES:"
echo "  -----------------------------------------------------"
echo "  Option 1 (Recommended):"
echo "    Press: Ctrl+Shift+P (Cmd+Shift+P on Mac)"
echo "    Type:  \"Tasks: Run Task\""
echo "    Select: \"Start All Services\""
echo ""
echo "  This will start in sequence:"
echo "    1. Hardhat Blockchain (localhost:8545)"
echo "    2. Deploy Smart Contracts"
echo "    3. Backend Server (localhost:5000)"
echo "    4. Frontend (localhost:3000)"
echo ""
echo "  Option 2 (Individual terminals):"
echo "    Press: Ctrl+\` (backtick) to open new terminal"
echo "    Run each service manually."
echo ""
echo "  IMPORTANT: Make sure MongoDB is running!"
echo "    Mac: brew services start mongodb-community"
echo "    Ubuntu: sudo systemctl start mongodb"
echo ""
read -p "Press Enter to finish..."
