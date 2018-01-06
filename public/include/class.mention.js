class Mention
{
	constructor()
	{
		this.active = false;
		this.lettres = '';
		this.liste = [];
		this.selection = 0;
	}

	/**
		* Assign an input field to the mention object.
		* @param {JQuery} jQueryInput - the html form input from which you want to mention users.
		*/
	bind(jQueryInput)
	{
		this.inputField = jQueryInput;
	}

	/**
		* Check if there is a @ in the jQuery element and act accordingly.
		*/
	scan()
	{
		var substring = this.inputField.val().substring(0, this.inputField.caret())
		var mot = substring.split(' ').pop();
		var index = mot.indexOf('@');
		if (index == 0) {      // si il y a un '@' en prmière lettre du dernier mot
			this.index = substring.lastIndexOf('@');
			this.lettres = mot.substr(index + 1);
			this.liste = App.usersStartingWith(this.lettres);
			if (this.liste.length > 0)
			{
				this.activate();
			}
			else
				this.desactivate();
		} else {
			this.desactivate();
		}
	}
	
	activate()
	{
		this.active = true;
		writeListeUsers('mentionner', this.liste, true);
	}

	desactivate()
	{
		this.active = false;
		this.selection = 0;
		hideListe('mentionner');
	}

	selectPrev()
	{
		this.changeSelection(-1);
	}

	selectNext()
	{
		this.changeSelection(1);
	}

	/**
		* Select the next or previous user of te mention list.
		* @param {number} sens - The direction in which you want to change the selection (1 : next, -1 : prev).
		*/
	changeSelection(sens)
	{
		var items = $('#listeUsers_mentionner').find('li');
		items.filter('.active').removeClass('active');
		this.selection = mod((this.selection + sens), this.liste.length);
		items.eq(this.selection).addClass('active');
	}

	validate()
	{
		var cleanInput = removeSubstr(this.inputField.val(), this.index + 1, this.lettres.length);
		var val = insert(cleanInput, this.index + 1, this.liste[this.selection].surnom + ' ');
		this.inputField.val(val);
		this.desactivate();
	}
}