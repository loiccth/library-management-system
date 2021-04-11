import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
    Container,
    FormControlLabel,
    Switch,
    Toolbar,
    Typography
} from '@material-ui/core'
import AddBook from './AddBook'
import AddBookNoAPI from './AddBookNoAPI'
import AddBookCSV from './AddBookCSV'

const AddBookMain = ({ locale, locations, categories }) => {
    const [options, setOptions] = useState({
        csv: false,
        api: true
    })
    const { t } = useTranslation()

    // Update state when switch is clicked
    const handleChange = (e) => {
        setOptions({
            ...options,
            [e.target.name]: e.target.checked
        })
    }

    return (
        <>
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
        </>
    )
}

AddBookMain.propTypes = {
    locale: PropTypes.string.isRequired,
    locations: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired
}

export default AddBookMain