/** Class representing a type of encryption */
class Encryption {

	constructor(type, key = '')
	{
		this.type = type;
		this.key  = key;
	}

	encrypt(texte)
	{
		switch (this.type) {
			case "vernam": return cryptVernam(texte, this.key);
			case "none":
			default: return texte;
		}
	}

	decrypt(texte)
	{
		switch (this.type) {
			case "vernam": return cryptVernam(texte, this.key);
			case "none":
			default: return texte;
		}
	}
}