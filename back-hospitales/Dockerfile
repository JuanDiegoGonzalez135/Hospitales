FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /app

# Copiamos solo los archivos necesarios primero (para caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el resto del proyecto
COPY src ./src

# Compilamos y generamos el jar
RUN mvn clean package -DskipTests

# Copiamos el jar final a una ruta limpia
RUN cp target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
