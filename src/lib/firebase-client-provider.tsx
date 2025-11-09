
"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

// This is a simple wrapper to ensure Firebase is only initialized on the client
// and to provide the AuthContext.
export default function FirebaseClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return <AuthProvider>{children}</AuthProvider>;
}
