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

config.app.nom               = 'Le Polygone';
config.app.premierLieuPublic = true;
config.app.nbLieuxMin        = 4;                  // also the number of places on start
config.app.nbLieuxMax        = 0;                  // 0: infinte
config.app.nomLieux          = 'Coin';
config.app.nomLieuPublic     = 'Centre';           // used only if premierLieuxPublic = true

config.web.port = 3000;

config.client.ip = 'http://localhost';
config.client.port = 3000;

module.exports = config;