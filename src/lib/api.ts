'use server';

import CONFIG from '../../config';
import { db } from '../../data';
import { groupsTable, ilike } from '../../data/schema';
import type { rootType } from './root';
import { getPartition } from './partition';

export async function getUserGroups(email: string): Promise<string[]> {
    const groups = await db.select().from(groupsTable).where(ilike(groupsTable.users, `%,${email},%`)).all();

    return groups.map(g => g.name);
};

export async function getPartitions(email: string): Promise<{ name: string; displayName: string; path: string; }[] | 'undefined'> {
    const root = CONFIG.root;
    if (typeof root === 'string') return 'undefined';
    const groups = await getUserGroups(email);

    return Object.keys(root).filter(R => root[R].defaultAccess == 'public' || root[R].groupAccess.some(g => groups.includes(g))).map(R => ({
        name: R,
        displayName: root[R].displayName,
        path: root[R].path,
    }));
}

export async function getRootAndPermission(req: NextRequest, ROOT: rootType): Promise<string | false> {
    if (!req.auth && !req.headers.get('Authorization')) return false;
    if (typeof ROOT === 'string') return ROOT;

    const partition = getPartition(req);
    const find = Object.keys(ROOT).find(r => r == partition);
    if (!partition || !find) return false;

    if (req.headers.get('Authorization')) return ROOT[find].path;

    if (req.auth && req.auth.user && req.auth.user.email) {
        const availablePartitions = await getPartitions(req.auth.user.email);

        if (availablePartitions == 'undefined') return false;
        if (!availablePartitions.some(p => p.name == partition)) return false;
        return ROOT[find].path;
    };
    
    return false;
}