import CONFIG from '@/../config';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export const root = typeof CONFIG.root === 'string' ?
    (CONFIG.root.startsWith('./') ? path.join(process.cwd(), CONFIG.root) : CONFIG.root)
    : (() => {
        let roots = CONFIG.root;
        Object.keys(roots).forEach((key) => {
            roots[key].path = roots[key].path.startsWith('./') ? path.join(process.cwd(), roots[key].path) : roots[key].path;
            if (!existsSync(roots[key].path)) mkdirSync(roots[key].path, { recursive: true });
        });

        return roots;
    })();

if (typeof root === 'string' && !existsSync(root)) mkdirSync(root, { recursive: true });

export type rootType = typeof root;