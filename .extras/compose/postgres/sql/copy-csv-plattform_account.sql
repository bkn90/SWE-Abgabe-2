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
-- psql --dbname=buch --username=postgres --file=/sql/copy-csv.sql

SET search_path TO plattform_account, public;

COPY platform_account    (id, display_name, owner_email, created_at, updated_at)
FROM '/csv/platform_account.csv' (FORMAT csv, DELIMITER ';', HEADER true);

COPY billing_account     (account_id, vat_id, iban, invoice_email)
FROM '/csv/billing_account.csv' (FORMAT csv, DELIMITER ';', HEADER true);

COPY module_subscription (subscription_id, account_id, module_code, started_at, ends_at)
FROM '/csv/module_subscription.csv' (FORMAT csv, DELIMITER ';', HEADER true);
