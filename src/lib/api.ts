import CONFIG from '@/../config';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export const root = CONFIG.root.startsWith('./') ? path.join(process.cwd(), CONFIG.root) : CONFIG.root;
if (!existsSync(root)) mkdirSync(root, { recursive: true });