
# Usar una imagen ligera de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json desde la raíz del proyecto
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando por defecto para correr el servidor Next.js
CMD ["npm", "run", "dev"]
