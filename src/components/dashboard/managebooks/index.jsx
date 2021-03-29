import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Divider,
    Container,
    FormControlLabel,
    Switch,
    Toolbar,
    Typography
} from '@material-ui/core'
import AddBook from './AddBook'
import AddBookNoAPI from './AddBookNoAPI'
import AddBookCSV from './AddBookCSV'
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChange = (e) => {
        setOptions({
            ...options,
            [e.target.name]: e.target.checked
        })
    }

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
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
                <Box sx={{ my: 7 }}>
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