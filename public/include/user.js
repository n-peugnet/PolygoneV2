/** Class representing a User */
class User {
	
	/**
	 * Create a User.
	 * @param {string} surnom - The new User's nickname.
	 * @param {number} ecoute - The place's number where the new User is listening.
	 * @param {string} couleur - The new User's color.
	 * @param {boolean} current - True is the new User is the current User
	 */
	constructor(surnom, ecoute, couleur, current)
	{
		this.messages = [];
		this.surnom = surnom;
		this.couleur = couleur;
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
		var newMessage = new Message(id, texte, type).write(this.surnom, this.couleur, true);
		this.messages.push(newMessage);
		setTimeout($.proxy(function(){
			this.delMessage(id);
		}, this), (texte.length + 22) * 1000);
	}
	
	delMessage(id)
	{
		index = this.messages.map(function(m) { return m.id; }).indexOf(id); //trouve l'index du message dont l'id est égal à id
		this.messages.splice(index, 1)[0].erase(this.surnom, id);
	}
	
	genColonne()
	{
		return new EJS({url: dirViews + 'colonne.ejs'}).render(this);
	}
	
	//inscrit un utilisateur dans la page
	writeIn(lieu)
	{
		if (lieu == App.cu.ecoute || lieu == 0){
			var html = this.genColonne();
			if (this.current) {
				$('#lieu'+ lieu).prepend(html);
				$('#lieu'+ lieu).contents().filter(function() { return this.nodeType === 3; }).remove(); //permet de supprimer les espaces HTML
				$('#message').focus();
			} else {
				$('#lieu'+ lieu).append(html);
			}
			this.writeMessages();
		} else {
			var ligne = $('#coin' + lieu + ' li.empty:first');
			ligne.removeClass('empty').attr('id', this.surnom);
			ligne.children('span.puce').css('backgroundColor', this.couleur);
			ligne.children('span.surnom').text(this.surnom);
		}
		return this;
	} 
	
	disableIn(lieu)
	{
		this.actif = false;
		this.ecrit = false;
		this.couleur = '#aaaaaa';
		if (lieu == App.cu.ecoute || lieu == 0){
			this.updateCol();
		} else {
			$('#' + this.surnom).addClass('inactif');
		}
	}
	
	reactivateIn(lieu, couleur, current)
	{
		this.actif = true;
		this.couleur = couleur;
		this.current = current;
		if (lieu == App.cu.ecoute || lieu == 0){
			this.updateCol();
		}else {
			$('#' + this.surnom).removeClass('inactif');
		}
	}
	
	updateCol()
	{
		var html = this.genColonne();
		$('#' + this.surnom).replaceWith(html);
		this.writeMessages();
	}
	
	eraseIn(lieu) 
	{
		if (lieu == App.cu.ecoute || lieu == 0){
			$('#' + this.surnom).remove();
		} else {
			var ligne = $('#' + this.surnom);
			ligne.removeClass('inactif').addClass('empty').attr('id', '');
			ligne.children('span.puce').css('backgroundColor', '#dddddd');
			ligne.children('span.surnom').text('');
		}
	}
	
	writeMessages()
	{
		var self = this;
		this.messages.forEach(function(m){
			m.write(self.surnom, self.couleur, false);
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