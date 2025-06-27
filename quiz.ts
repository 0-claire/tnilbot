export default function quiz(interaction, settings: {
	inverted: boolean,
	wordLength: number,
	collaborative: boolean,
	quizLength: number,
}) {
	// initialize stats
	const stats: {
		users: {
			id: string,
			points: number,
			// answeredQuestions: number, // answered
			correctQuestions: number, // answered correctly
			quickestAnswseredQuestions: number, // answered before anyone else
		}[],
		winner: string | null,
	} = {
		users: [],
		winner: null,
	};

	// get interaction channel
	// listen for messages
	// aggregate accuracy per question & per char/ext
	// calculate percentage score as well as raw points
	// TODO: require minimum percentage to win
	// return embed with user stat and winner(s) if present
}
