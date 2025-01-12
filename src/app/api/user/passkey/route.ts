import { NextResponse } from "next/server";
import { db } from "@/../data/index";
import { accountsTable, authenticatorsTable, eqLow } from "@/../data/schema";
import { auth } from "@/auth";
import { and } from "drizzle-orm";


export const DELETE = auth(async (req: NextRequest): Promise<NextResponse> => {
    if (!req.auth || !req.auth.user || !req.auth.user.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (!req.auth.hasPasskey) return NextResponse.json({ error: 'No passkey associated to your account.' }, { status: 400 });

    await db.delete(authenticatorsTable).where(
        eqLow(authenticatorsTable.userId, req.auth.user.id)
    ).execute();

    await db.delete(accountsTable).where(
        and(
            eqLow(accountsTable.userId, req.auth.user.id),
            eqLow(accountsTable.provider, 'passkey')
        )
    ).execute();

    return NextResponse.json({ success: true }, { status: 200 });
});