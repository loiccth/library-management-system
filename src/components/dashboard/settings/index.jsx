import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useNavigate } from 'react-router-dom'
import LibraryHours from './LibraryHours'
import BookSettings from './BookSettings'
import UserSettings from './UserSettings'
import Container from '@material-ui/core/Container'

const Settings = ({ user }) => {
    const navigate = useNavigate()
    const [hours, setHours] = useState(null)
    const [books, setBooks] = useState(null)
    const [users, setUsers] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getSettings = async () => {
            const workingHrs = await axios.get(`${url}/settings/hours`, { withCredentials: true })
            setHours({
                opening: workingHrs.data.opening.options,
                closing: workingHrs.data.closing.options
            })
            const bookSettings = await axios.get(`${url}/settings/books`, { withCredentials: true })
            setBooks(bookSettings.data)
            const userSettings = await axios.get(`${url}/settings/users`, { withCredentials: true })
            setUsers(userSettings.data)
            setLoading(false)
        }
        getSettings()

    }, [])

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            {loading ? null :
                <Container>
                    <LibraryHours hours={hours} />
                    <BookSettings bookSettings={books} />
                    <UserSettings userSettings={users} />
                </Container>
            }
        </>
    )
}

export default Settings