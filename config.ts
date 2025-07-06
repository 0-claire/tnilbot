const config = {
	prefix: '$',

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
		timeoutMs: 1000*20,
		questionTimoutMs: 1000*5,
		// how long to wait before giving an answer and giving the next question
		answerQuestionIntervalMs: 1000*2.5,
		maxUninteractedQuestions: 3,
		maxLength: 20,
	},
};

export default config
