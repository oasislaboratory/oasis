<script lang="ts">
  import ObjectiveWindow from './ObjectiveWindow.svelte';
  import type { Objective } from './server/repository';
  import { untrack } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { invalidateAll } from '$app/navigation';
  let { node, top = false, onSaved }: { node: Objective; top?: boolean; onSaved: (message: string) => void } = $props();
  let expanded = $state(untrack(() => top));
  let editing = $state(false);
  let draft = $state('');
  let revision = $state('');
  let busy = $state(false);
  let problem = $state('');
  beforeNavigate(({ cancel }) => { if (editing && draft !== node.working && !confirm('Leave without saving this draft?')) cancel(); });
  async function save() {
    busy = true; problem = '';
    try {
      const response = await fetch('/api/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', path: node.path, working: draft, revision }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      editing = false; await invalidateAll(); onSaved(`${node.title} saved to disk. Commit when ready.`);
    } catch (e) { problem = (e as Error).message; } finally { busy = false; }
  }
</script>
<svelte:window onbeforeunload={(event) => { if (editing && draft !== node.working) { event.preventDefault(); event.returnValue = ''; } }}/>
<article class:top class:expanded>
  <header>
    <button class="toggle" aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.title}`} onclick={() => expanded = !expanded}>{expanded ? '−' : '+'}</button>
    <div class="heading"><span class="eyebrow">{node.path || 'ROOT OBJECTIVE'}</span><h2>{node.title}</h2></div>
    <span class="count">{node.children.length} {node.children.length === 1 ? 'branch' : 'branches'}</span>
    {#if !top}<a class="focus" href={'/' + node.path.split('/').map(encodeURIComponent).join('/')} aria-label={`Focus ${node.title}`}>Open ↗</a>{/if}
  </header>
  {#if expanded}
    <div class="body">
      <div class="section-label">DESIRED OUTCOME <span>Protected intent</span></div>
      <div class="markdown">{@html node.intentHtml}</div>
      <div class="work-header"><div class="section-label">WORKING STATE</div><button class="small" onclick={() => { if (editing && draft !== node.working && !confirm('Discard unsaved edits?')) return; editing = !editing; draft = node.working; revision = node.revision; problem = ''; }}>{editing ? 'Cancel' : 'Edit inline'}</button></div>
      {#if editing}
        <label class="sr-only" for={'edit-' + node.path}>Working state for {node.title}</label>
        <textarea id={'edit-' + node.path} bind:value={draft} placeholder="## Observed state\nWhat happened?\n\n## Next action\nWhat will you test?" rows="9"></textarea>
        <div class="save-row"><span>Markdown · saved in objective.md</span><button class="primary" disabled={busy} onclick={save}>{busy ? 'Saving…' : 'Save working state'}</button></div>
      {:else if node.working}<div class="markdown">{@html node.workingHtml}</div>
      {:else}<p class="empty">No observations yet. Record progress, evidence, and the next action.</p>{/if}
      {#if problem}<p class="error" role="alert">{problem}</p>{/if}
      {#if node.directives.length}<details><summary>Inherited directives <span>{node.directives.length}</span></summary>{#each node.directives as directive}<div class="directive"><strong>{directive.path}</strong><pre>{directive.content}</pre></div>{/each}</details>{/if}
      {#if node.children.length}<div class="children-label">CHILD OBJECTIVES <span>Expand branches independently</span></div><div class="children">{#each node.children as child (child.path)}<ObjectiveWindow node={child} {onSaved}/>{/each}</div>{/if}
    </div>
  {/if}
</article>
