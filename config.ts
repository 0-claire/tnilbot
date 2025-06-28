const config = {
	fonts: {
		basic: {
			font: '100px IthkuilBasic',
			path: './IthkuilBasic.ttf',
			name: 'Ithkuil Basic',
		},
		flow: {
			font: '100px IthkuilFlow',
			path: './IthkuilFlow.ttf',
			name: 'Ithkuil Flow',
		},
	},

	rendering: {
		spaceBetweenWords: false, // spaces between words feature is in beta
	},

	// Quizzes
	quizzes: {
		numberTries: 5,
		inversionByDefault: true,
	},
};

export default config
