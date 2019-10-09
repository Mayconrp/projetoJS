const config = require('../knexfile.js')
// configuracoes de conexao do banco de dados
const knex = require('knex')(config)

module.exports = knex