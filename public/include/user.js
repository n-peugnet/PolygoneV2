/** Class representing a User */
class User {
	
	/**
	 * Create a User.
	 * @param {string} surnom - The new User's nickname.
	 * @param {number} ecoute - The place's number where the new User is listening.
	 * @param {string} couleur - The new User's color.
	 * @param {boolean} current - True is the new User is the current User
	 */
	constructor(surnom, ecoute, couleur, current, encrypt = 'vernam')
	{
		this.presence = 0;
		this.messages = [];
		this.surnom = surnom;
		this.couleur = couleur;
		this.crypto = new Encryption(encrypt);
		this.current = current;
		this.ecoute = ecoute;
		this.ecrit = false;
		this.actif = true;
		return this;
	}
	
	isWriting()
	{
		if (!this.ecrit)
		{
			this.ecrit = true;
			this.writeWriting();
		}
	}
	
	writeWriting()
	{
		new Ecrit().write(this.surnom);
	}
	
	notWriting()
	{
		this.ecrit = false;
		new Ecrit().erase(this.surnom);
	}
	
	addMessage(texte, type)
	{
		this.notWriting();
		var id = idGen(this.messages);
		var newMessage = new Message(id, texte, type).write(this.surnom, this.couleur, true, this.crypto);
		this.messages.push(newMessage);
		setTimeout($.proxy(function(){
			this.delMessage(id);
		}, this), (texte.length + 22) * 1000);
	}
	
	delMessage(id)
	{
		var index = this.messages.map(function(m) { return m.id; }).indexOf(id); //trouve l'index du message dont l'id est égal à id
		this.messages.splice(index, 1)[0].erase(this.surnom, id);
	}

	moveTo(lieu)
	{
		this.presence = lieu;
		this.ecoute = lieu;
		this.writeIn(lieu)
	}

	/**
	 * Makes a user listen to another place.
	 * @param {number} lieu - new listening place.
	 * @returns {number} - previous listening place.
	 */
	listenTo(lieu)
	{
		var ecoute = this.ecoute
		this.ecoute = lieu;
		return ecoute;
	}
	
	genColonne()
	{
		return new EJS({url: dirViews + 'colonne.ejs'}).render(this);
	}

	writeMenu()
	{
		var html = new EJS({url: dirViews + 'userMenu.ejs'}).render({surnom: this.surnom, cryptoKey: this.crypto.key});
		$('#user_' + this.surnom).children(':first').append(html);
		setEvents();
	}
	
	//inscrit un utilisateur dans la page
	writeIn(lieu)
	{
		if (lieu == App.cu.ecoute || lieu == 0){
			var html = this.genColonne();
			if (this.current) {
				$('#discutLieu'+ lieu).prepend(html);
				$('#discutLieu'+ lieu).contents().filter(function() { return this.nodeType === 3; }).remove(); //permet de supprimer les espaces HTML
				$('#message').focus();
				App.mention.bind($('#message'));
			} else {
				$('#discutLieu'+ lieu).append(html);
			}
			if (!this.current && this.actif && App.cu.loggedIn && App.cu.presence == lieu)
				this.writeMenu();
			this.writeMessages();
		}
		var ligne = $('#lieu' + lieu + ' li.empty:first');
		ligne.removeClass('empty').attr('id', 'presenceUser_'+ this.surnom);
		ligne.children('span.puce').css('backgroundColor', this.couleur);
		ligne.children('span.surnom').text(this.surnom);
		return this;
	} 
	
	disableIn(lieu)
	{
		this.actif = false;
		this.ecrit = false;
		this.couleur = 'rgba(49, 49, 49, 0.46)';
		if (lieu == App.cu.ecoute || lieu == 0){
			this.updateCol(lieu);
		} else {
			$('#user_'+ this.surnom).addClass('inactif');
		}
	}
	
	reactivateIn(lieu, couleur, current)
	{
		this.actif = true;
		this.couleur = couleur;
		this.current = current;
		if (lieu == App.cu.ecoute || lieu == 0){
			this.updateCol(lieu);
		} else {
			$('#user_' + this.surnom).removeClass('inactif');
		}
	}
	
	updateCol(lieu)
	{
		var html = this.genColonne();
		$('#user_' + this.surnom).replaceWith(html);
		this.writeMessages();
		if (!this.current && this.actif && App.cu.loggedIn && App.cu.presence == lieu)
		{
			this.writeMenu();
		}
		return this;
	}
	
	eraseIn(lieu)
	{
		if (lieu == App.cu.ecoute || lieu == 0){
			$('#user_' + this.surnom).fadeOut( function() { $(this).remove(); });
		}
		var ligne = $('#presenceUser_' + this.surnom);
		ligne.removeClass('inactif').addClass('empty').attr('id', '');
		ligne.children('span.puce').css('backgroundColor', '#dddddd');
		ligne.children('span.surnom').text('');
	}
	
	writeMessages()
	{
		$('#dires_' + this.surnom).empty();
		var self = this;
		this.messages.forEach(function(m){
			m.write(self.surnom, self.couleur, false, self.crypto);
		});
		if (this.ecrit){
			this.writeWriting();
		}
	}
	
	getMessage(id)
	{
		return this.messages.find(function(m){ return m.id == id; });
	}
}