"use client";

import { Suspense } from "react";
import { Error, parseError } from "@/lib/error";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

const CardContentComponent = (
  <CardContent className="p-8 flex justify-center">
    <Link
      href="/"
      className="inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-sm font-medium text-gray-100 hover:bg-gray-600 hover:text-gray-50"
    >
      Return to Home
    </Link>
  </CardContent>
);

function ErrorSkeleton() {
  return (
    <Card className="w-full max-w-xl border-gray-700 bg-gray-800 animate-pulse">
      <CardHeader className="space-y-4 p-8">
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-gray-100">
          <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto" />
        </CardTitle>
        <CardDescription className="text-center text-lg text-gray-400">
          <div className="h-6 bg-gray-700 rounded w-2/3 mx-auto" />
        </CardDescription>
      </CardHeader>
      {CardContentComponent}
    </Card>
  );
}

function ErrorContent() {
  const search = useSearchParams();
  const error = search.get("code") || (search.get("error") as Error);

  return (
    <Card className="w-full max-w-xl border-gray-700 bg-gray-800">
      <CardHeader className="space-y-4 p-8">
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-gray-100">
          Something went wrong: {error}
        </CardTitle>
        <CardDescription className="text-center text-lg text-gray-400">
          {parseError(error).message ||
            "Please contact us if this error persists."}
        </CardDescription>
      </CardHeader>
      {CardContentComponent}
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-9 lg:px-8">
      <Suspense fallback={<ErrorSkeleton />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
