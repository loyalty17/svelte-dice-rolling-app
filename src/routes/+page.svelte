<script lang="ts">
	import { onMount } from 'svelte';
	import { init } from '$lib/scene';
	import dice_logo from '$lib/images/dice.png';

	let canvasEL:HTMLCanvasElement;

	onMount(() => {
		init(canvasEL);
	});

</script>

<svelte:head>
	<title>Three.js Sveltekit</title>
	<meta name="description" content="Three.js example app built with Svelte" />
</svelte:head>

<div class="container mx-auto mt-2 w-[50%] px-2 py-2" id="app_page">
	<div class="text-center" id="app_title">
		<img class="w-[60px] h-[60px] mx-auto" src={dice_logo} alt="dice-logo" />
		<p class="text-4xl mt-10">DICE ROLLING GAME</p>
	</div>
	<div class="mx-auto bg-grey-300">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="block text-gray-600 font-semibold mb-2">Spin Time:</label>
		<input
			id="spin_time_input"
			type="number"
			class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
		/>
	</div>

	<div class="mt-5">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="block text-gray-600 font-semibold mb-2">Dice Size:</label>
		<input id="dice_size_input" type="range" class="w-full" min="1" max="12" step="1" />
	</div>
	
	<div class="grid grid-cols-2 gap-6 mt-3">
		<div class="bg-grey-300">
			<label class="block text-gray-600 font-semibold mb-2">Front Face:</label>
			<input
				id="front_gift_input"
				type="text"
				class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
				placeholder="Front"
			/>
		</div>
		<div class="bg-grey-300">
			<label class="block text-gray-600 font-semibold mb-2">Back Face:</label>
			<input
				id="back_gift_input"
				type="text"
				class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
				placeholder="Back"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-6 mt-3">
		<div class="bg-grey-300">
			<label class="block text-gray-600 font-semibold mb-2">Top Face:</label>
			<input
				id="top_gift_input"
				type="text"
				class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
				placeholder="Top"
			/>
		</div>
		<div class="bg-grey-300">
			<label class="block text-gray-600 font-semibold mb-2">Bottom Face:</label>
			<input
				id="bottom_gift_input"
				type="text"
				class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
				placeholder="Bottom"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-6 mt-3">
		<div class="bg-grey-300">
			<label class="block text-gray-600 font-semibold mb-2">Left Face:</label>
			<input
				id="right_gift_input"
				type="text"
				class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
				placeholder="Right"
			/>
		</div>
		<div class="bg-grey-300">
			<label class="block text-gray-600 font-semibold mb-2">Right Face:</label>
			<input
				id="left_gift_input"
				type="text"
				class="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
				placeholder="Left"
			/>
		</div>
	</div>

	<div id="winning_faces_div">
		<p class="text-3xl mt-5 mb-5 px-2">Winning faces:</p>
	</div>

	<div class="h-[150px] px-2" id="adding_faces_div">
		<p class="text-3xl mt-5 mb-5">Adding a winning face:</p>
		<button class="w-[80px] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded mt-1 mx-1" id="front_select_btn" value="0">Front</button>
		<button class="w-[80px] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded mt-1 mx-1" id="back_select_btn" value="0">Back</button>
		<button class="w-[80px] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded mt-1 mx-1" id="top_select_btn" value="0">Top</button>
		<button class="w-[80px] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded mt-1 mx-1" id="bottom_select_btn" value="0">Bottom</button>
		<button class="w-[80px] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded mt-1 mx-1" id="right_select_btn" value="0">Right</button>
		<button class="w-[80px] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded mt-1 mx-1" id="left_select_btn" value="0">Left</button>
	</div>

	<div class="mt-5 ui-controls">
		<button class="w-[100%] bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded" id="roll_btn">Make it Roll</button>
	</div>

	<div class="ui-controls fixed bottom-0 left-0 right-0 flex-1 flex items-center justify-center" id="action_div" style="display: none;" >
		<div class=" shadow-md bg-[#3e404b] p-9 rounded-xl w-full mx-3 max-w-[700px] mb-4 mx-auto">
			<h1 class="text-[25px] text-center pb-4 text-[#fff] flex-col gap-1 flex "> 
				<span class="text-[50px]" id="result_span"></span>
			</h1>
			<div class="flex items-center justify-between gap-4 ">
				<button 
					class=" text-[#3e404b] text-[20px] w-[250px] w-full h-[32px] bg-[#fff]  font-[dice] cursor-pointer rounded-lg py-[2rem] flex items-center justify-center "
					id="back_btn"	
				>
					Back
				</button>
				<button 
					class=" text-[#3e404b] text-[20px] w-[250px] w-full h-[32px] bg-[#fff]  font-[dice] cursor-pointer rounded-lg py-[2rem] flex items-center justify-center "
					id="again_btn"
				>
					Throw Again
				</button>
			</div>
		</div>
	</div>

	<canvas bind:this={canvasEL} id="canvas" />

</div>

<style>
	*,
	*::after,
	*::before {
		box-sizing: border-box;
	}

	:root {
		font-size: 16px;
		--color-text: #000;
		--color-bg: #ddd;
		--color-link: #888;
		--color-link-hover: #000;
	}

	@keyframes loaderAnim {
		to {
			opacity: 1;
			transform: scale3d(0.5,0.5,1);
		}
	}

	body {
		margin: 0;
		overflow: hidden;
		position: relative;
	}

	canvas {
		position: absolute;
		top: 0;
		left: 0;
	}

	input {
		background-color: lightgrey;
	}

	#adding_faces_div {
		background-color: lightgrey;
	}

	#action_div {
		position: absolute;
		/* top: 50%; */
		/* left: 50%; */
		/* transform: translate(-50%, -50%); */
		padding: 20px;
		/* background-color: #3498db; */
		color: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		z-index: 1; /* Ensure the div appears above the canvas */
	}
</style>
