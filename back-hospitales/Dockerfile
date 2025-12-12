FROM maven:3.9.9-eclipse-temurin-21

# Definir un directorio absoluto dentro del contenedor
WORKDIR /app

# Copiar solo el pom.xml para aprovechar caching
COPY pom.xml /app/

# Descargar dependencias offline
RUN mvn dependency:go-offline -B

# Copiar el resto del proyecto
COPY . /app/

# Construir el proyecto
RUN mvn package -DskipTests
