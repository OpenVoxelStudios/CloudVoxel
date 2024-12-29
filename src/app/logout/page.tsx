"use client"
import { signOut } from "next-auth/react"

export default function SignOut() {
    return <button onClick={() => signOut({ redirectTo: location.origin })}>Sign Out</button>
}