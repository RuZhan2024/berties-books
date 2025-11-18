# 06_berties_books_33724876 – Bertie’s Books (Express + MySQL)

A small Node.js web app built with **Express**, **EJS**, and **MySQL**.

It includes:

- A simple book catalogue (list / add / search / bargain).
- User registration and login with **hashed passwords**.
- Database configuration via **dotenv** (credentials not stored in source code).
- Optional **login audit logging** to record successful and failed logins.

## Technologies Used

- Node.js + Express — server and routing
- EJS — view templates
- MySQL (mysql2) — database and connection pool
- dotenv — environment-based configuration for database credentials
- bcrypt — password hashing
- CSS — shared stylesheet (`public/main.css`)
- forever — process manager for the VM

## Prerequisites

- Node.js 18+
- MySQL 8
- Goldsmiths VM access for deployment

## Install & Run Locally

```bash
# 1) Get the code
git clone https://github.com/RuZhan2024/06_berties_33724876.git
cd 06_berties_33724876

# 2) Install dependencies
npm install
````
## Database Setup

### Creating and seeding the database

Use the provided SQL scripts:

```bash
mysql -u root -p < create_db.sql
mysql -u root -p < insert_test_data.sql
```

These scripts:

* Create the `berties_books` database.
* Create an application user with appropriate privileges.
* Create tables for:

  * Books data (title, price, etc.).
  * User accounts (first name, last name, email, hashed password).
  * Login audit records (email, success/failure, timestamp).
* Insert sample book data and a default test user.

Apply the same structure both locally and on the VM.

## Configuration with dotenv

The app uses **dotenv** so that database credentials are kept in a local `.env` file instead of the source code.

* A `.env` file is placed in the project root and contains variables such as:

  * `DB_HOST`
  * `DB_USER`
  * `DB_PASSWORD`
  * `DB_NAME`
  * `DB_PORT`
* `.env` is excluded from version control (listed in `.gitignore`).
* The Express app reads these variables when it creates the MySQL connection pool.

On the VM, a separate `.env` file is created with the VM’s database details. This allows the same codebase to run in both environments without changing the source.

## Start the App (locally)

```bash
npm start
# visit http://localhost:8000
```
## Available Routes

### Book features

* `/` — Home page with links to all features.
* `/about` — Simple about page.
* `/books/list` — Shows a table of all books in the catalogue.
* `/books/addbook` — Displays a form to add a new book.
* `/books/bookadded` — Handles book form submissions and confirms the insert.
* `/books/bargainbooks` — Lists books below a fixed price threshold.
* `/books/search` — Provides a search form and displays matching results, supporting partial and exact matches.

### User and security features

All user-related routes are under `/users`:

* `/users/register` — Shows a registration form where users enter first name, last name, email, password, and confirm password.
* `/users/registered` — Handles registration:

  * Checks that all fields are filled in.
  * Ensures the two password fields match.
  * Verifies that the email is not already registered.
  * Hashes the password and stores the new user record.
* `/users/login` (GET) — Shows the login form (email and password).
* `/users/login` (POST) — Handles login attempts:

  * Looks up the account by email.
  * Compares the submitted password with the stored hashed password.
  * On success, redirects to the home page; on failure, redisplays the form with an error message.
* `/users/userlist` — Displays a table of all registered users, showing only non-sensitive fields (e.g. id, first name, last name, email).

### Audit log (optional)

* `/users/audit` — Displays a list of login attempts:

  * Shows the email used, whether the login was successful or failed, and the time of the attempt.
  * Uses a dedicated audit table to store this information.
## Password Hashing (Overview)

* Passwords entered at registration are never stored in plain text.
* Before being saved, each password is processed using the bcrypt library with a configurable number of salt rounds.
* During login, the submitted password is checked against the stored hashed password.
* This ensures that even if the database is accessed directly, original passwords cannot be read.

## Audit Logging (Overview)
* Every login attempt can be recorded in an audit table:

  * The email provided in the login form.
  * Whether the attempt was successful or not.
  * The time the attempt was made.
* Failed attempts (e.g. wrong password or unknown email) are also logged.
* The `/users/audit` page gives a simple view over this history and can be used to review suspicious activity or debugging login problems.
## Project Structure

```text
06_berties_33724876/
├─ public/
│  └─ main.css                 # shared styles for all pages
├─ routes/
│  ├─ index.js                 # home and about routes
│  ├─ books.js                 # book-related routes
│  └─ users.js                 # registration, login, user list, audit
├─ views/
│  ├─ index.ejs                # home
│  ├─ about.ejs                # about page
│  ├─ list.ejs                 # book list
│  ├─ addBook.ejs              # add book form
│  ├─ bargainbooks.ejs         # bargain books
│  ├─ search.ejs               # book search
│  ├─ register.ejs             # registration form
│  ├─ login.ejs                # login form
│  ├─ userList.ejs             # list of users
│  └─ audit.ejs                # login audit table (if used)
├─ create_db.sql               # database schema and app user creation
├─ insert_test_data.sql        # initial sample data and default user
├─ index.js                    # Express app bootstrap and MySQL pool
├─ package.json
├─ .env                        # local DB configuration (not committed)
└─ links.txt                   # home=http://www.doc.gold.ac.uk/usr/XXXX/
```
## Deploying on the VM

```bash
# on the VM
git clone https://github.com/RuZhan2024/06_berties_33724876.git
cd 06_berties_33724876
npm install

# initialize DB (first time only)
sudo mysql < create_db.sql
sudo mysql < insert_test_data.sql
```

Create a `.env` file on the VM with the appropriate database credentials.

### Run the app in the background

```bash
npm start
# or using forever:
npx forever start -a -l forever.log -o out.log -e err.log index.js

# manage the process:
npx forever list
npx forever stop index.js
```
## links.txt

The file `links.txt` in the project root contains a single line:

```text
home=http://www.doc.gold.ac.uk/usr/122/
```




