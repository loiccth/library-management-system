import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import ModifyBook from './ModifyBook'
import Copies from './Copies'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'

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

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        axios.post(`${url}/books/search`, data)
            .then(book => {
                if (book.data.length > 0) {
                    setBook({
                        title: book.data[0].title,
                        isbn: book.data[0].isbn,
                        author: book.data[0].author.join(', '),
                        categories: book.data[0].categories.join(', '),
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
                    setSnackbar('Book not found.')
                    handleClick()
                }
            })
    }

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
            <Paper>
                <Container>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            autoComplete="off"
                            fullWidth
                            variant="standard"
                            margin="normal"
                            id="search"
                            name="search"
                            label="ISBN"
                            inputRef={register({ required: 'ISBN is required.' })}
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
                    </form>
                    {showForm && <ModifyBook book={book} locations={props.locations} />}
                    {showForm && <Copies copies={copies} isbn={book.isbn} deleteCopies={deleteCopies} />}
                </Container>
            </Paper>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    hidden: {
        display: 'none'
    }
}))


export default SearchBook