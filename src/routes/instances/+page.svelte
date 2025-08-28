<script lang="ts">
	import { APP_NAME } from '$lib/logic/app-name.js';
	import Heading1 from '$lib/components/pure/heading/Heading1.svelte';
	import Instance from '$lib/components/pure/instance/Instance.svelte';
	import instanceToml from '/instances.toml?raw';
	import { parse } from 'smol-toml';

	type ParsedToml = {
		instance?: Array<{
			name: string;
			url: string;
			country: string;
			description: string;
			source?: string;
			details?: {
				version?: string;
				last_check?: EpochTimeStamp;
				uptime?: number;
			};
		}>;
	};

	const parsedToml = parse(instanceToml) as ParsedToml;
	const instances: flur34.InstanceConfiguration[] = (parsedToml.instance ?? []).map((it) => ({
		name: it.name,
		url: it.url,
		country: it.country,
		description: it.description,
		status: 0, // no status in TOML; set a default or compute it
		source_url: it.source ?? '',
		details: {
			version: it.details?.version ?? 'N/A',
			last_check:
				typeof it.details?.last_check === 'number'
					? (it.details!.last_check as EpochTimeStamp)
					: (Date.now() as EpochTimeStamp),
			uptime: it.details?.uptime ?? 0
		}
	}));
</script>

<svelte:head>
	<title>{APP_NAME} - Instances</title>
	<meta name="description" content="Hosting instructions for {APP_NAME}" />
</svelte:head>

<section>
	<Heading1>Public instances</Heading1>
	<div class="info-text">
		<p>Click on a host for more information!</p>
		<p>
			Note: This list is currently static. Future developments will allow others to request being
			added.
		</p>
	</div>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Country</th>
				<th>Description</th>
				<th>Uptime</th>
				<th>Source</th>
			</tr>
		</thead>
		{#each instances as instance}
			<Instance {...instance} />
		{/each}
	</table>
</section>

<style lang="scss">
	section {
		padding-inline: var(--grid-gap);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		border-radius: var(--border-radius);
	}

	th {
		text-align: left;
		text-transform: capitalize;
	}

	.info-text {
		font-size: var(--text-size-large);
		margin-bottom: 1rem;
		background: var(--background-1);
		width: 100%;
		padding: 1rem;
		border-radius: var(--border-radius);
	}
</style>
