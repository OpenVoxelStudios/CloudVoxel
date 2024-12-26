import { filesTable } from './schema';
import { existsSync, lstatSync } from 'node:fs';
import path, { basename, parse } from 'node:path';
import { formatBytes } from '../src/lib/functions';
import { and, eq } from 'drizzle-orm';
import { glob } from 'glob';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import config from '../config';
const root = config.root.startsWith('./') ? path.join(process.cwd(), config.root) : config.root;

const sqlite = new Database(config.database.file);
export const db = drizzle({ client: sqlite });

const files = await db.select().from(filesTable);

for await (const file of files) {
    if (!existsSync(path.join(root, file.path, file.name))) {
        console.info(`Deleting ${file.name} from the database`);
        await db.delete(filesTable).where(and(eq(filesTable.name, file.name), eq(filesTable.path, file.path))).limit(1);
    }
}

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
        })
        .onConflictDoNothing();
}