export function getPartition(req: NextRequest): string | null {
  return (
    req.headers.get("Partition") || req.nextUrl.searchParams.get("partition")
  );
}
