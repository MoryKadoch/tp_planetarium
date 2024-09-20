# Utilise une image Node.js
FROM node:16-alpine
 
# Définir le répertoire de travail
WORKDIR /app
 
# Copier les fichiers nécessaires
COPY . .
 
# Installer les dépendances
RUN npm install
 
# Exposer le port sur lequel l'application s'exécute
EXPOSE 3000
 
# Commande pour lancer le serveur
CMD ["npx", "serve", "-s", "-l", "3000"]
 