var User = {
	
	init: function (surnom, couleur, current)
	{
		this.messages = [];
		this.surnom = surnom;
		this.couleur = couleur;
		this.current = current;
		this.ecoute = 0;
		this.ecrit = false;
		this.actif = true;
	
	},
	
	isWriting: function()
	{
		if (!this.ecrit)
		{
			this.ecrit = true;
			this.writeWriting();
		}
	},
	
	writeWriting: function()
	{
		writeMessage(this.surnom, '. . .', '#cccccc', 'ecrit');
	},
	
	notWriting: function()
	{
		this.ecrit = false;
		eraseMessage(this.surnom, 'ecrit');
	},
	
	addMessage: function (texte, type)
	{
		this.notWriting();
		var id = this.messageIdGen();
		newMessage = Object.create(Message);
		newMessage.init(id, texte, type);
		this.messages.push(newMessage);
		writeMessage(this.surnom, texte, this.couleur, id, type);
		setTimeout($.proxy(function(){
			this.delMessage(id);
		}, this), (texte.length + 22) * 1000);
	},
	
	delMessage: function (id)
	{
		index = this.messages.map(function(m) { return m.id; }).indexOf(id); //trouve l'index du message dont l'id est égal à id
		this.messages.splice(index, 1);
		eraseMessage(this.surnom, id);
	},
	
	messageIdGen: function()
	{
		var newId = 0;
		this.messages.forEach(function(message)
		{
			if (message.id >= newId)
			{
				newId = message.id +1;
			}
		});
		return newId;
	},
	
	genColonne: function()
	{
		return new EJS({url: dirViews + 'colonne.ejs'}).render(this);
	},
	
	//inscrit un utilisateur dans la page
	writeIn: function(lieu)
	{
		if (lieu == CrntUser.ecoute || lieu == 0){
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
			$('#coin' + lieu + ' .empty:first').removeClass('empty').attr('id', this.surnom).text(this.surnom);
		}
	}, 
	
	disableIn: function(lieu)
	{
		this.actif = false;
		this.ecrit = false;
		this.couleur = '#aaaaaa';
		if (lieu == CrntUser.ecoute || lieu == 0){
			this.updateCol();
		} else {
			$('#' + this.surnom).addClass('inactif');
		}
	},
	
	reactivateIn: function(lieu, couleur)
	{
		this.actif = true;
		this.couleur = couleur;
		if (lieu == CrntUser.ecoute || lieu == 0){
			this.updateCol();
		}else {
			$('#' + this.surnom).removeClass('inactif');
		}
	},
	
	updateCol: function()
	{
		var html = this.genColonne();
		$('#' + this.surnom).replaceWith(html);
		this.writeMessages();
	},
	
	eraseIn: function(lieu) 
	{
		if (lieu == CrntUser.ecoute || lieu == 0){
			$('#' + this.surnom).remove();
		} else {
			$('#' + this.surnom).removeClass('inactif')
								.addClass('empty')
								.attr('id', '')
								.text('_');
		}
	},
	
	writeMessages: function()
	{
		var self = this;
		this.messages.forEach(function(m){
			writeMessage(self.surnom, m.texte, self.couleur, m.id, m.type);
		});
		if (this.ecrit){
			this.writeWriting();
		}
	}
}