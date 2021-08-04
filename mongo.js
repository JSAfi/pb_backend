const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as an argument')
    process.exit(1)
}

const password = process.argv[2]
const enteredName = process.argv[3]
const enteredNumber = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@pbcluster.lygdx.mongodb.net/pb-app?retryWrites=true&w=majority`

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = new mongoose.model('Person', personSchema)

if (enteredName) {  
    const person = new Person({
        name: enteredName,
        number: enteredNumber
    })
    
    person.save().then(response => {
        console.log(`added ${enteredName} number ${enteredNumber} to phonebook`)
        mongoose.connection.close()
    })    
} else {
    Person.find({}).then(result => {
        console.log('phonebook')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}