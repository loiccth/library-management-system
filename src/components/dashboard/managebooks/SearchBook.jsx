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
import RestoreCopies from './RestoreCopies'

const SearchBook = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [book, setBook] = useState([])
    const [copies, setCopies] = useState([])
    const [removed, setRemoved] = useState([])
    const { register, handleSubmit, errors } = useForm()
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
        axios.post(`${url}/books/search`, { edit: true, searchType: 'isbn', search: data.search })
            .then(book => {
                if (book.data.length > 0) {
                    formatData(book.data[0])
                    setShowForm(true)
                }
                else {
                    setSnackbar(t('msgSearchBook404'))
                    handleClick()
                }
            })
    }

    // Format data and put in state
    const formatData = (book) => {
        setBook({
            title: book.title,
            isbn: book.isbn,
            author: book.author.join(', '),
            category: book.category,
            publisher: book.publisher,
            publishedDate: book.publishedDate,
            noOfPages: book.noOfPages,
            campus: book.campus,
            location: book.location,
            description: book.description
        })
        setCopies(book.copies)
        setRemoved(book.removed)
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
                        <IconButton type="submit" className={classes.iconButton} >
                            <SearchIcon />
                        </IconButton>
                    </Container>
                </form>
            </Box>
            {showForm &&
                <>
                    <ModifyBook book={book} locations={props.locations} categories={props.categories} locale={props.locale} />
                    {copies.length > 0 &&
                        <>
                            <Box sx={{ my: 3 }}>
                                <Divider />
                            </Box>
                            <Copies copies={copies} isbn={book.isbn} formatData={formatData} />
                        </>
                    }
                    {removed.length > 0 &&
                        <>
                            <Box sx={{ my: 3 }}>
                                <Divider />
                            </Box>
                            <RestoreCopies copies={removed} isbn={book.isbn} formatData={formatData} />
                        </>
                    }
                </>
            }
        </>
    )
}

const useStyles = makeStyles(() => ({
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