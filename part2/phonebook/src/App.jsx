import { useState, useEffect } from 'react'
import contactService from './services/contacts'

import ContactList from './components/Contacts'
import AddContactForm from './components/Forms'
import { SearchInput } from './components/Inputs'

const App = () => {
  const [persons, setPersons] = useState([])

  useEffect(() => {
    contactService
      .getAll()
      .then(contacts => setPersons(contacts))
  }, [])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [searchString, setSearchString] = useState('')
  const [notification, setNotification] = useState(null)

  const contactsToShow = showAll 
    ? persons 
    : persons.filter(person => (new RegExp(`${searchString.trim()}`, 'iu')).test(person.name))

  const handleAddContact = event => {
    event.preventDefault()

    const name = newName.trim()
    const number = newNumber.trim()
    if (name === '') return

    const existingContact = persons.find(p => p.name === name)
    if (!existingContact) addNewContact(name, number)
    else if (existingContact.number !== newNumber) {
      updateContact(existingContact, newNumber)
    } else if (existingContact.number === newNumber) {
      alert(`${newName} is already in the list`)
      resetInputs()
    }
  }

  const addNewContact = (name, number) => {
    contactService
      .create({ name, number })
      .then(response => {
        setPersons(persons.concat(response))
        resetInputs()
        showNotification('Added', {name})
      })
      .catch(error => {
        console.log(error)
      })
  }

  const deleteContact = id => {
    const name = persons.find(p => p.id === id)?.name
    if (!window.confirm(`Delete ${name}?`) || !name) return
    
    contactService
      .deleteEntry(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  const updateContact = (contact, newNumber) => {
    const stringPrompt = 'is already added to the phonebook, replace the old number with a new one?'
    if (!window.confirm(`${contact.name} ${stringPrompt}`)) return

    const newData = {...contact, number: newNumber}
    contactService
      .update(contact.id, newData)
      .then(() => {
        setPersons(persons.map(p => p.id === contact.id ? newData : p))
        resetInputs()
        showNotification('Updated', {name: contact.name})
      })
  }

  const showNotification = (type, content={}) => {
    console.log(type, content)
    const message = `${type} ${content.name}`
    setNotification(message)
    setTimeout(() => setNotification(null), 4000)
  }

  const resetInputs = () => {
    setNewName('')
    setNewNumber('')
  }

  return (
    <>
      <Header text='Phonebook' />
      <Notification message={notification}/>
      <SearchInput
        setSearchString={setSearchString}     
        setShowAll={setShowAll}     
      />

      <Header text='Add a new contact' />
      <AddContactForm  
        newContact={handleAddContact} 
        setNewName={setNewName} 
        setNewNumber={setNewNumber} 
        newName={newName}
        newNumber={newNumber}
      />

      <Header text='Numbers' />
      <ContactList 
        contacts={contactsToShow} 
        deleteContact={deleteContact}
      />
    </>
  )
}

const Header = ({text}) => {
  return <h1>{text}</h1>
}

const Notification = ({message}) => {
  if (!message) return

  return (
    <div className='notification'>
      {message}
    </div>
  )
}

export default App
