import { json } from '@sveltejs/kit';
import { repository, exclusive, Conflict } from '$lib/server/repository';
export async function POST({ request, url }) {
  if (request.headers.get('origin') !== url.origin) return json({ error: 'Same-origin requests only' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON required' }, { status: 415 });
  const text = await request.text();
  if (text.length > 110000) return json({ error: 'Request too large' }, { status: 413 });
  try {
    const data = JSON.parse(text);
    const result = await exclusive(async () => {
      if (data.action === 'saveFull' && typeof data.path === 'string' && typeof data.content === 'string' && typeof data.revision === 'string') return repository.saveFull(data.path, data.content, data.revision);
      if (data.action === 'save' && typeof data.path === 'string' && typeof data.working === 'string' && typeof data.revision === 'string') return repository.save(data.path, data.working, data.revision);
      if (data.action === 'commit' && typeof data.message === 'string') return repository.commit(data.message);
      if (data.action === 'push') return repository.push();
      throw new Error('Invalid action');
    });
    return json({ result, git: await repository.status() });
  } catch (e) { return json({ error: (e as Error).message }, { status: e instanceof Conflict ? 409 : 400 }); }
}
