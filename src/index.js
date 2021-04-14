const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// >> Config
    //Body-Parser
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false}))
    // Controllers
    require('./app/controllers/index')(app) // todos os controllers são configurados via index dos controllers.




// >> Start
app.listen(3000)