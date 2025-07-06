import {
	User, Snowflake, CommandInteraction, Message,
} from 'discord.js';
import config from './config.js';
import { Font, sleep, } from './util.js';
import {
	generateSecondary, GenerateResult, GeneratedQuestion, generateAffix,
} from './generator.js';

export type UserID = Snowflake & string;
export type ChannelID = Snowflake & string;
export type CommandID = Snowflake & string;
export type QuizType = |'secondaries'|'affixes';

export interface QuizOptions {
	extensions: boolean;
	time: number;
	type: QuizType;
	inversions: boolean;
	wordLength: number;
	collaborative: boolean;
	length: number;
	font: Font | 'random';
}

export class Quiz implements QuizOptions {
	extensions: boolean;
	inversions: boolean;
	readonly time: number;
	wordLength: number;
	index: number;
	collaborative: boolean;
	length: number;
	font: Font | 'random';
	type: QuizType;
	timeout: number;

	settings: QuizOptions;
	interaction: CommandInteraction;
	interactionTimer: ReturnType<typeof setTimeout> | null;
	private active: boolean;

	engagements: Engagement[];

	// initialize stats
	stats: {
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

	sendQuestion: (result: {image: any, answer: string}) => Promise<any>;
	answerQuestion: (answer: string) => Promise<any>;
	announceWinner: (winner: User, answer: string) => Promise<any>;
	declareEnd: (stats) => Promise<any>;
	questionTimer: ReturnType<typeof setTimeout>;
	
	lastQuestion: {
		winner: null | User;
		answer: string;
	};
	uninteractedQuestions: number;
	processingAttempt: boolean;

	constructor(interaction: CommandInteraction, settings: QuizOptions) {
		this.active = false;
		this.interaction = interaction;
		this.settings = settings;
		this.type = settings.type;
		this.timeout = config.quizzes.timeoutMs;
		this.engagements = [];
		this.processingAttempt = false;
		this.uninteractedQuestions = 0;
		this.index = 0;
		this.length = settings.length <= config.quizzes.maxLength ? settings.length : config.quizzes.maxLength;
		this.interactionTimer = null;
		settings.time = settings.time * 1000
		this.time = settings.time <= config.quizzes.maxQuestionTimeoutMs ? settings.time : config.quizzes.maxQuestionTimeoutMs;
		this.extensions = settings.extensions;
	}

	private setQuestionTimer() {
		this.questionTimer = setTimeout(this.nextQuestion.bind(this), this.time);
	}
	private setInteractionTimer() {
		async function ender() {
			await this.end('timer')
		}
		this.interactionTimer = setTimeout(ender.bind(this), config.quizzes.timeoutMs);
	}

	private clearQuestionTimeout() {
		clearTimeout(this.questionTimer);
		this.questionTimer = null;
	}
	private clearInteractionTimeout() {
		clearTimeout(this.interactionTimer);
		this.interactionTimer = null;
	}

	private attemptQueue: Message[];

	ending: boolean; // has this quiz received a cancel command?

	async activate(sendQuestion: (result: {image: any, answer: string}) => Promise<any>, answerQuestion: (answer: string) => Promise<any>, announceWinner: (winner: User, answer: string) => Promise<any>, declareEnd: (stats) => Promise<any>) {
		// for when no one gets it
		this.answerQuestion = answerQuestion;
		this.sendQuestion = sendQuestion;
		this.announceWinner = announceWinner;
		this.active = true;
		this.attemptQueue = [];
		this.ending = false;
		this.declareEnd = declareEnd;
		await this.nextQuestion();
	}


	private async wrapQuestion(): Promise<void> {
		if(!this.lastQuestion)
			return;
		else {
			if(!this.lastQuestion?.winner)
				await this.answerQuestion(this.lastQuestion.answer);
			delete this.lastQuestion;
		}
		await this.awaitInterval();
		return;
	}

	private async awaitInterval() {
		await sleep(config.quizzes.questionTimoutMs);
		return;
	}

	private async awaitInterim() {
		await sleep(config.quizzes.answerQuestionIntervalMs);
		return;
	}
	
	private async processAttempt() {
		this.processingAttempt = true;

		while(true) {
			if(this.lastQuestion?.winner) {
				// this.announceWinner(this.lastQuestion?.winner, this.lastQuestion.answer);
				// delete this.lastQuestion;
			} else if(this.attemptQueue.length < 1)
				break;
			else if(this.ending)
				break;
			else {
				const message = this.attemptQueue.shift();
				if(await this.validateAttempt(message)) {
					// TODO: augment stats
					if(this.ending)
						return;
					await this.announceWinner(message.author, this.lastQuestion.answer);
					delete this.lastQuestion;
					await this.awaitInterim();
					this.clearQuestionTimeout();
					await this.nextQuestion();
				} else 
					await message.react('❌');
				
			}
			await sleep(25);
		}

		this.processingAttempt = false;
	};

	private async validateAttempt(message: Message): Promise<boolean> {

		const attempt: string = message.content;
		// TODO: perform substitutions foor chars where desired
		if(message.content.startsWith('$')) {
			if(message.content === '$cancel') {
				await this.end('cancel received');
				return false;
				// allow skip too
			} else
				return false;
		}
		this.uninteractedQuestions = 0;
		if(attempt?.toLowerCase() === this.lastQuestion?.answer?.toLowerCase()) {
			this.clearQuestionTimeout();
			this.clearInteractionTimeout();
			this.lastQuestion.winner = message.author;
			return true;
		} else 
			return false;
		
		
	}

	async receiveAttempt(message: Message) {
		if(this.ending)
			return;

		this.attemptQueue.push(message);

		if(this.processingAttempt)
			return;
		else
			this.processAttempt();
	}

	private async nextQuestion() {
		if(!this.active)
			throw new Error("QUIZ_NOT_ACTIVE");
		if(this.ending)
			return;

		this.uninteractedQuestions++;

		if(this.uninteractedQuestions > config.quizzes.maxUninteractedQuestions) {
			return await this.end('max');
		}

		if(this.index === this.length) {
			// TODO: better end style pls
			return await this.end('finished');
		}

		this.clearQuestionTimeout();

		// processing

		// wrap up last question with answer, if unanswered, and sleep
		await this.wrapQuestion();
	
		let result: GenerateResult | null = null;

		switch(this.type) {
		case 'secondaries': {
			// re-attempt generation
			while(!result || typeof result === 'string') {
				result = await generateSecondary({
					...this.settings,
					inverted: this.settings.inversions, 
				});
			}
				
		};
		case 'affixes': {
			while(!result || typeof result === 'string') 
				result = await generateAffix(this.inversions, this.font, this.extensions);
			
		};
		}

		// for shitty ts
		if(typeof result === 'string' || !result)
			throw new Error();

		this.lastQuestion = {
			winner: null,
			answer: result.answer,
		};

		if(this.ending)
			return;

		await this.sendQuestion(result);

		if(this.ending)
			return;

		this.processingAttempt = false;
		this.setQuestionTimer();

		// if the last interaction timer's been cleared, set a new one
		if(!this.interactionTimer)
			this.setInteractionTimer();
	}

	private async end(reason: string) {
		console.log('ending, reason:', { reason: reason, trace: '' });
		if(this.ending)
			return;
		this.ending = true;
		// remove this quiz from quizzes
		this.clearQuestionTimeout();
		this.clearInteractionTimeout();
		await this.declareEnd(this.stats);
		this.destroy();
	}

	destroy() {
		this.engagements.forEach(destroyEngagement);
		if(this.collaborative)
			quizzes[this.interaction.channelId].publicQuiz = null;
		else
			quizzes[this.interaction.channelId].privateQuizzes.delete(this.interaction.commandId);
	}

	addEngagement(engagement: Engagement) {
		this.engagements.push(engagement);
	}

	// get interaction channel
	// listen for messages
	// aggregate accuracy per question & per char/ext
	// calculate percentage score as well as raw points
	// TODO: require minimum percentage to win
	// return embed with user stat and winner(s) if present
}

export const quizzes: {
	[key: ChannelID]: {
		publicQuiz: Quiz | null,
		privateQuizzes: Map<CommandID, Quiz>,
	}
} = {};

export type EngagementType = |'quiz';

export class Engagement {
	channelId: ChannelID;
	userId: UserID;
	type: EngagementType;
	commandId: CommandID;

	constructor(interaction: CommandInteraction, type: EngagementType) {
		this.channelId = interaction.channelId;
		this.userId = interaction.user.id;
		this.type = type;
		this.commandId = interaction.commandId;
	}
};

export const engagedUsers: { [key: UserID]: Engagement } = {};

export function initiateQuiz(interaction: CommandInteraction, options: QuizOptions): string | Quiz {
	const userId = interaction.user.id;
	const channelId = interaction.channelId;
	let capsule;
	let quiz;
	// check user engagement, end quiz
	if(quizzes.hasOwnProperty(channelId)) {} else {
		quizzes[channelId] = {
			publicQuiz: null,
			privateQuizzes: new Map(),
		};
		// capsule = quizzes[channelId];
	}
	// check user engagement
	// end prev quiz if applicable
	if(engagedUsers[userId])
		return "ALREADY_ENGAGED";
	if(options.collaborative === true) {
		if(quizzes[channelId].publicQuiz !== null)
			return "QUIZ_IN_CHANNEL_EXISTS";
		else {
			quizzes[channelId].publicQuiz = new Quiz(interaction, options);
			// quiz = capsule.publicQuiz;
			return quizzes[channelId].publicQuiz;
		}
	} else {
		const quiz = new Quiz(interaction, options);
		quizzes[channelId].privateQuizzes.set(interaction.commandId, quiz);
		const engagement = new Engagement(interaction, 'quiz'); 
		engagedUsers[userId] = engagement;
		quiz.addEngagement(engagement);
		return quiz;
	}
}

export function destroyEngagement(engagement: Engagement) {
	delete engagedUsers[engagement.userId];
}
