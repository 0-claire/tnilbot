import {
	User, Snowflake, CommandInteraction, Message, CacheType,
} from 'discord.js';
import config from './config.js';
import { Font, sleep, } from './util.js';
import {
	generateSecondary, GenerateResult, GeneratedQuestion, generateAffix, generateExtensions, generateCaseChar,
	generateIllVal,
} from './generator.js';
import { sanitizeInput, } from './transform.js';

export type UserID = Snowflake & string;
export type ChannelID = Snowflake & string;
export type CommandID = Snowflake & string;
export type QuizType = |'secondaries'|'affixes'|'extensions'|'cases'|'ill_val';

export interface QuizOptions {
	extensions: boolean;
	time: number;
	type: QuizType | null;
	inversions: boolean;
	wordLength: number;
	collaborative: boolean;
	length: number;
	font: Font | 'random';
	ignoreMissingApostrophes: boolean;
	shortcuts: boolean;
	fontColor: string | null;
	backgroundColor: string | null;
	borderColor: string | null;
}

export class QuizOptionsModel implements QuizOptions {
	extensions: boolean;
	time: number;
	type: QuizType;
	inversions: boolean;
	wordLength: number;
	collaborative: boolean;
	length: number;
	font: Font | 'random';
	ignoreMissingApostrophes: boolean;
	shortcuts: boolean;
	fontColor: string | null;
	backgroundColor: string | null;
	borderColor: string | null;

	constructor(options/*: CommandInteraction['options']*/, subcommand = null) {
		this.inversions = options.get('inverted')?.value || true;
		this.extensions = options.get('extensions')?.value || true;
		this.time = options.get('time')?.value;
		this.font = options.get('font')?.value;
		this.fontColor = options.get('font_color')?.value;
		this.backgroundColor = options.get('background_color')?.value;
		this.borderColor = options.get('border_color')?.value;
		this.wordLength = options.get('group_size')?.value || 3;
		this.collaborative = options.get('collaborative')?.value || false;
		this.length = options.get('length')?.value || 5;
		this.shortcuts = options.get('shortcuts')?.value || false;
		this.ignoreMissingApostrophes = options.get('ignore_missing_apostrophes')?.value || false;
		this.type = subcommand;
	}
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
	ignoreMissingApostrophes: boolean;
	shortcuts: boolean;
	fontColor: string | null;
	backgroundColor: string | null;
	borderColor: string | null;

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

	sendQuestion: (result: GeneratedQuestion) => Promise<any>;
	answerQuestion: (answer: string | string[]) => Promise<any>;
	announceWinner: (winner: User, answer: string | string[]) => Promise<any>;
	declareEnd: (stats) => Promise<any>;
	questionTimer: ReturnType<typeof setTimeout>;
	
	lastQuestion: {
		winningMessage: Message | null;
		winner: null | User;
		answer: string | string[];
	};
	uninteractedQuestions: number;
	processingAttempt: boolean;
	questionInterim: boolean; // in the space between questions?

	constructor(interaction: CommandInteraction, settings: QuizOptions) {
		this.active = false;
		this.collaborative = settings.collaborative;
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
		settings.time = settings.time * 1000;
		this.time = settings.time <= config.quizzes.maxQuestionTimeoutMs ? settings.time : config.quizzes.maxQuestionTimeoutMs;
		this.extensions = settings.extensions;
		this.shortcuts = settings.extensions;
		this.fontColor = settings.fontColor;
		this.borderColor = settings.borderColor;
		this.backgroundColor = settings.backgroundColor;
	}

	private setQuestionTimer() {
		this.questionTimer = setTimeout(this.nextQuestion.bind(this), this.time);
	}
	private setInteractionTimer() {
		async function ender() {
			await this.end('timer');
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

	async activate(sendQuestion: (result: {image: any, answer: string | string[]}) => Promise<any>, answerQuestion: (answer: string | string[]) => Promise<any>, announceWinner: (winner: User, answer: string | string[]) => Promise<any>, declareEnd: (stats) => Promise<any>) {
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
		this.questionInterim = true;
		await sleep(config.quizzes.answerQuestionIntervalMs);
		return;
	}
	
	private async processAttempt(): Promise<0> {
		this.processingAttempt = true;

		while(true) {
			if(this.lastQuestion?.winner) {
				// this.announceWinner(this.lastQuestion?.winner, this.lastQuestion.answer);
				// delete this.lastQuestion;
					this.clearQuestionTimeout();
					await this.announceWinner(this.lastQuestion.winningMessage.author, this.lastQuestion.answer);
					delete this.lastQuestion;
					this.attemptQueue = [];
					break;
			} else if(this.attemptQueue.length < 1)
				break;
			else if(this.ending)
				break;
			else if(this.questionInterim)
				break;
			else {
				const message = this.attemptQueue.shift();
				const validation = await this.validateAttempt(message);
				if(validation === true) {
					// TODO: augment stats
					await this.announceWinner(message.author, this.lastQuestion.answer);
					this.attemptQueue = [];
					delete this.lastQuestion;
					await this.awaitInterim();
					this.questionInterim = false;
					await this.nextQuestion();
				} if(validation === -1) {
				} else 
					await message.react('❌');
				
			}
			await sleep(25);
		}

		this.processingAttempt = false;
		return 0;
	};

	private async validateAttempt(message: Message): Promise<boolean | -1> {

		const attempt: string = sanitizeInput(message.content);
		// TODO: perform substitutions foor chars where desired
		if(message.content.startsWith('$')) {
			// validate against users starting the quiz or part of the collab
			if(message.content === '$cancel') {
				await this.end('cancel received');
				return -1;
				// allow skip too
			} else
				return false;
		}
		this.uninteractedQuestions = 0;
		let evaluation = false;
		if(this.lastQuestion?.answer) {
			if(Array.isArray(this.lastQuestion.answer)) {
				if(this.lastQuestion.answer.some(x => x.toLowerCase() === attempt?.toLowerCase())) 
				   evaluation = true;
			} else if(attempt?.toLowerCase() === this.lastQuestion?.answer?.toLowerCase()) 
				evaluation = true;
			
			if(evaluation === true) {
				this.questionInterim = true;
				this.clearQuestionTimeout();
				this.lastQuestion.winner = message.author;
				this.lastQuestion.winningMessage = message;
				this.attemptQueue = [];
				return true;
			}
		}
		return false;
	}

	async receiveAttempt(message: Message) {
		if(this.ending)
			return;
		if(this.questionInterim === true)
			return;

		this.attemptQueue.push(message);
		this.clearInteractionTimeout();

		if(this.processingAttempt)
			return;
		else {
			this.processingAttempt = true
			this.processAttempt();
		}
	}

	private async nextQuestion() {
		if(!this.active)
			throw new Error("QUIZ_NOT_ACTIVE");
		if(this.ending)
			return;
		if(this.questionInterim === true)
			return;

		this.uninteractedQuestions++;

		if(this.uninteractedQuestions > config.quizzes.maxUninteractedQuestions) 
			return await this.end('max uninteracted questions');
		

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
			while(!result || typeof result === 'string') 
				result = await generateSecondary(this.settings);
			
				
		};
		case 'affixes': {
			// TODO: accept alternate forms of affixes
			while(!result || typeof result === 'string') 
				result = await generateAffix(this.settings);
			
		};
		case 'extensions': {
			// TODO: accept alternate forms of affixes
			while(!result || typeof result === 'string') 
				result = await generateExtensions(this.settings);
			
		};
		case 'cases': {
			// TODO: accept alternate forms of affixes
			while(!result || typeof result === 'string') 
				result = await generateCaseChar(this.settings);
			
		};
		case 'ill_val': {
			// TODO: accept alternate forms of affixes
			while(!result || typeof result === 'string') 
				result = await generateIllVal(this.settings);
		};
		}

		// for shitty ts
		if(typeof result === 'string' || !result)
			throw new Error();

		this.lastQuestion = {
			winningMessage: null,
			winner: null,
			answer: result.answer,
		};
		console.log('last question:', this.lastQuestion);

		if(this.ending)
			return;

		await this.sendQuestion(result);

		if(this.ending)
			return;

		this.processingAttempt = false;
		this.questionInterim = false;
		this.setQuestionTimer();

		// if the last interaction timer's been cleared, set a new one
		if(!this.interactionTimer)
			this.setInteractionTimer();
	}

	async end(reason: string) {
		console.log('ending, reason:', {
			reason,
			trace: '', 
		});
		if(this.ending) // don't run this function twice
			return;
		this.ending = true;
		// remove this quiz from quizzes
		this.clearQuestionTimeout();
		this.clearInteractionTimeout();
		await this.declareEnd(this.stats);
		this.destroy();
	}

	private destroy() {
		this.engagements.forEach(destroyEngagement);
		if(this.collaborative) {
			delete quizzes[this.interaction.channelId].publicQuiz;
			quizzes[this.interaction.channelId].publicQuiz = null;
		} else
			quizzes[this.interaction.channelId].privateQuizzes.delete(this.interaction.commandId);
		console.log('destroy complete. quizzes:', quizzes);
	}

	addEngagement(engagement: Engagement) {
		this.engagements.push(engagement);
		console.log('adding engagement. engagements:', this.engagements);
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
	let quiz;
	// check user engagement, end quiz
	if(quizzes.hasOwnProperty(channelId)) {} else {
		quizzes[channelId] = {
			publicQuiz: null,
			privateQuizzes: new Map(),
		};
	}
	// check user engagement
	// end prev quiz if applicable
	if(engagedUsers[userId])
		return "ALREADY_ENGAGED";
	if(options.collaborative === true) {
		if(quizzes[channelId].publicQuiz !== null && quizzes[channelId].publicQuiz !== undefined)
			return "QUIZ_IN_CHANNEL_EXISTS";
		else {
			const quiz = new Quiz(interaction, options);
			quizzes[channelId].publicQuiz = quiz;
			return quiz;
		}
	} else {
		const quiz = new Quiz(interaction, options);
		console.log('adding quiz. quizzes:', quizzes);
		quizzes[channelId].privateQuizzes.set(interaction.commandId, quiz);
		console.log('adding quiz. quizzes:', quizzes);
		const engagement = new Engagement(interaction, 'quiz'); 
		engagedUsers[userId] = engagement;
		quiz.addEngagement(engagement);
		return quiz;
	}
}

export function destroyEngagement(engagement: Engagement) {
	console.log('deleting engagement:', engagement);
	delete engagedUsers[engagement.userId];
	console.log('engagements:', engagedUsers);
}
