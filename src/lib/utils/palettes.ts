export interface ColorPalette {
	name: string;
	colors: string[];
	description?: string;
}

export const palettes: ColorPalette[] = [
	{
		name: 'Default',
		colors: [
			'#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
			'#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
			'#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700'
		]
	},
	{
		name: 'Game Boy',
		description: 'Classic Game Boy green palette',
		colors: [
			'#0f380f', '#306230', '#8bac0f', '#9bbc0f'
		]
	},
	{
		name: 'NES',
		description: 'Nintendo Entertainment System',
		colors: [
			'#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc',
			'#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078fc',
			'#0000fc', '#b8b8f8', '#6888fc', '#0058f8',
			'#0000bc', '#d8b8f8', '#9878f8', '#6844fc'
		]
	},
	{
		name: 'Pico-8',
		description: 'Fantasy console palette',
		colors: [
			'#000000', '#1d2b53', '#7e2553', '#008751',
			'#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
			'#ff004d', '#ffa300', '#ffec27', '#00e436',
			'#29adff', '#83769c', '#ff77a8', '#ffccaa'
		]
	},
	{
		name: 'Pastel Dream',
		description: 'Soft pastel colors',
		colors: [
			'#ffd6e7', '#ffb3d9', '#ff99cc', '#ffccff',
			'#e6ccff', '#ccccff', '#b3d9ff', '#99ccff',
			'#b3ffff', '#ccffcc', '#ffffcc', '#ffccb3',
			'#ffb3b3', '#fff0b3', '#e6ffb3', '#b3ffb3'
		]
	},
	{
		name: 'Neon Lights',
		description: 'Vibrant neon colors',
		colors: [
			'#ff006e', '#fb5607', '#ffbe0b', '#8338ec',
			'#3a86ff', '#06ffa5', '#ff4365', '#00d9ff',
			'#72ff00', '#ff00ff', '#00ffff', '#ffff00'
		]
	},
	{
		name: 'Material Design',
		description: 'Google Material Design colors',
		colors: [
			'#f44336', '#e91e63', '#9c27b0', '#673ab7',
			'#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
			'#009688', '#4caf50', '#8bc34a', '#cddc39',
			'#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
		]
	},
	{
		name: 'Autumn',
		description: 'Warm autumn colors',
		colors: [
			'#8b4513', '#d2691e', '#cd853f', '#daa520',
			'#b8860b', '#ff8c00', '#ff7f50', '#ff6347',
			'#dc143c', '#b22222', '#8b0000', '#800000',
			'#ffff99', '#ffd700', '#ff9966', '#cc6633'
		]
	},
	{
		name: 'Ocean',
		description: 'Deep sea blues and greens',
		colors: [
			'#001f3f', '#003366', '#004080', '#0059b3',
			'#0073e6', '#1a8cff', '#4da6ff', '#80bfff',
			'#006666', '#008080', '#009999', '#00b3b3',
			'#00cccc', '#00e6e6', '#00ffff', '#b3ffff'
		]
	},
	{
		name: 'Monochrome',
		description: 'Black to white gradient',
		colors: [
			'#000000', '#111111', '#222222', '#333333',
			'#444444', '#555555', '#666666', '#777777',
			'#888888', '#999999', '#aaaaaa', '#bbbbbb',
			'#cccccc', '#dddddd', '#eeeeee', '#ffffff'
		]
	},
	{
		name: 'C64',
		description: 'Commodore 64 palette',
		colors: [
			'#000000', '#ffffff', '#880000', '#aaffee',
			'#cc44cc', '#00cc55', '#0000aa', '#eeee77',
			'#dd8855', '#664400', '#ff7777', '#333333',
			'#777777', '#aaff66', '#0088ff', '#bbbbbb'
		]
	},
	{
		name: 'Sunset',
		description: 'Warm sunset gradients',
		colors: [
			'#001a33', '#003366', '#004080', '#ff6b35',
			'#f77f00', '#fcbf49', '#eae2b7', '#ffee99',
			'#ff9966', '#ff6666', '#ff3366', '#cc0066',
			'#990066', '#660066', '#ffcccc', '#ffe6cc'
		]
	}
];

export function getPaletteByName(name: string): ColorPalette | undefined {
	return palettes.find(p => p.name === name);
}