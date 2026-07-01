# Build stage
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app
COPY . /app
RUN chmod +x ./mvnw && ./mvnw -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/Codefest_Project-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENV PORT=8080
CMD ["java", "-jar", "/app/app.jar"]
