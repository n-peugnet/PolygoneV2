var Message = {
	init: function (id, texte, type) {
		this.id = id;
		this.texte = texte;
		this.type = type;
	}
}

var Citation = Object.create(Message);

Citation.initCitation = function(id, persCite, texte) {
	this.init(id, texte, "citation");
	this.persCite = persCite;
}

Citation.write = function() {
	var data = {persCite: this.persCite, citation: activateLinks(this.texte), id: this.id};
	var html = new EJS({url: dirViews + 'memory.ejs'}).render(data);
	$('#memoire').prepend(html);
}

Citation.send = function() {
	socket.emit('message', {texte: this.persCite + ' : ' + this.texte, type: this.type});
}