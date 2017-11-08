/** Class representing a message */
class Message {
	constructor(id, texte, type, encrypted)
	{
		this.id = id;
		this.texte = texte;
		this.type = type;
		this.encrypted = encrypted;
	}
	
	/**
	 * renders a message
	 * @param {string} surnom 
	 * @param {string} couleur 
	 * @param {boolean} animation 
	 * @param {Encryption} encryption 
	 */
	write(surnom, couleur, animation, encryption)
	{
		console.log(this);
		var texte = this.encrypted ? encryption.decrypt(this.texte) : this.texte;
		var data = {surnom, message: analyseMessage(texte), couleur, id: this.id, type: this.type, encrypted: this.encrypted};
		var html = new EJS({url: dirViews + 'message.ejs'}).render(data);
		if (animation)
			$(html).prependTo('#dires_'+surnom).css('margin-top', '-'+$('#message_'+surnom+this.id).height()+'px').animate({ marginTop: '0px'});
		else
			$(html).prependTo('#dires_'+surnom);
		this.setHoverEvent('#message_', surnom);
		return this;
	}
	
	erase(surnom)
	{
		var idHtml = '#message_'+surnom+this.id;
		$(idHtml).animate({ opacity: 0}, 500).animate({ height: '0px'}, function() { $(this).remove(); });
	}

	setHoverEvent(element, surnom) {
		element += surnom+this.id;
		$(element).hover(function () {
			if (App.cu.loggedIn)
				$(this).children('.action').show();
		}, function () {
			$(this).children('.action').hide();
		})
	}
}

class Citation extends Message
{
	constructor(id, persCite, texte)
	{
		super(id, texte, "citation");
		this.persCite = persCite;
	}

	write()
	{
		var data = {persCite: this.persCite, citation: analyseMessage(this.texte), id: this.id};
		var html = new EJS({url: dirViews + 'souvenir.ejs'}).render(data);
		$('#memoire').prepend(html);
		this.setHoverEvent('#souvenir_', '');
		return this;
	}

	send(encryption)
	{
		var texte = encryption.encrypt(this.persCite + ' : ' + this.texte);
		socket.emit('message', {texte, type: this.type, encrypted: encryption.type != 'none'});
		return this;
	}
}

class Ecrit extends Message
{
	constructor()
	{
		super("ecrit", '. . .', "writing");
	}

	write(surnom)
	{
		super.write(surnom, '#cccccc', true, new Encryption("none"));
		return this;
	}

	erase(surnom)
	{
		var idHtml = '#message_'+surnom+this.id;
		$(idHtml).animate({ opacity: 0, marginTop: '-' + $(idHtml).height() +'px'}, function() { $(this).remove(); });
		return this;
	}
}