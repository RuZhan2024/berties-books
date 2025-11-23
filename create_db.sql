# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the tables
CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2),
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT,
    first_name      VARCHAR(40) NOT NULL,
    last_name       VARCHAR(40) NOT NULL,
    email           VARCHAR(50) NOT NULL,
    hashed_password VARCHAR(256) NOT NULL,
    PRIMARY KEY(id)
);

# NEW: audit table to record login attempts
CREATE TABLE IF NOT EXISTS login_audit (
    id             INT AUTO_INCREMENT,
    email          VARCHAR(50) NOT NULL,
    was_successful TINYINT(1) NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';

# Fix: no leading space in username
GRANT ALL PRIVILEGES ON berties_books.* TO 'berties_books_app'@'localhost';
