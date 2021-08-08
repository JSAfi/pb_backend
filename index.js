require('dotenv').config()
const { json } = require('express')
const express = require('express')

const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('build'))

morgan.token('body', function getBody(req){
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))
app.use(cors())


let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3, 
        name: "Dan Abramov",
        number: "12-43-2345345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    const date = new Date()
    response.end(`
        <div>
        <p>
            This HY open university full stack 2021 course application is up and running!
        </p>
        <p>
            ${date}
        </p>
        </div>
    `)
})

app.get('/info', (request, response) => {
    const number = persons.length
    const date = new Date()
    response.end(`
        <div>
            Phonebook has info for ${number} people
        </div> 
        <div>
            ${date}
        </div>`) 
})
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})
/*
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
*/
app.get('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)
    if (body.name === undefined) {
        return response.status(400).json({error: 'content missing'})
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})
/*
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const nameMatch = persons.find(person => person.name.toUpperCase() === body.name.toUpperCase())
    if(nameMatch) {
        console.log("löytyi", nameMatch)
        return response.status(400).json({
            error: 'name already in phonebook'
        })
    }

    const numberMatch = persons.find(person => person.number === body.number)
    if(numberMatch) {
        console.log("numero löytyi", numberMatch)
        return response.status(400).json({
            error: 'number already in phonebook'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    response.json(person)
})
*/

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})