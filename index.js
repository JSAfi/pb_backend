const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const morgan = require('morgan')

const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(requestLogger)

morgan.token('body', function getBody(req){
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))


const errorHandler = (error, request, response, next) => {
    console.log('nyt errorHandlerissa!')
    console.error(error.message)
    
    if(error.name === 'CastError') {
        console.log('joo, castError tuli')
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

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

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if(person) {
            response.json(person)
        } else {
            console.log('404 tulee!')
            response.status(404).end()
        }
    })
    .catch(error =>
        next(error)
    )
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})