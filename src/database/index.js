const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/nodeRest', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}) // nome do banco e conexão com mongo 

mongoose.Promise = global.Promise // padrão para todo projeto com mongo

module.exports = mongoose