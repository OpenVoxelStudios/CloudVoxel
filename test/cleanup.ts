import { db } from "../data/index";
import { eqLow, usersTable } from "../data/schema";

await db.delete(usersTable).where(eqLow(usersTable.email, 'test@example.com')).run();
