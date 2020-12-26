import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useNavigate } from 'react-router-dom'
import LibraryHours from './LibraryHours'
import BookSettings from './BookSettings'
import UserSettings from './UserSettings'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'

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
                <>
                    <Box sx={{ my: 5 }}>
                        <Grid container justifyContent="center">
                            <Grid item xs={12} sm={5} md={4}>
                                <LibraryHours hours={hours} />
                            </Grid>
                            <Divider orientation="vertical" flexItem={true} />
                            <Grid item xs={12} sm={5} md={4}>
                                <Grid container direction="column" justifyContent="center">
                                    <Grid item xs={12}>
                                        <BookSettings bookSettings={books} />
                                    </Grid>
                                    <Divider />
                                    <Grid item xs={12}>
                                        <UserSettings userSettings={users} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </>
            }
        </>
    )
}

export default Settings