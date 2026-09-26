# Stage 1: Build JAR using Maven and Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create a non-root user (UID 1000, compatible with Hugging Face Spaces and standard PaaS)
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:appuser /app

# Copy built jar from build stage
COPY --from=build --chown=appuser:appuser /app/target/*.jar app.jar

USER appuser

# Hugging Face default port is 7860, standard PaaS is 8080
EXPOSE 8080 7860

ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
