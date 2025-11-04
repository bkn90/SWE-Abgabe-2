-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- Aufruf:
-- docker compose exec db bash
-- psql --dbname=buch --username=buch --file=/sql/create-table.sql

-- text statt varchar(n):
-- "There is no performance difference among these three types, apart from a few extra CPU cycles
-- to check the length when storing into a length-constrained column"
-- ggf. CHECK(char_length(nachname) <= 255)

-- Indexe auflisten:
-- psql --dbname=buch --username=buch
--  SELECT   tablename, indexname, indexdef, tablespace
--  FROM     pg_indexes
--  WHERE    schemaname = 'buch'
--  ORDER BY tablename, indexname;
--  \q

-- Neue Tabellen für Schema: plattform_account
-- Aufruf:
--   docker compose exec db bash
--   psql --dbname=<DEINE_DB> --username=<OWNER_USER> --file=/sql/create-table.sql

-- WICHTIG: Schema vorab sicherstellen (einmalig):
--   CREATE SCHEMA IF NOT EXISTS plattform_account AUTHORIZATION <OWNER_USER>;

SET search_path TO plattform_account, public;

-- Aggregat-Root
CREATE TABLE IF NOT EXISTS platform_account (
    id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    display_name text    NOT NULL,
    owner_email  text    NOT NULL,
    created_at   timestamp(6) NOT NULL DEFAULT now(),
    updated_at   timestamp(6) NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_platform_account_owner_email
    ON platform_account(owner_email);

-- 1:1 Kind, PK == FK auf platform_account.id
CREATE TABLE IF NOT EXISTS billing_account (
    account_id    integer    PRIMARY KEY,
    vat_id        text,
    iban          text,
    invoice_email text       NOT NULL,
    CONSTRAINT fk_billing_platform
        FOREIGN KEY (account_id)
        REFERENCES platform_account(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

-- 1:n Kind
CREATE TABLE IF NOT EXISTS module_subscription (
    subscription_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id      integer    NOT NULL,
    module_code     text       NOT NULL,   
    started_at      timestamp(6) NOT NULL DEFAULT now(),
    ends_at         timestamp(6),

    CONSTRAINT fk_subscription_platform
        FOREIGN KEY (account_id)
        REFERENCES platform_account(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_subscription_account_module
    ON module_subscription(account_id, module_code);

CREATE INDEX IF NOT EXISTS ix_subscription_account_id
    ON module_subscription(account_id);