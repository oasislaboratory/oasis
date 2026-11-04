<script lang="ts">
  import ObjectiveWindow from '$lib/ObjectiveWindow.svelte';
  let { data } = $props();
</script>
<svelte:head><title>{data.objective.title}</title></svelte:head>
<main>{#key data.objective.path}<ObjectiveWindow node={data.objective} embedded={data.embedded}/>{/key}</main>
<style>:global(body) { margin: 8px; font: 14px/1.35 sans-serif; }</style>
