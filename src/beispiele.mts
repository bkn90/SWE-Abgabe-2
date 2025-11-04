/* eslint-disable n/no-process-env */
// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// Aufruf:  pnpm i
//          pnpx prisma generate
//
//          node --env-file=.env src\beispiele.mts

// src/beispiel.mts
// Aufruf:   node --env-file=.env src/beispiel.mts
// src/beispiele.mts
import { PrismaClient } from './generated/prisma/client.ts';

// bei custom Prisma-Output
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// ENV sicher auslesen (Index-Zugriff, sonst TS4111)
const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
    throw new Error(
        'DATABASE_URL fehlt. Bitte .env prüfen oder --env-file nutzen.',
    );
}

// Pool konfigurieren
const pool = new Pool({
    connectionString,
    // lokal oft: ssl: false,
    // cloud ggf.: ssl: { rejectUnauthorized: false },
});

// Prisma mit Adapter initialisieren
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.$connect();

    // Beispiel: kurzer Ping
    const now = await prisma.$queryRaw`SELECT NOW()`;
    console.log('DB connected, NOW() =', now);

    // Deine bisherigen Queries:
    const accounts = await prisma.platformAccount.findMany({
        include: { billingAccount: true, moduleSubscriptions: true },
    });
    console.log('Accounts inkl. Billing & Subscriptions:');
    console.log(JSON.stringify(accounts, null, 2));

    const billings = await prisma.billingAccount.findMany();
    console.log('Billing Accounts:');
    console.log(JSON.stringify(billings, null, 2));

    const subs = await prisma.moduleSubscription.findMany();
    console.log('Module Subscriptions:');
    console.log(JSON.stringify(subs, null, 2));
}

main()
    .catch((e) => {
        console.error('Error in main():', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
