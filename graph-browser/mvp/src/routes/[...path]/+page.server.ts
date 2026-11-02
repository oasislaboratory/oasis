import { error } from '@sveltejs/kit';
import { repository } from '$lib/server/repository';
export async function load({ params }) {
  try { return { objective: await repository.node(params.path || ''), git: await repository.status() }; }
  catch (e) { error(404, (e as Error).message); }
}
