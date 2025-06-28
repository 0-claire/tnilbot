// Generate random chars

export function generateChar(ext: boolean = false): string {
	const chars = ext !== true ? 'bcčçdḑfghjklļmnňprřsštţvxzžż' : 'bcčçdḑfghjklļmnňprřsštţvwxyzžż'; // wy only exist as extensions
	const length = chars.length;
	const rand = Math.random();
	const randomIndex = Math.floor(rand * length);
	const randomChar = chars[randomIndex];
	return randomChar;
}
