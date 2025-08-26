# Migrating from SQLite to MySQL in a Django Project

This guide provides step-by-step instructions to migrate your Django project's database from SQLite to MySQL.

## Prerequisites

- Existing Django project using SQLite
- MySQL server installed and running
- Python MySQL client installed

## Step 1: Install MySQL Client Package

```bash
pip install mysqlclient
```

## Step 2: Export Data from SQLite

First, create a fixture from your SQLite database:

```bash
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > db.json
```

## Step 3: Fix Encoding Issues

The SQLite dumpdata command may create a file with UTF-16 encoding. Convert it to UTF-8:

Run this in your Python shell:

```python
import json

# Read the file as UTF-16
with open("db.json", "r", encoding="utf-16") as f:
    data = f.read()  # just read as text

# Write as UTF-8
with open("db_clean.json", "w", encoding="utf-8") as f:
    f.write(data)
```

## Step 4: Configure MySQL Database

1. Create a new MySQL database for your Django project:
```sql
CREATE DATABASE tutormove CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 5: Update Environment Configuration

Comment out the SQLite settings and uncomment the MySQL settings in your environment configuration:

```env
# For SQLite (default)
# DB_ENGINE=django.db.backends.sqlite3
# DB_NAME=db.sqlite3

# For MySQL
DB_ENGINE=django.db.backends.mysql
DB_NAME=tutormove
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

## Step 6: Create Database Schema

Run migrations to create the database structure in MySQL:

```bash
python manage.py migrate
```

## Step 7: Seed Initial Data (If Applicable)

If your project has a custom seeding command:

```bash
python manage.py seed_all
```

## Step 8: Import Your Data

Load the cleaned JSON data into MySQL:

```bash
python manage.py loaddata db_clean.json
```
