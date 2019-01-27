echo "Dev: Deploying backend..."
cd api
npm run deploy:dev
echo "Dev: Backend deployed"

cd ..

echo "Dev: Deploying frontend..."
cd web
npm run deploy:dev
echo "Dev: Frontend deployed"

echo "Dev: Deploy complete"

