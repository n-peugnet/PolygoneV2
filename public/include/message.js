var Message = {
	init: function (id, texte, type) 
	{
		this.id = id;
		this.texte = texte;
		this.type = type;
		return this;
	},
	
	write: function(surnom, couleur, animation)
	{
		var data = {surnom, message: activateLinks(this.texte), couleur, id: this.id, type: this.type};
		var html = new EJS({url: dirViews + 'message.ejs'}).render(data);
		if (animation)
			$(html).prependTo('#dires_'+surnom).css('margin-top', '-'+$('#'+surnom+this.id).height()+'px').animate({ marginTop: '0px'});
		else
			$(html).prependTo('#dires_'+surnom);
	},
	
	erase: function(surnom)
	{
		var idHtml = '#'+surnom+this.id;
		$(idHtml).animate({ opacity: 0}, 500).animate({ height: '0px'}, function() { $(this).remove(); });
	}
}

var Citation = Object.create(Message);

Citation.initCitation = function(id, persCite, texte) {
	this.init(id, texte, "citation");
	this.persCite = persCite;
	return this;
}

Citation.write = function() {
	var data = {persCite: this.persCite, citation: activateLinks(this.texte), id: this.id};
	var html = new EJS({url: dirViews + 'memory.ejs'}).render(data);
	$('#memoire').prepend(html);
}

Citation.send = function() {
	socket.emit('message', {texte: this.persCite + ' : ' + this.texte, type: this.type});
}

var Ecrit = Object.create(Message);

Ecrit.initEcrit = function() {
	this.init("ecrit",  '. . .', "writing");
	return this;
}

Ecrit.writeEcrit = function(surnom) {
	this.write(surnom, '#cccccc', true);
}

Ecrit.erase = function(surnom) {
	var idHtml = '#'+surnom+this.id;
	$(idHtml).animate({ opacity: 0, marginTop: '-' + $(idHtml).height() +'px'}, function() { $(this).remove(); });
}