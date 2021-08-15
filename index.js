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
  console.error(error)

  if(error.name === 'CastError') {
    console.log('castError!')
    return response.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError') {
    console.log('validointivirhe')
    return response.status(400).send({ error: error.message })
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
//  const number = persons.length
  Person.find({}).then(persons => {
    const len = persons.length
    const date = new Date()
    response.end(`
      <div>
        Phonebook has info for ${len} people
      </div>
      <div>
        ${date}
      </div>
      `)
  })
/*
  const number = 10
  const date = new Date()
  response.end(`
        <div>
            Phonebook has info for ${number} people
        </div> 
        <div>
            ${date}
        </div>`) 
*/
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

app.delete('/api/persons/:id', (request, response, error) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }
    
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => 
      next(error)
    )
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }
  console.log(body)

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
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