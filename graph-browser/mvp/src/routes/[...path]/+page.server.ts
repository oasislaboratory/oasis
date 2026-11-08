import { error } from '@sveltejs/kit';
import { repository } from '$lib/server/repository';
export async function load({ params, url }) {
  const embedded = url.searchParams.get('embedded') === '1';
  try { return { objective: await repository.node(params.path || ''), embedded }; }
  catch (e) { error(404, (e as Error).message); }
}
