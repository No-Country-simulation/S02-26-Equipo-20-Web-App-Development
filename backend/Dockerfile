FROM eclipse-temurin:25.0.2_10-jre-ubi10-minimal

WORKDIR /app

COPY target/*.jar /app/backend.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/backend.jar"]
# docker build --platform=linux/amd64 -t <username>/<tag> <dokerfile-path>