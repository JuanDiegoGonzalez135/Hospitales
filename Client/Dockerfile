# Usamos Nginx para servir archivos estáticos
FROM nginx:alpine

# Copiamos todo el frontend
COPY . /usr/share/nginx/html

# Copiamos tu configuración de Nginx (HTTPS)
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]