<script lang="ts">
	import { APP_NAME } from '$lib/logic/app-config';

	const now = new Date();
	const getTitle = (date: Date) => {
		const dayMonth = `${date.getDate()}-${date.getMonth()}`;
		if (dayMonth === '24-12' || dayMonth === '25-12') {
			return APP_NAME + '🎅';
		}

		return APP_NAME;
	};

	const getClass = (date: Date) => {
		if (date.getMonth() === 5) {
			return 'pride';
		}

		return 'default';
	};

	const title = getTitle(now);
	const cssClass = getClass(now);
</script>

<div class="title-card">
	<h1 class={cssClass}>{@html title}</h1>
	<h2 class="subtitle">powered by KuroSearch &copy;</h2>
</div>

<style lang="scss">
	.title-card {
		font-family: 'Zen Kaku Gothic New', sans-serif;
		user-select: none;

		h1 {
			font-size: 6rem;
			font-weight: 600;
			text-align: center;
			color: var(--accent);
			line-height: 72px;
		}

		@media (max-width: 600px) {
			h1 {
				font-size: 12vw;
				line-height: 12vw;
			}
		}

		.pride {
			background-size: 100% 80%;
			background: linear-gradient(
					#60d0fa 30%,
					#60d0fa 42%,
					#f5aab9 42%,
					#f5aab9 54%,
					#fff 54%,
					#fff 66%,
					#f5aab9 66%,
					#f5aab9 78%,
					#60d0fa 78%,
					#60d0fa 90%
				)
				bottom;
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}

		.subtitle {
			font-size: 1rem;
			font-weight: 600;
			display: flex;
			place-content: flex-end;
		}
	}
</style>
