//DEPENDENCIES
const express = require("express")
const cors = require("cors")

// CONFIGURATION
require("dotenv").config()
const app = express()

// MIDDLEWARE
app.use(cors())
app.use(express.json())


// LISTEN
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`🔊Listening to music on port ${PORT}🔊`)
})