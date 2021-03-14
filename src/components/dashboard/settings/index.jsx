import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useNavigate } from 'react-router-dom'
import LibraryHours from './LibraryHours'
import BookSettings from './BookSettings'
import UserSettings from './UserSettings'
import Categories from './Categories'
import Locations from './Locations'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'

const Settings = ({ user }) => {
    const navigate = useNavigate()
    const [hours, setHours] = useState(null)
    const [books, setBooks] = useState(null)
    const [users, setUsers] = useState(null)
    const [categories, setCategories] = useState(null)
    const [locations, setLocations] = useState(null)
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
            const categoriesSettings = await axios.get(`${url}/settings/categories`, { withCredentials: true })
            setCategories(categoriesSettings.data)
            const locationSettings = await axios.get(`${url}/settings/locations`, { withCredentials: true })
            setLocations({
                pam: locationSettings.data.pam.options,
                rhill: locationSettings.data.rhill.options
            })
            setLoading(false)
        }
        getSettings()

    }, [])

    const handleUpdateBookSettings = (data) => {
        setBooks(data)
    }

    const handleUpdateUserSettings = (data) => {
        setUsers(data)
    }

    const handleUpdateCategoriesSettings = (data) => {
        setCategories(data)
    }

    const handleUpdateLocationsSettings = (data) => {
        if (data.campus === 'rhill')
            setLocations({
                ...locations.pam,
                rhill: data.location
            })
        else if (data.campus === 'pam')
            setLocations({
                ...locations.rhill,
                pam: data.location
            })
    }

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            {loading ? null :
                <>
                    <Box sx={{ my: 5 }}>
                        <Grid container justifyContent="center">
                            <Grid item xs={12} sm={5} md={5}>
                                <LibraryHours hours={hours} />
                            </Grid>
                            <Grid item xs={12} sm={5} md={5}>
                                <Grid container direction="column" justifyContent="center">
                                    <Grid item xs={12}>
                                        <BookSettings bookSettings={books} handleUpdateBookSettings={handleUpdateBookSettings} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <UserSettings userSettings={users} handleUpdateUserSettings={handleUpdateUserSettings} />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sm={5} md={5}>
                                <Categories categoriesSettings={categories} handleUpdateCategoriesSettings={handleUpdateCategoriesSettings} />
                            </Grid>
                            <Grid item xs={12} sm={5} md={5}>
                                <Locations locationSettings={locations} handleUpdateLocationsSettings={handleUpdateLocationsSettings} />
                            </Grid>
                        </Grid>
                    </Box>
                </>
            }
        </>
    )
}

export default Settings