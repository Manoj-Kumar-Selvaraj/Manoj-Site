#!/bin/bash
# Quick setup script for local development

set -e

echo "======================================"
echo "  Portfolio Setup Script"
echo "======================================"

# Backend
echo ""
echo "Setting up Django backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Created virtualenv"
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate

pip install -r requirements.txt -q
echo "Installed Python dependencies"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env from template — update SECRET_KEY!"
fi

python manage.py migrate
echo "Ran migrations"

echo ""
echo "Creating superuser for admin portal..."
python manage.py createsuperuser

python manage.py collectstatic --noinput
echo "Collected static files"

cd ..

# Frontend
echo ""
echo "Setting up React frontend..."
cd frontend

if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
echo "Installed Node dependencies"

cd ..

echo ""
echo "======================================"
echo "  Setup complete!"
echo ""
echo "  Start backend:  cd backend && source venv/bin/activate && python manage.py runserver"
echo "  Start frontend: cd frontend && npm run dev"
echo ""
echo "  Admin portal:   http://localhost:8000/admin/"
echo "  Frontend:       http://localhost:5173/"
echo "======================================"
