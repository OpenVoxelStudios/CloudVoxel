import { Suspense } from "react";
import Hello from "../hello";

export default function Dashboard() {
    return <div>
        hello

        <Suspense>
            <Hello />
        </Suspense>
    </div>
}