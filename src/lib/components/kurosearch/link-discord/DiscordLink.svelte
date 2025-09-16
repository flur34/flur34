<script>
	import IconLink from '$lib/components/pure/icon-link/IconLink.svelte';
	import DiscordIcon from './DiscordIcon.svelte';
	import { DISCORD_URL } from '$lib/logic/app-config.js';
</script>

<IconLink title="Discord Server" href={DISCORD_URL} newtab>
	<DiscordIcon />
</IconLink>
