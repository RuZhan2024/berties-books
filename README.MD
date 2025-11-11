
# 06_berties_books_33724876 – Lab 6 Coursework (Bertie’s Books + MySQL)

A small Node.js web app built with **Express**, **EJS**, and **MySQL**. It demonstrates templating, form handling, SQL queries (list/insert/filter/search), and VM deployment with a long-running process.

## Technologies Used

* **Node.js + Express** — server & routing
* **EJS** — view templates
* **MySQL (mysql2)** — database + connection pool
* **CSS** — external stylesheet (`public/main.css`)

## Prerequisites

* Node.js 18+
* MySQL 8 (or MariaDB compatible)

---

## Install & Run Locally

```bash
# 1) Get the code
git clone https://github.com/RuZhan2024/berties-books.git
cd berties-books

# 2) Install dependencies
npm install
```

### Create & Seed the Database

Use the provided SQL scripts:

```bash
# login as root (or a MySQL user with sufficient privileges)
mysql -u root -p < create_db.sql
mysql -u root -p < insert_test_data.sql
```

The app expects these defaults (see `index.js`):

```js
host: 'localhost'
user: 'berties_books_app'
password: 'qwertyuiop'
database: 'berties_books'
```

> If you change credentials, update them in `index.js` (or move them to env vars if you prefer).

### Start the App

```bash
npm start
# visit http://localhost:8000
```

---

## Available Routes

* `/` — Home menu with links to all features
* `/about` — Simple about page
* `/books/list` — List all books (name, price)
* `/books/addbook` — Form to add a new book (name, price)
* `/books/bookadded` — **POST** target; inserts a book and shows confirmation
* `/books/bargainbooks` — Books cheaper than £20
* `/books/search` — Search page

  * **GET** shows form
  * **POST** supports **partial** (`LIKE %keyword%`) and **exact** (`=`) matches

> Optional (debug): you may add `/health/db` to test DB connectivity if needed.

### Quick Links Table (replace `usr/122` with your own user number)

```markdown
| Route                 | Link                                                           |
| --------------------- | -------------------------------------------------------------- |
| `/`                   | http://www.doc.gold.ac.uk/usr/122/                            |
| `/about`              | http://www.doc.gold.ac.uk/usr/122/about                       |
| `/books/list`         | http://www.doc.gold.ac.uk/usr/122/books/list                  |
| `/books/addbook`      | http://www.doc.gold.ac.uk/usr/122/books/addbook               |
| `/books/bargainbooks` | http://www.doc.gold.ac.uk/usr/122/books/bargainbooks          |
| `/books/search`       | http://www.doc.gold.ac.uk/usr/122/books/search                |
```

---

## Project Structure

```text
berties-books/
├─ public/
│  └─ main.css                 # shared styles for all pages
├─ routes/
│  ├─ index.js                 # home/about
│  └─ books.js                 # list/add/insert/bargains/search
├─ views/
│  ├─ index.ejs                # /
│  ├─ about.ejs                # /about
│  ├─ list.ejs                 # /books/list
│  ├─ addBook.ejs              # /books/addbook  (POST -> bookadded)
│  ├─ bargainbooks.ejs         # /books/bargainbooks
│  └─ search.ejs               # /books/search (GET+POST)
├─ create_db.sql               # creates DB, table, and app user with grants
├─ insert_test_data.sql        # inserts sample rows
├─ index.js                    # Express app bootstrap + MySQL pool
├─ package.json
└─ links.txt                   # REQUIRED for submission: home=http://www.doc.gold.ac.uk/usr/122/
```

---

## Deploying on the University VM

```bash
# on the VM
git clone https://github.com/RuZhan2024/berties-books.git
cd berties-books
npm install

# initialize DB (first time only; run with sudo mysql if needed)
sudo mysql < create_db.sql
sudo mysql < insert_test_data.sql

# run the app
npm start
# or use a long-running process:
npx forever start -a -l forever.log -o out.log -e err.log index.js
```

**Managing the process**

```bash
npx forever list
npx forever stop index.js
```

---

## Submission Checklist (Lab 6 d–f)

* [ ] **All pages present** and styled: home, about, list, add, bargain, search (exact/partial).
* [ ] **DB setup scripts** included (`create_db.sql`, `insert_test_data.sql`) and working.
* [ ] App running on VM (port open), optionally managed by **forever**.
* [ ] **links.txt** present in repo with your live URL:

  ```
  home=http://www.doc.gold.ac.uk/usr/122/
  ```


