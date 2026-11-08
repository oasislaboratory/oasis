import { error } from '@sveltejs/kit';
import { repository } from '$lib/server/repository';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

function section(markdown: string, name: string): string {
  const sections = markdown.split(/^## /m).slice(1);
  const match = sections.find(value => value.split('\n', 1)[0].trim() === name);
  return match ? match.slice(match.indexOf('\n') + 1).trim() : '';
}
async function latestRound(path: string) {
  const directory = join(await repository.directory(path), 'rounds');
  let names: string[];
  try { names = (await readdir(directory)).filter(name => /^\d{3}\.md$/.test(name)).sort(); }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null; throw e; }
  const name = names.at(-1);
  if (!name) return null;
  const markdown = await readFile(join(directory, name), 'utf8');
  return {
    name: name.replace('.md', ''),
    status: section(markdown, 'Status'),
    hypothesis: section(markdown, 'Hypothesis'),
    prediction: section(markdown, 'Prediction (freeze before execution)'),
    observations: section(markdown, 'Observations (append after execution)'),
    constraints: section(markdown, 'Authorization and constraints'),
    comparison: section(markdown, 'Comparison with prediction')
  };
}
export async function load({ params, url }) {
  const embedded = url.searchParams.get('embedded') === '1';
  try {
    const path = params.path || '';
    return { objective: await repository.node(path), embedded, round: await latestRound(path) };
  } catch (e) { error(404, (e as Error).message); }
}
