import { drizzle } from 'drizzle-orm/libsql';
import config from './config.ts';
import path from 'node:path';
import select, { Separator } from '@inquirer/select';
import checkbox from '@inquirer/checkbox';
import input from '@inquirer/input';
import confirm from '@inquirer/confirm';
import { spawnSync } from 'node:child_process';
import { apiKeysTable, eqLow, groupsTable, usersTable } from './data/schema.ts';
import { v7 } from 'uuid';

const filePermissions: { [key: string]: string } = {
    'files.get': 'Permission to list the files and get informations about them',
    'files.edit': 'Permission to upload, rename and move a file or folder',
    'files.share': 'Permission to create a public share link',
    'files.delete': 'Permission to delete a file or folder from storage',
};

async function main() {
    console.clear();

    const answer = await select({
        message: 'Select an action',
        choices: [
            {
                name: 'User management',
                value: 'user',
                description: 'List, add, or remove users from the command line!',
            },
            {
                name: 'API key management',
                value: 'api',
                description: 'List, add, or remove API keys from the command line!',
            },
            {
                name: 'Group management',
                value: 'group',
                description: 'List, create, manage group users or remove groups from the command line!',
            },
            {
                name: 'Sync files',
                value: 'sync',
                description: 'Sync files from the storage directory to the database!',
            },
            new Separator(),
            {
                name: 'Exit',
                value: 'exit',
                description: 'Or press Ctrl+C to exit',
            },
        ],
        loop: false,
    }) as 'user' | 'api' | 'group' | 'sync' | 'exit';

    if (answer === 'exit') {
        return process.exit(0);
    }

    else if (answer === 'sync') {
        console.log('Syncing files...');
        const syncProcess = spawnSync(process.argv[0], ['run', path.join(process.cwd(), 'data', 'sync.ts')], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        if (syncProcess.error) {
            console.error('Error running sync:', syncProcess.error);
            process.exit(1);
        }
        console.log('...done!');
    }

    else {
        const db = drizzle({ connection: { url: config.database.file } });

        if (answer === 'user') {
            const users = await db.select().from(usersTable).all();

            const user = await select({
                message: 'Select an action',
                choices: [
                    {
                        name: 'Create user',
                        value: 'create',
                    },
                    new Separator(),
                    ...users.map(u => ({
                        name: `${u.name} (${u.email})`,
                        value: u.email,
                    })),
                    new Separator(),
                    {
                        name: 'Back',
                        value: 'back',
                    },
                ],
                loop: false,
            });

            if (user === 'back') return main();
            else if (user === 'create') {
                const email = await input({
                    message: 'Enter new user email',
                    validate: (value) => {
                        let matches = value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                        if (!matches) return false;
                        if (users.find(u => u.email === value)) return 'User with this email already exists';
                        return true
                    },
                });
                const name = await input({
                    message: 'Enter new user name',
                    validate: (value) => {
                        if (users.find(u => u.name === value)) return 'User with this name already exists';
                        return true
                    },
                });

                process.stdout.write('Creating user...');
                await db.insert(usersTable).values({ email, name }).execute();
                process.stdout.write('done!\n');
            }

            else {
                const action = await select({
                    message: 'What action do you want to take?',
                    choices: [
                        {
                            name: 'Get user info',
                            value: 'get',
                        },
                        {
                            name: 'Edit user name',
                            value: 'edit.name',
                        },
                        {
                            name: 'Delete user',
                            value: 'delete',
                        },
                        new Separator(),
                        {
                            name: 'Cancel',
                            value: 'exit',
                            description: 'Or press Ctrl+C to cancel',
                        },
                    ],
                    loop: false,
                }) as 'get' | 'edit.name' | 'delete' | 'exit';

                if (action == 'exit') return main();
                else if (action == 'get') {
                    const foundUser = users.find(u => u.email === user)!;
                    const table: { [email: string]: { name: string; avatar: string | null } } = {};
                    table[user] = {
                        name: foundUser.name,
                        avatar: foundUser.avatar,
                    };

                    console.table(table);
                }

                else if (action == 'edit.name') {
                    const newName = await input({
                        message: `Enter new user name for ${user}`, validate: (value) => {
                            if (users.find(u => u.name === value)) return 'User with this name already exists';
                            return true
                        },
                    });

                    process.stdout.write('Updating user...');
                    await db.update(usersTable).set({ name: newName }).where(eqLow(usersTable.email, user)).execute();
                    process.stdout.write('done!\n');
                }

                else if (action == 'delete') {
                    const confirmed = await confirm({ message: `Confirm deletion of user ${user}?` });

                    if (confirmed) {
                        process.stdout.write('Deleting user...');
                        await db.delete(usersTable).where(eqLow(usersTable.email, user)).execute();
                        process.stdout.write('done!\n');
                    }
                    else {
                        console.log('User deletion cancelled');
                    }
                }
            }
        }

        else if (answer == 'group') {
            const groups = await db.select().from(groupsTable).all();

            const group = await select({
                message: 'Select an action',
                choices: [
                    {
                        name: 'Create group',
                        value: 'create',
                    },
                    new Separator(),
                    ...groups.map(g => ({
                        name: `${g.displayName} (${g.name})`,
                        value: g.name,
                    })),
                    new Separator(),
                    {
                        name: 'Back',
                        value: 'back',
                    },
                ],
                loop: false,
            });

            if (group === 'back') return main();
            else if (group === 'create') {
                const name = await input({
                    message: 'Enter new group identifier',
                    validate: (value) => {
                        if (groups.find(g => g.name === value)) return 'Group with this identifier already exists';
                        return true
                    },
                });
                const displayName = await input({ message: 'Enter new group display name' });

                process.stdout.write('Creating group...');
                await db.insert(groupsTable).values({ name, displayName }).execute();
                process.stdout.write('done!\n');
            }

            else {
                const action = await select({
                    message: 'What action do you want to take?',
                    choices: [
                        {
                            name: 'Get group info',
                            value: 'get',
                        },
                        {
                            name: 'Edit group display name',
                            value: 'edit.name',
                        },
                        {
                            name: 'Edit group users',
                            value: 'edit.users',
                        },
                        {
                            name: 'Delete group',
                            value: 'delete',
                        },
                        new Separator(),
                        {
                            name: 'Cancel',
                            value: 'exit',
                            description: 'Or press Ctrl+C to cancel',
                        },
                    ],
                    loop: false,
                }) as 'get' | 'edit.name' | 'edit.users' | 'delete' | 'exit';

                if (action == 'exit') return main();
                else if (action == 'get') {
                    const foundG = groups.find(g => g.name === group)!;

                    console.log(`Group ${group}: ${foundG.displayName}`)
                    console.table({ Users: foundG.users.split(',').filter(u => u) });
                }

                else if (action == 'edit.name') {
                    const newName = await input({
                        message: `Enter new display name for group ${group}`, validate: (value) => {
                            if (groups.find(g => g.name === value)) return 'User with this name already exists';
                            return true
                        },
                    });

                    process.stdout.write('Updating group name...');
                    await db.update(groupsTable).set({ displayName: newName }).where(eqLow(groupsTable.name, group)).execute();
                    process.stdout.write('done!\n');
                }

                else if (action == 'edit.users') {
                    const allUsers = await db.select().from(usersTable).all();
                    const newMembers = await checkbox({
                        message: 'Select the users to add to or remove from the group',
                        choices: [
                            ...allUsers.map(u => ({
                                name: `${u.name} (${u.email})`,
                                value: u.email,
                                checked: groups.find(g => g.name === group)!.users.includes(',' + u.email + ','),
                            })),
                        ],
                        loop: false,
                        required: true,
                    });

                    const newMembersList = ',' + newMembers.join(',') + ',';
                    process.stdout.write('Updating group users...');
                    await db.update(groupsTable).set({ users: newMembersList }).where(eqLow(groupsTable.name, group)).execute();
                    process.stdout.write('done!\n');
                }

                else if (action == 'delete') {
                    const confirmed = await confirm({ message: `Confirm deletion of group ${group}?` });

                    if (confirmed) {
                        process.stdout.write('Deleting group...');
                        await db.delete(groupsTable).where(eqLow(groupsTable.name, group)).execute();
                        process.stdout.write('done!\n');
                    }
                    else {
                        console.log('Group deletion cancelled');
                    }
                }
            }
        }

        else if (answer == 'api') {
            if (config.enableAPI == false) console.warn('NOTE: API is disabled in the config.ts file!');
            const apikeys = await db.select().from(apiKeysTable).all();

            const key = await select({
                message: 'Select an action',
                choices: [
                    {
                        name: 'Create API key',
                        value: 'create',
                    },
                    new Separator(),
                    ...apikeys.map(k => ({
                        name: `${k.name} (${k.key})`,
                        value: k.key,
                        description: k.permissions.split(',').join(', ') || 'No permissions'
                    })),
                    new Separator(),
                    {
                        name: 'Back',
                        value: 'back',
                    },
                ],
                loop: false,
            });

            if (key === 'back') return main();
            else if (key === 'create') {
                let apiKey: string | null = null;
                while (!apiKey || apikeys.find(k => k.key === apiKey)) apiKey = v7();

                const name = await input({
                    message: 'Enter a name for the API key',
                    validate: (value) => {
                        if (apikeys.find(k => k.name === value)) return 'API key with this name already exists';
                        return true
                    },
                });

                const permissions = await checkbox({
                    message: 'Select a package manager',
                    choices: [
                        { name: 'files.*', value: 'files.*', description: 'Enable all file permissions' },
                        new Separator(),
                        ...Object.keys(filePermissions).map(p => ({
                            name: p,
                            value: p,
                            description: filePermissions[p],
                        })),
                    ],
                    loop: false,
                    required: true,
                });

                process.stdout.write('Creating API Key...');
                await db.insert(apiKeysTable).values({
                    key: apiKey,
                    permissions: permissions.join(','),
                    name: name,
                }).execute();
                process.stdout.write(`done! - KEY: ${apiKey}\n`);
            }

            else {
                const action = await select({
                    message: 'What action do you want to take?',
                    choices: [
                        {
                            name: 'Get key info',
                            value: 'get',
                        },
                        {
                            name: 'Edit key name',
                            value: 'edit.name',
                        },
                        {
                            name: 'Edit key permissions',
                            value: 'edit.permissions',
                        },
                        {
                            name: 'Delete API key',
                            value: 'delete',
                        },
                        new Separator(),
                        {
                            name: 'Cancel',
                            value: 'exit',
                            description: 'Or press Ctrl+C to cancel',
                        },
                    ],
                    loop: false,
                }) as 'get' | 'edit.name' | 'edit.permissions' | 'delete' | 'exit';

                if (action == 'exit') return main();
                const foundKey = apikeys.find(u => u.key === key)!;

                if (action == 'get') {
                    console.log(`KEY ${key}: ${foundKey.permissions.split(',').join(', ') || 'No permissions'}`)
                }

                else if (action == 'edit.name') {
                    const newName = await input({
                        message: `Enter new name for API key ${key}`,
                        validate: (value) => {
                            if (apikeys.find(k => k.name === value)) return 'API key with this name already exists';
                            return true
                        },
                    });

                    process.stdout.write('Updating name for API key...');
                    await db.update(apiKeysTable).set({ name: newName }).where(eqLow(apiKeysTable.key, key)).execute();
                    process.stdout.write('done!\n');
                }

                else if (action == 'edit.permissions') {
                    const permissions = await checkbox({
                        message: 'Select a package manager',
                        choices: [
                            { name: 'files.*', value: 'files.*', description: 'Enable all file permissions', checked: foundKey.permissions.includes('files.*') },
                            new Separator(),
                            ...Object.keys(filePermissions).map(p => ({
                                name: p,
                                value: p,
                                description: filePermissions[p],
                                checked: foundKey.permissions.includes(p),
                            })),
                        ],
                        loop: false,
                        required: true,
                    });

                    process.stdout.write('Updating permissions for API key...');
                    await db.update(apiKeysTable).set({ permissions: permissions.join(',') }).where(eqLow(apiKeysTable.key, key)).execute();
                    process.stdout.write('done!\n');
                }

                else if (action == 'delete') {
                    const confirmed = await confirm({ message: `Confirm deletion of key ${key}? (permissions: ${foundKey.permissions.split(',').join(', ') || 'none'})` });

                    if (confirmed) {
                        process.stdout.write('Deleting API key...');
                        await db.delete(apiKeysTable).where(eqLow(apiKeysTable.key, key)).execute();
                        process.stdout.write('done!\n');
                    }
                    else {
                        console.log('API key deletion cancelled');
                    }
                }
            }
        }
    }
};

main();