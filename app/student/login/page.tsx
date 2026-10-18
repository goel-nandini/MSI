import { redirect } from 'next/navigation';

export default async function StudentLoginRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedParams)) {
    if (typeof val === 'string') query.set(key, val);
  }
  const queryString = query.toString() ? `?${query.toString()}` : '';
  redirect(`/login${queryString}`);
}
