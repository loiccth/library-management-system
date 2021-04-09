import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Container,
    Divider,
    IconButton,
    makeStyles,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import ModifyBook from './ModifyBook'
import Copies from './Copies'

const SearchBook = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [book, setBook] = useState()
    const [copies, setCopies] = useState()
    const { register, handleSubmit, errors } = useForm({
        defaultValues: {
            searchType: 'isbn'
        }
    })
    const { t } = useTranslation()

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar feedback
    const handleClose = () => {
        setOpen(false)
    }

    // Search book to edit
    const onSubmit = (data) => {
        axios.post(`${url}/books/search`, data)
            .then(book => {
                if (book.data.length > 0) {
                    setBook({
                        title: book.data[0].title,
                        isbn: book.data[0].isbn,
                        author: book.data[0].author.join(', '),
                        category: book.data[0].category,
                        publisher: book.data[0].publisher,
                        publishedDate: book.data[0].publishedDate,
                        noOfPages: book.data[0].noOfPages,
                        campus: book.data[0].campus,
                        location: book.data[0].location,
                        description: book.data[0].description
                    })
                    setCopies(
                        book.data[0].copies
                    )
                    setShowForm(true)
                }
                else {
                    setSnackbar(t('msgSearchBook404'))
                    handleClick()
                }
            })
    }

    // Remove copies from table after removing from database
    const deleteCopies = (data) => {
        for (let i = 0; i < data.copies.length; i++) {
            if (!data.copies[i].checked)
                continue

            setCopies(copies.filter(({ _id }) => _id !== data.copies[i]._id))
        }
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity="warning" onClose={handleClose}>
                    {snackbar}
                </Alert>
            </Snackbar>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('searchBook')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Container maxWidth="sm" className={classes.container}>
                        <TextField
                            placeholder={t('searchISBN')}
                            autoComplete="off"
                            style={{ width: '85%' }}
                            name="search"
                            variant="standard"
                            error={!!errors.search}
                            inputRef={register({ required: t('requiredField') })}
                            helperText={!!errors.search ? errors.search.message : " "}
                        />
                        <TextField
                            className={classes.hidden}
                            name="searchType"
                            inputRef={register()}
                        />
                        <IconButton type="submit" className={classes.iconButton} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Container>
                </form>
            </Box>
            {showForm &&
                <>
                    <ModifyBook book={book} locations={props.locations} categories={props.categories} locale={props.locale} />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <Copies copies={copies} isbn={book.isbn} deleteCopies={deleteCopies} />
                </>
            }
        </>
    )
}

const useStyles = makeStyles(() => ({
    hidden: {
        display: 'none !important'
    },
    iconButton: {
        padding: 10
    },
    container: {
        textAlign: 'center'
    }
}))

SearchBook.propTypes = {
    locations: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    locale: PropTypes.string.isRequired
}

export default SearchBook