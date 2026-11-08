import { repository } from '$lib/server/repository';
export async function load() { return { git: await repository.status() }; }
