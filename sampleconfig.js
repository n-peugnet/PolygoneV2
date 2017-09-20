var config = {};

config.mysql = {};
config.session = {};
config.app = {};
config.web = {};
config.client = {};

config.mysql.host = 'localhost';
config.mysql.user = 'root';
config.mysql.password = '';
config.mysql.database = 'polygoneV2';

config.session.secret = 'secret-keystring';

config.app.premierLieuPublic = true,               // pas encore utilisé
config.app.nbLieuxMin        = 4;                  // number of places on start as well
config.app.nbLieuxMax        = 0;                  // 0: infinte

config.web.port = 3000;

config.client.ip = 'http://localhost';
config.client.port = 3000;

module.exports = config;