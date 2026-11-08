<script lang="ts">
  import type { Objective } from './server/repository';
  import { onMount, untrack } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  type RoundSummary = { name: string; status: string; hypothesis: string; prediction: string; observations: string; constraints: string; comparison: string };
  let { node, embedded = false, round = null }: { node: Objective; embedded?: boolean; round?: RoundSummary | null } = $props();
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
<section class:embedded>
  <header>
    <h1><a href={url(node.path)} target="_top">{node.path || 'Oasis/'}</a></h1>
    {#if draft !== baseline}<button disabled={busy} onclick={save}>{busy ? 'Saving…' : 'Save'}</button>{/if}
    <span role="status">{message}</span>
  </header>
  <textarea id="objective" aria-label="objective.md" bind:value={draft} oninput={(event) => { draft = event.currentTarget.value; message = ''; remember(); }}></textarea>
  {#if problem}<p role="alert">{problem} <button disabled={busy} onclick={reload}>Reload saved version</button></p>{/if}
  {#if round}
    <details class="experiment">
      <summary>Round {round.name} · {round.status || 'Status unknown'} · uncertainty: {round.comparison === 'Pending.' ? 'unresolved' : 'review evidence'}</summary>
      <dl>
        <dt>Hypothesis</dt><dd>{round.hypothesis || 'Not recorded'}</dd>
        <dt>Prediction</dt><dd>{round.prediction || 'Not recorded'}</dd>
        <dt>Evidence</dt><dd>{round.observations || 'Not recorded'}</dd>
        <dt>Risk / constraints</dt><dd>{round.constraints || 'Not recorded'}</dd>
        <dt>Comparison</dt><dd>{round.comparison || 'Not evaluated'}</dd>
      </dl>
    </details>
  {/if}
  <div class="children">
    {#each node.children as child (child.path)}
      <details open={!embedded}>
        <summary>{child.title}</summary>
        <iframe src={url(child.path) + '?embedded=1'} title={child.path} loading="lazy"></iframe>
      </details>
    {/each}
  </div>
</section>
<style>
  header { display: flex; align-items: center; gap: 8px; min-height: 28px; }
  h1 { font-size: 14px; font-weight: normal; margin: 0; min-width: 0; overflow-wrap: anywhere; }
  header span { font-size: 12px; }
  textarea { display: block; box-sizing: border-box; width: 100%; height: 9rem; resize: vertical; font: 14px/1.35 monospace; padding: 4px; }
  .embedded textarea { height: 7rem; }
  .children { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 8px; margin-top: 8px; align-items: start; }
  .embedded .children { grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr)); }
  details { min-width: 0; }
  summary { cursor: pointer; overflow-wrap: anywhere; }
  iframe { display: block; box-sizing: border-box; width: 100%; height: 20rem; border: 1px solid #aaa; }
  p { margin: 4px 0; overflow-wrap: anywhere; }
  .experiment { margin-top: 6px; font-size: 12px; }
  .experiment dl { max-height: 14rem; overflow: auto; }
  .experiment dt { font-weight: bold; }
  .experiment dd { margin: 0 0 5px; white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
