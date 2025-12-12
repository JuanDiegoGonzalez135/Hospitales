# Dockerfile para frontend en desarrollo
FROM nginx:alpine

# Copiamos todo el frontend al contenedor
COPY . /usr/share/nginx/html

# Usamos la configuración default de Nginx para desarrollo (HTTP)
# Si quieres HTTPS más adelante, puedes agregar tu nginx.conf
# COPY ./nginx.conf /etc/nginx/nginx.conf

# Exponemos solo el puerto 80 para HTTP
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]