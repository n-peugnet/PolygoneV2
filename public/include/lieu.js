/** Class representing a place */
class Lieu extends Array
{
	/**
	 * Creates a place.
	 * @param {string} nom - The new place's name. (optionnal)
	 * @param {int} taille - The new place's size. (default 6)
	 * @param {string} protection - The new place's security  plan, possibilities are 'none' or 'password'. (default "none")
	 */
	constructor(nom = "", taille = 6, protection = "none")
	{
		super();
		this.nom = nom;
		this.taille = taille;
		this.protection = protection;
	}

	writeCoin(num)
	{
		var data = {num, nom: this.nom, taille: this.taille, presence: App.cu.presence, loggedIn: App.cu.loggedIn};
		var html = new EJS({url: dirViews + 'coin.ejs'}).render(data);
		$('#coins').append(html);
	}
}