@echo off
REM Blockchain Secure Medical Data - Setup & Run Script (Windows)

echo ===========================================================
echo   Blockchain Secure Medical Data - Setup ^& Run Script
echo ===========================================================
echo.
echo This script will open VS Code terminals for each service
echo.

REM Get the project root directory
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

REM Create VS Code tasks configuration for running the services
if not exist ".vscode" mkdir ".vscode"

REM Create tasks.json for VS Code terminal integration
(
echo {
echo     "version": "2.0.0",
echo     "tasks": [
echo         {
echo             "label": "1. Hardhat Blockchain",
echo             "type": "shell",
echo             "command": "npx hardhat node",
echo             "options": {
echo                 "cwd": "${workspaceFolder}/backend/blockchain"
echo             },
echo             "isBackground": true,
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated",
echo                 "group": "services"
echo             }
echo         },
echo         {
echo             "label": "2. Deploy Contracts",
echo             "type": "shell",
echo             "command": "timeout /t 5 /nobreak ^>nul ^&^& npx hardhat run scripts/deploy.js --network localhost",
echo             "options": {
echo                 "cwd": "${workspaceFolder}/backend/blockchain"
echo             },
echo             "isBackground": false,
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated",
echo                 "group": "services"
echo             }
echo         },
echo         {
echo             "label": "3. Backend (Node.js^)",
echo             "type": "shell",
echo             "command": "npm start",
echo             "options": {
echo                 "cwd": "${workspaceFolder}/backend"
echo             },
echo             "isBackground": true,
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated",
echo                 "group": "services"
echo             }
echo         },
echo         {
echo             "label": "4. Frontend (Next.js^)",
echo             "type": "shell",
echo             "command": "npm run dev",
echo             "options": {
echo                 "cwd": "${workspaceFolder}"
echo             },
echo             "isBackground": true,
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated",
echo                 "group": "services"
echo             }
echo         },
echo         {
echo             "label": "Start All Services",
echo             "dependsOn": [
echo                 "1. Hardhat Blockchain",
echo                 "2. Deploy Contracts",
echo                 "3. Backend (Node.js^)",
echo                 "4. Frontend (Next.js^)"
echo             ],
echo             "dependsOrder": "sequence",
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always"
echo             }
echo         },
echo         {
echo             "label": "Install Dependencies",
echo             "type": "shell",
echo             "command": "cd backend/blockchain ^&^& npm install ^&^& cd ../.. ^&^& cd backend ^&^& npm install ^&^& cd .. ^&^& npm install",
echo             "options": {
echo                 "cwd": "${workspaceFolder}"
echo             },
echo             "problemMatcher": [],
echo             "presentation": {
echo                 "reveal": "always",
echo                 "panel": "dedicated"
echo             }
echo         }
echo     ]
echo }
) > ".vscode\tasks.json"

echo [OK] VS Code tasks.json created!
echo.

REM Check if code command is available
where code >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] 'code' command not found in PATH.
    echo    Please ensure VS Code is installed and added to PATH.
    echo.
    echo    After fixing, you can run services manually with:
    echo       VS Code: Terminal ^> Run Task ^> Start All Services
    echo.
    pause
    exit /b 1
)

REM Check if MongoDB is installed
where mongod >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB not found!
    echo    Please install MongoDB from https://www.mongodb.com/try/download/community
    echo.
    echo    Then start MongoDB as a Windows Service or manually.
    echo.
)

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo    Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...

REM Blockchain dependencies
if not exist "backend\blockchain\node_modules" (
    echo Installing Blockchain dependencies (Hardhat^)...
    cd backend\blockchain
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Blockchain dependencies failed to install.
        pause
        exit /b 1
    )
    cd ..\..
)

REM Backend dependencies
if not exist "backend\node_modules" (
    echo Installing Backend dependencies...
    cd backend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Backend dependencies failed to install.
        pause
        exit /b 1
    )
    cd ..
)

REM Frontend dependencies
if not exist "node_modules" (
    echo Installing Frontend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Frontend dependencies failed to install.
        pause
        exit /b 1
    )
)

echo.
echo [2/3] Checking MongoDB connection...

REM Try to connect to MongoDB
where mongosh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    mongosh --eval "db.version()" --quiet mongodb://127.0.0.1:27017/medical_chain >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Could not connect to MongoDB at mongodb://127.0.0.1:27017
        echo    Make sure MongoDB is running before starting the backend.
    ) else (
        echo [OK] MongoDB is running!
    )
) else (
    where mongo >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        mongo --eval "db.version()" --quiet mongodb://127.0.0.1:27017/medical_chain >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo [WARNING] Could not connect to MongoDB at mongodb://127.0.0.1:27017
            echo    Make sure MongoDB is running before starting the backend.
        ) else (
            echo [OK] MongoDB is running!
        )
    ) else (
        echo [WARNING] MongoDB client not found. Cannot verify connection.
    )
)

echo.
echo [3/3] Opening VS Code...

REM Open VS Code in the project folder
code "%PROJECT_ROOT%"

echo.
echo [OK] VS Code is now open with your project!
echo.
echo   TO START ALL SERVICES:
echo   -----------------------------------------------------
echo   Option 1 (Recommended^):
echo     Press: Ctrl+Shift+P
echo     Type:  "Tasks: Run Task"
echo     Select: "Start All Services"
echo.
echo   This will start in sequence:
echo     1. Hardhat Blockchain (localhost:8545^)
echo     2. Deploy Smart Contracts
echo     3. Backend Server (localhost:5000^)
echo     4. Frontend (localhost:3000^)
echo.
echo   Option 2 (Individual terminals^):
echo     Press: Ctrl+` (backtick^) to open new terminal
echo     Run each service manually.
echo.
echo   IMPORTANT: Make sure MongoDB is running!
echo     Check Services or start manually: mongod
echo.
pause
