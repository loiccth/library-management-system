import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import queryString from 'query-string'
import { Controller, useForm } from 'react-hook-form'
import url from '../../settings/api'
import Navbar from '../navbar/Navbar'
import Books from './Books'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

const Home = (props) => {
    const classes = useStyles()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [books, setBooks] = useState(null)
    const { register, handleSubmit, setValue, control } = useForm({
        defaultValues: {
            searchType: 'title'
        },
        shouldUnregister: false
    })
    const { search } = useLocation()

    const searchQuery = queryString.parse(search)
    useEffect(() => {
        if (!searchQuery.search) {
            setValue('search', '')
            setValue('searchType', 'title')
            axios.get(`${url}/books`)
                .then(books => {
                    setBooks(books.data.books)
                })
        }
        else {
            setValue('search', searchQuery.search)
            setValue('searchType', searchQuery.searchType)
            axios.post(`${url}/books/search`, searchQuery)
                .then(books => {
                    setBooks(books.data)
                })
        }
        setLoading(false)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery.search, searchQuery.searchType])

    const handleSearch = (data) => {
        axios.post(`${url}/books/search`, data)
            .then(books => {
                setBooks(books.data)
                const stringified = queryString.stringify({
                    ...data,
                    page: 1
                })
                navigate(`?${stringified}`)
            })
    }

    return (
        <>
            {loading ? null :
                <React.Fragment>
                    <Navbar user={props.user} handleLogout={props.handleLogout} />
                    <form className={classes.form} onSubmit={handleSubmit(handleSearch)}>
                        <Container maxWidth="sm" className={classes.container}>
                            <TextField
                                className={classes.searchbar}
                                placeholder="Search books"
                                style={{ width: '85%' }}
                                name="search"
                                variant="standard"
                                inputRef={register}
                            />
                            <IconButton type="submit" className={classes.iconButton} aria-label="search">
                                <SearchIcon />
                            </IconButton>

                            <FormControl component="fieldset">
                                <Controller
                                    as={
                                        <RadioGroup row name="searchType">
                                            <FormControlLabel
                                                control={<Radio color="primary" />}
                                                label="Title"
                                                value="title"
                                            />
                                            <FormControlLabel
                                                control={<Radio color="primary" />}
                                                label="Author"
                                                value="author"
                                            />
                                            <FormControlLabel
                                                control={<Radio color="primary" />}
                                                label="ISBN"
                                                value="isbn"
                                            />
                                        </RadioGroup>
                                    }
                                    name="searchType"
                                    control={control}
                                />
                            </FormControl>
                        </Container>
                    </form>
                    <div className="container">
                        {books ? <Books books={books} /> : null}
                    </div>
                </React.Fragment>
            }
        </>
    )
}

const useStyles = makeStyles(theme => ({
    form: {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(8),
    },
    iconButton: {
        padding: 10
    },
    container: {
        textAlign: 'center'
    }
}))

export default Home