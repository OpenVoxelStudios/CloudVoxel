import { eqLow, filesTable } from './schema.ts';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import path, { basename, parse } from 'node:path';
import { formatBytes } from '../src/lib/functions.ts';
import { and, isNotNull, isNull } from 'drizzle-orm';
import { glob } from 'glob';
import { drizzle } from 'drizzle-orm/libsql';
import config from '../config.ts';
import { createHash } from 'node:crypto';
import { root } from '@/lib/root.ts';

const db = drizzle({ connection: { url: config.database.file } });
const files = await db.select().from(filesTable);

if (typeof root === 'string') {
    for await (const file of files) {
        if (!existsSync(path.join(root, file.path, file.name))) {
            console.info(`Deleting ${file.name} from the database`);
            await db.delete(filesTable).where(and(eqLow(filesTable.name, file.name), eqLow(filesTable.path, file.path))).execute();
        }
    }

    await db.delete(filesTable).where(isNotNull(filesTable.partition)).execute();

    for await (const file of await glob('**/*', { cwd: root, follow: false, ignore: config.database.globFileBlacklist })) {
        const fileName = basename(file);
        const fileStats = lstatSync(path.join(root, file));

        await db.insert(filesTable)
            .values({
                author: 'server',
                name: fileName,
                path: parse(file).dir == '' ? '/' : parse(file).dir,
                size: fileStats.isDirectory() ? undefined : formatBytes(fileStats!.size),
                uploadedAt: fileStats.isDirectory() ? undefined : fileStats!.birthtime.getTime(),
                directory: fileStats.isDirectory() ? 1 : 0,
                hash: fileStats.isDirectory() ? undefined : createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex'),
            })
            .onConflictDoNothing()
            .execute();
    };
}

else {
    for await (const file of files) {
        if (!file.partition) continue;

        const localRoot = root[file.partition].path;
        if (!existsSync(path.join(localRoot, file.path, file.name))) {
            console.info(`Deleting ${file.name} from the database`);
            await db.delete(filesTable).where(and(eqLow(filesTable.name, file.name), eqLow(filesTable.path, file.path), eqLow(filesTable.partition, file.partition))).execute();
        }
    }

    await db.delete(filesTable).where(isNull(filesTable.partition)).execute();

    for await (const partition of Object.keys(root)) {
        const localRoot = root[partition];

        for await (const file of await glob('**/*', { cwd: localRoot.path, follow: false, ignore: config.database.globFileBlacklist })) {
            const fileName = basename(file);
            const fileStats = lstatSync(path.join(localRoot.path, file));

            await db.insert(filesTable)
                .values({
                    author: 'server',
                    name: fileName,
                    path: parse(file).dir == '' ? '/' : parse(file).dir,
                    size: fileStats.isDirectory() ? undefined : formatBytes(fileStats!.size),
                    uploadedAt: fileStats.isDirectory() ? undefined : fileStats!.birthtime.getTime(),
                    directory: fileStats.isDirectory() ? 1 : 0,
                    hash: fileStats.isDirectory() ? undefined : createHash('sha256').update(readFileSync(path.join(localRoot.path, file))).digest('hex'),
                    partition: partition,
                })
                .onConflictDoNothing()
                .execute();
        };

    }
}