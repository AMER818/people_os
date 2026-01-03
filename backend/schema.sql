CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    status TEXT,
    join_date TEXT,
    email TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS ix_employees_id ON employees (id);
CREATE INDEX IF NOT EXISTS ix_employees_name ON employees (name);
CREATE INDEX IF NOT EXISTS ix_employees_email ON employees (email);
