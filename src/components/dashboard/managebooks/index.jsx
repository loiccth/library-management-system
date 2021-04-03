import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Divider,
    Container,
    FormControlLabel,
    Switch,
    Toolbar,
    Typography,
    Snackbar
} from '@material-ui/core'
import AddBook from './AddBook'
import AddBookNoAPI from './AddBookNoAPI'
import AddBookCSV from './AddBookCSV'
import RequestedBooks from './RequestedBooks'
import SearchBook from './SearchBook'

const ManageBooks = ({ user, locale }) => {
    const navigate = useNavigate()
    const [options, setOptions] = useState({
        csv: false,
        api: true
    })
    const [locations, setLocations] = useState({
        pam: {
            options: []
        },
        rhill: {
            options: []
        }
    })
    const [categories, setCategories] = useState([])
    const [books, setBooks] = useState([])
    const [snackbar, setSnackbar] = useState({ type: null })
    const [openSnack, setOpenSnack] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        axios.get(`${url}/settings/locations`, { withCredentials: true })
            .then(locations => {
                setLocations(locations.data)
            })

        axios.get(`${url}/settings/categories`, { withCredentials: true })
            .then(locations => {
                setCategories(locations.data)
            })
        axios.get(`${url}/books/request`, { withCredentials: true })
            .then(books => {
                setBooks(books.data)
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleClick = () => {
        setOpenSnack(true)
    }

    const handleClose = () => {
        setOpenSnack(false)
    }

    const handleChange = (e) => {
        setOptions({
            ...options,
            [e.target.name]: e.target.checked
        })
    }

    const handleRemove = (id) => {
        axios.delete(`${url}/books/request/${id}`, { withCredentials: true })
            .then(result => {
                setBooks(books.filter(book => book._id !== id))
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message)
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: t(err.response.data.message)
                })
            })
            .finally(() => {
                handleClick()
            })
    }

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Box sx={{ my: 5 }}>
                <Container>
                    <Toolbar>
                        <Typography variant="h6">{t('addBooks')}</Typography>
                    </Toolbar>
                    <FormControlLabel
                        control={<Switch name="csv" checked={options.csv} onChange={handleChange} />}
                        label={t('manualInput')}
                    />
                    {options.csv &&
                        <FormControlLabel
                            control={<Switch name="api" checked={options.api} onChange={handleChange} />}
                            label={t('autoFill')}
                        />
                    }
                </Container>
                {options.csv ?
                    options.api ?
                        <AddBook locations={locations} categories={categories} />
                        :
                        <AddBookNoAPI locations={locations} categories={categories} locale={locale} />
                    :
                    <AddBookCSV />
                }
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <RequestedBooks books={books} handleRemove={handleRemove} />
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