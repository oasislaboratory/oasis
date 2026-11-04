<script lang="ts">
  import ObjectiveWindow from '$lib/ObjectiveWindow.svelte';
  import { invalidateAll } from '$app/navigation';
  let { data } = $props();
  let message = $state(''); let problem = $state(''); let busy = $state(false); let commitMessage = $state('Update objective working state');
  async function action(name: string) {
    if (name === 'push' && !confirm('Push the current branch to its configured Git upstream?')) return;
    busy = true; problem = ''; message = '';
    try { const response = await fetch('/api/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: name, message: commitMessage }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); message = name === 'commit' ? 'Committed locally.' : 'Pushed upstream.'; await invalidateAll(); } catch (e) { problem = (e as Error).message; } finally { busy = false; }
  }
</script>
<svelte:head><title>{data.objective.title}</title></svelte:head>
<main>
  {#key data.objective.path}<ObjectiveWindow node={data.objective} embedded={data.embedded}/>{/key}
  {#if data.git}<footer><details><summary>Git</summary><pre>{data.git.branch} {data.git.head}\n{data.git.changes}</pre><label for="commit">Commit message</label><input id="commit" bind:value={commitMessage}/><button disabled={busy} onclick={() => action('commit')}>Commit objectives</button><button disabled={busy} onclick={() => action('push')}>Push upstream</button></details>
  {#if message}<p role="status">{message}</p>{/if}{#if problem}<p role="alert">{problem}</p>{/if}
  </footer>{/if}
</main>
