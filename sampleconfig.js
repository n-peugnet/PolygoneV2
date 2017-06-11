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
config.app.nbLieux = 4;
config.web.port = 3000;
config.client.ip = 'http://localhost';
config.client.port = 3000;

module.exports = config;