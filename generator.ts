// Generate random chars

export function generateChar(): string {
	const chars = 'bcčçdḑfghjklļmnňprřsštţvxžż';
	const length = chars.length;
	const rand = Math.random();
	const randomIndex = Math.floor(rand * length);
	const randomChar = chars[randomIndex];
	return randomChar;
}
