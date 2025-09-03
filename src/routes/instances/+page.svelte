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
				last_check?: EpochTimeStamp | string;
				uptime?: number;
			};
		}>;
	};

	const toEpochMs = (value: unknown): number | undefined => {
		if (typeof value === 'number' && Number.isFinite(value)) {
			// If it's seconds, convert to ms
			return value < 1_000_000_000_000 ? value * 1000 : value;
		}
		if (typeof value === 'string') {
			// If numeric string
			const n = Number(value);
			if (Number.isFinite(n)) {
				return n < 1_000_000_000_000 ? n * 1000 : n;
			}
			// If ISO/date string
			const d = Date.parse(value);
			if (!Number.isNaN(d)) return d;
		}
		return undefined;
	};

	const parsedToml = parse(instanceToml) as ParsedToml;
	const instances: flur34.InstanceConfiguration[] = (parsedToml.instance ?? []).map((it) => {
		const lastCheckMs = toEpochMs(it.details?.last_check);
		return {
			name: it.name,
			url: it.url,
			country: it.country,
			description: it.description,
			status: 0, // no status in TOML; set a default or compute it
			source_url: it.source ?? '',
			details: {
				version: it.details?.version ?? 'N/A',
				// Do NOT fall back to "now" — leave 0 if missing/unparseable
				last_check: (lastCheckMs ?? 0) as EpochTimeStamp,
				uptime: it.details?.uptime ?? 0
			}
		};
	});
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
		<p style="text-decoration: underline;">
			This is all dummy-data. Actual data fetching is not implemented yet.
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
