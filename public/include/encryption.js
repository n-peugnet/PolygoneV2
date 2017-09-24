/** Class representing a type of encryption */
class Encryption {

	static create(type, key = '') {
		var encryption = new Encryption();;
		switch (type) {
			case "password":
				if ( key.length > 0)
					encryption = new Symetric(type, key);
				break;
		}
		return encryption
	}

	constructor(type = "none")
	{
		this.type = type;
	}

	encrypt(texte)
	{
		return texte;
	}

	decrypt(texte)
	{
		return texte;
	}
}

class Symetric extends Encryption
{
	constructor(type, key)
	{
		super(type);
		this.key = key;
	}

	encrypt(texte)
	{
		return cryptSym(texte, this.key);
	}

	decrypt(texte)
	{
		return cryptSym(texte, this.key);
	}
}