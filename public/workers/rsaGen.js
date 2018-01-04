var window = {};
importScripts("../include/jsbn.js", "../include/jsbn2.js", "../include/prng4.js", "../include/rng.js", "../include/rsa.js", "../include/rsa2.js");

self.onmessage = function(m) {

	//Traitement lourd nécessitant l'appel à thread
	var before = new Date();
	var rsaKey = new RSAKey();
	console.log("Generating rsa key");
	rsaKey.generate(2048, '10001');
	var after = new Date();
	console.log("Key Generation Time: " +(after - before) + "ms");
	var data = {
		n : rsaKey.n.toString(16),
		e : rsaKey.e.toString(16),
		d : rsaKey.d.toString(16)
	};

	postMessage(data); //Envoie la réponse à notre thread principal
	if(m.data[1] == 'stop') {
		/**
		 * Termine le worker, il ne traitera plus de nouveaux messages.
		 * Si le worker a pour but d'être utilisé plusieurs fois, il vaut mieux le garder ouvert.
		 */
		close();
	}
}