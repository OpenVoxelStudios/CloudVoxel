import config from "../config";
import { db } from "../data/index";
import { usersTable } from "../data/schema";
import { hashPassword } from "@/lib/crypto";

if (!config.credentialLogin) throw new Error("Credential login must be enabled for testing");
if (!config.enableAPI) throw new Error("API must be enabled for testing");

const userPassword = await hashPassword('ASecurePassword123!');
await db.insert(usersTable).values({
    email: 'test@example.com',
    name: 'Test User',
    password: userPassword.hash,
    salt: userPassword.salt,
}).onConflictDoNothing()
