echo "Prod: Deploying backend..."
cd api
npm run deploy:prod
echo "Prod: Backend deployed"

cd ..

echo "Prod: Deploying frontend..."
cd web
npm run deploy:prod
echo "Prod: Frontend deployed"

echo "Prod: Deploy complete"

