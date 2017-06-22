/** Class representing a message */
class Message {
	constructor(id, texte, type)
	{
		this.id = id;
		this.texte = texte;
		this.type = type;
	}
	
	write(surnom, couleur, animation)
	{
		var data = {surnom, message: analyseMessage(this.texte), couleur, id: this.id, type: this.type};
		var html = new EJS({url: dirViews + 'message.ejs'}).render(data);
		if (animation)
			$(html).prependTo('#dires_'+surnom).css('margin-top', '-'+$('#'+surnom+this.id).height()+'px').animate({ marginTop: '0px'});
		else
			$(html).prependTo('#dires_'+surnom);
		return this;
	}
	
	erase(surnom)
	{
		var idHtml = '#'+surnom+this.id;
		$(idHtml).animate({ opacity: 0}, 500).animate({ height: '0px'}, function() { $(this).remove(); });
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
		var html = new EJS({url: dirViews + 'memory.ejs'}).render(data);
		$('#memoire').prepend(html);
		return this;
	}

	send()
	{
		socket.emit('message', {texte: this.persCite + ' : ' + this.texte, type: this.type});
		return this;
	}
}

class Ecrit extends Message
{
	constructor()
	{
		super("ecrit",  '. . .', "writing");
	}

	write(surnom)
	{
		super.write(surnom, '#cccccc', true);
		return this;
	}

	erase(surnom)
	{
		var idHtml = '#'+surnom+this.id;
		$(idHtml).animate({ opacity: 0, marginTop: '-' + $(idHtml).height() +'px'}, function() { $(this).remove(); });
		return this;
	}
}