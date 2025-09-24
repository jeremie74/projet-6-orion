# Orion Backend — Guide d’installation

## Prérequis
- JDK 17 (ou version compatible). Vérifier avec `java -version`.
- MySQL 8.x (installé localement ou via Docker).
- Maven Wrapper inclus (`mvnw`/`mvnw.cmd`).

## Installer MySQL
- macOS (documentation officielle) : https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/macos-installation.html
- Windows (documentation officielle) : https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/windows-installation.html
- Linux (documentation officielle) : https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/linux-installation.html
- Docker (image officielle) : https://hub.docker.com/_/mysql

## Configuration base de données
La configuration par défaut est définie dans `src/main/resources/application.properties` :
- URL JDBC : `jdbc:mysql://localhost:3306/orion_dev`
- Utilisateur : `dev`
- Mot de passe : `devpass`
- `spring.jpa.hibernate.ddl-auto=update` — les tables sont créées/mises à jour automatiquement au premier lancement.

Important : la base de données n’est pas créée automatiquement. Créer la base `orion_dev` et l’utilisateur indiqué ci‑dessus (ou adapter `application.properties`).

### Création de la base et de l’utilisateur
Exécuter les commandes suivantes dans le client MySQL (avec un compte administrateur, par exemple `root`) :

```sql
CREATE DATABASE orion_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'dev'@'localhost' IDENTIFIED BY 'devpass';
GRANT ALL PRIVILEGES ON orion_dev.* TO 'dev'@'localhost';
FLUSH PRIVILEGES;
```

Connexion au client MySQL (exemples) :
- macOS/Linux : `mysql -u root -p`
- Windows (PowerShell/CMD) : `mysql -u root -p`

Optionnel : ajouter `?createDatabaseIfNotExist=true` à l’URL JDBC pour créer la base automatiquement si l’utilisateur dispose des droits :
```
jdbc:mysql://localhost:3306/orion_dev?createDatabaseIfNotExist=true
```

## Installer les dépendances
Depuis ce dossier :
- macOS/Linux : `./mvnw clean package -DskipTests`
- Windows : `mvnw.cmd clean package -DskipTests`

Les dépendances sont téléchargées automatiquement lors du premier build.

## Lancer le projet
Depuis ce dossier :
- macOS/Linux : `./mvnw spring-boot:run`
- Windows : `mvnw.cmd spring-boot:run`

Par défaut, l’application se connecte à MySQL sur `localhost:3306` avec la base `orion_dev` et l’utilisateur `dev/devpass`.

## Dépannage rapide
- Vérifier que MySQL est démarré et écoute sur `3306`.
- Vérifier que la base `orion_dev` existe : `SHOW DATABASES;`
- Consulter les logs Spring Boot (SQL affichées si `spring.jpa.show-sql=true`).
