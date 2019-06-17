const express = require('express')
const process = require('process')
var body_parser = require('body-parser')
const bcrypt = require('bcrypt')
const port = process.env.PORT || 3000
const { LoginDB } = require('./LoginSchema')

let app = express()
const saltRounds = 100;
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
})

app.use(body_parser.json())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
    next()
})

app.get('/login', async (req, res) => {
    let pass = req.body.pass
    let user = req.body.user
    if (pass == undefined || user == undefined || pass == '' || user == '') {
        res.status(400).send({
            message: isEmpty(pass, user)
        })
    } else {
        try {
            let db = await LoginDB.findOne({
                user: req.body.user
            })
            if (db == undefined || db == null) {
                res.status(400).send({
                    message: "Invalid user"
                })
            } else {
                let result = bcrypt.compareSync(pass, db.pass)

                if (result) {
                    res.status(201).send({
                        message: "Valid user"
                    })
                } else {
                    res.status(400).send({
                        message: "Invalid user"
                    })
                }
            }
        } catch (error) {
            res.status(400).send(error)
        }
    }
})

app.post('/signup', async (req, res) => {
    let pass = req.body.pass
    let user = req.body.user
    if (pass == undefined || user == undefined || pass == '' || user == '') {
        res.status(400).send({
            message: isEmpty(pass, user)
        })
    } else {
        try {
            let hash = bcrypt.hashSync(pass, saltRounds)
            let dbPost = LoginDB({
                user: user,
                pass: hash
            })
            try {
                await dbPost.save()
                res.status(201).send({
                    message: "User saved successfully"
                })
            } catch (err) {
                res.status(500).send({
                    message: "User already exists"
                })
            }


        } catch (error) {
            res.status(400).send(error)
        }
    }
})

function isEmpty(pass, user) {
    if (pass == undefined || user == undefined || pass == '' || user == '') {
        var message = ''
        if (pass == '' && user == '') {
            message = "Password and Username can't be empty"
        } else if (pass == '') {
            message = "Password can't be empty"
        } else {
            message = "Username can't be empty"
        }
        return message
    }
}

app.listen(port, () => {
    console.log('Started server')
})