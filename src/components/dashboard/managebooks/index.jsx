import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Divider
} from '@material-ui/core'
import AddBookMain from './AddBookMain'
import RequestedBooks from './RequestedBooks'
import SearchBook from './SearchBook'

const ManageBooks = ({ user, locale }) => {
    const navigate = useNavigate()
    const [locations, setLocations] = useState({
        pam: {
            options: []
        },
        rhill: {
            options: []
        }
    })
    const [categories, setCategories] = useState([])

    // On page load, get list of locations, categories and requested books
    useEffect(() => {
        axios.get(`${url}/settings/locations`, { withCredentials: true })
            .then(locations => {
                setLocations(locations.data)
            })
        axios.get(`${url}/settings/categories`, { withCredentials: true })
            .then(locations => {
                setCategories(locations.data)
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // If user is not a librarian redirect to main dashboard page
    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <Box sx={{ my: 5 }}>
                <AddBookMain locations={locations} categories={categories} locale={locale} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <RequestedBooks />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <SearchBook locations={locations} categories={categories} locale={locale} />
            </Box>
        </>
    )
}

ManageBooks.propTypes = {
    user: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired
}

export default ManageBooks