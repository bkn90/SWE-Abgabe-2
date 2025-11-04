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

// Aufruf:   pnpm i
//           pnpx prisma generate
//
//           node --env-file=.env src\beispiele-write.mts

/* eslint-disable n/no-process-env */
// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// Dieses Beispiel ist angepasst für das Schema "plattform_account"
//
// Aufruf:   pnpm i
//           pnpx prisma generate
//           node --env-file=.env src/beispiele-write.mts

/* eslint-disable n/no-process-env */
// Aufruf: pnpm i
//         pnpx prisma generate
//         node --env-file=.env src/beispiele-write.mts

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from './generated/prisma/client.ts';

// ENV prüfen
const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
    throw new Error(
        'DATABASE_URL fehlt. Bitte .env prüfen oder mit --env-file laden.',
    );
}

// Postgres-Pool (bei Bedarf SSL aktivieren)
// const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
const pool = new Pool({ connectionString });

// Prisma-Adapter + Client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log: ['warn', 'error'],
});

try {
    await prisma.$connect();

    // Feste numerische ID verwenden (da PlatformAccount.id ein number/Int ist)
    const FIXED_ID = 1;

    const result = await prisma.platformAccount.upsert({
        where: { id: FIXED_ID }, // number statt string
        update: {
            // Felder ggf. an dein Schema anpassen
            displayName: 'Demo Testfirma GmbH (aktualisiert)',
            updatedAt: new Date(),
        },
        create: {
            id: FIXED_ID, // number statt string
            displayName: 'Demo Testfirma GmbH',
            ownerEmail: 'kontakt@testfirma.example',
            createdAt: new Date(),
            updatedAt: new Date(),
            billingAccount: {
                create: {
                    vatId: 'DE111222333',
                    iban: 'DE44500105175407324931',
                    invoiceEmail: 'rechnung@testfirma.example',
                },
            },
            moduleSubscriptions: {
                create: [
                    { moduleCode: 'SHOP', startedAt: new Date() },
                    {
                        moduleCode: 'KYC',
                        startedAt: new Date(),
                        endsAt: new Date('2026-12-31'),
                    },
                ],
            },
        },
        include: {
            billingAccount: true,
            moduleSubscriptions: true,
        },
    });

    console.log(
        'Upsert erfolgreich. Datensatz:',
        JSON.stringify(result, null, 2),
    );
} catch (e) {
    console.error('Fehler bei Schreibtest:', e);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
    await pool.end();
}
