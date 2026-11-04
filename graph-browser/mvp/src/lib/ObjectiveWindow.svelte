<script lang="ts">
  import type { Objective } from './server/repository';
  import { onMount, untrack } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  let { node, embedded = false }: { node: Objective; embedded?: boolean } = $props();
  let draft = $state(untrack(() => node.content));
  let baseline = $state(untrack(() => node.content));
  let revision = $state(untrack(() => node.revision));
  let busy = $state(false);
  let problem = $state('');
  let message = $state('');
  const url = (path: string) => '/' + path.split('/').map(encodeURIComponent).join('/');
  const key = untrack(() => 'oasis-draft:' + node.path);
  function remember() {
    try {
      if (draft === baseline) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify({ draft, baseline, revision }));
    } catch { problem = 'Draft storage unavailable. Keep this window open until saved.'; }
  }
  onMount(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const saved = JSON.parse(stored);
        if (typeof saved.draft === 'string' && typeof saved.baseline === 'string' && typeof saved.revision === 'string') {
          draft = saved.draft; baseline = saved.baseline; revision = saved.revision;
          if (revision !== node.revision) problem = 'Objective or directives changed. Compare the current version before retrying.';
        }
      }
    } catch { problem = 'Draft storage unavailable.'; }
  });
  async function reload() {
    if (draft !== baseline && !confirm('Discard this draft and load the saved version?')) return;
    try {
      await invalidateAll();
      draft = baseline = node.content; revision = node.revision; problem = ''; message = ''; remember();
    } catch (e) { problem = (e as Error).message; }
  }
  async function save() {
    busy = true; problem = ''; message = '';
    try {
      const response = await fetch('/api/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'saveFull', path: node.path, content: draft, revision }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      baseline = result.result.content; revision = result.result.revision;
      remember(); await invalidateAll(); message = 'Saved to disk.';
    } catch (e) { problem = (e as Error).message; } finally { busy = false; }
  }
</script>
<svelte:window onbeforeunload={() => remember()}/>
<h1><a href={url(node.path)} target="_top">{node.path || '/'}</a></h1>
<textarea id="objective" aria-label="objective.md" rows="18" bind:value={draft} oninput={(event) => { draft = event.currentTarget.value; remember(); }}></textarea>
{#each node.children as child (child.path)}
  <details open={!embedded}>
    <summary>{child.title}</summary>
    <iframe src={url(child.path) + '?embedded=1'} title={child.path} loading="lazy"></iframe>
  </details>
{/each}
<footer>
  <button disabled={busy} onclick={save}>Save</button>
  <span role="status">{message || (draft !== baseline ? 'Unsaved draft' : '')}</span>
  {#if problem}<p role="alert">{problem}</p>{/if}
  <details>
    <summary>Options</summary>
    {#if node.path}<a href="/" target="_top">Root</a>{/if}
    <button disabled={busy} onclick={reload}>Reload saved version</button>
    <p>Experimental: protected intent cannot be saved.</p>
    {#each node.directives as directive}<h2>{directive.path}</h2><pre>{directive.content}</pre>{/each}
  </details>
</footer>
<style>
  textarea { display: block; box-sizing: border-box; width: 100%; resize: vertical; }
  iframe { display: block; box-sizing: border-box; width: 100%; height: 32rem; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  h1, h2 { font-size: 1rem; }
</style>
