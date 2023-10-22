<div class="wrapper">
	<div class="big-nav">
		<nav>
			<div class="header-item">
				<button class="title" on:click={() => (window.location.href = '/')}>
					<p><strong>Hem</strong></p>
				</button>
			</div>

			<div class="header-item">
				<button class="title" on:click={() => (window.location.href = '/')}>
					<p><strong>Motion</strong></p>
				</button>
			</div>

			<div class="header-item">
				<button class="title" on:click={() => (window.location.href = '/')}>
					<p><strong>Proposition</strong></p>
				</button>
			</div>
		</nav>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
	}
	nav {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	nav > :first-child {
		margin-left: 1rem;
		margin-right: 3rem;
	}

	button {
		background-color: rgb(255, 241, 241);
		border: 1px solid rgb(255, 241, 241);
		border-radius: 0.5rem;
		height: min-content;
	}

	button:hover {
		background-color: rgb(255, 241, 241, 0.8);
	}
</style>
