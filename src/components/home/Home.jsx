import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import queryString from 'query-string'
import { Controller, useForm } from 'react-hook-form'
import url from '../../settings/api'
import Navbar from '../navbar/Navbar'
import Footer from '../navbar/Footer'
import Books from './Books'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import Box from '@material-ui/core/Box'
import MenuItem from '@material-ui/core/MenuItem'

const Home = (props) => {
    const classes = useStyles()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [books, setBooks] = useState(null)
    const [categories, setCategories] = useState([])
    const { register, handleSubmit, setValue, control } = useForm({
        defaultValues: {
            searchType: 'title',
            category: 'All'
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

    useEffect(() => {
        axios.get(`${url}/settings/categories`)
            .then(result => {
                setCategories(result.data)
            })
    }, [])

    const handleSearch = (data) => {
        axios.post(`${url}/books/search`, data)
            .then(books => {
                setBooks(books.data)
                const stringified = queryString.stringify({
                    ...data,
                    page: 0
                })
                navigate(`?${stringified}`)
            })
    }

    return (
        <>
            {loading ? null :
                <React.Fragment>
                    <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLogout={props.handleLogout} />
                    <Box className={classes.wrapper}>
                        <form className={classes.form} onSubmit={handleSubmit(handleSearch)}>
                            <Container maxWidth="sm" className={classes.container}>
                                <TextField
                                    placeholder="Search books"
                                    style={{ width: '85%' }}
                                    name="search"
                                    variant="standard"
                                    inputRef={register()}
                                />
                                <IconButton type="submit" className={classes.iconButton} aria-label="search">
                                    <SearchIcon />
                                </IconButton>

                                <FormControl component="fieldset">
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                label="Category"
                                                select
                                            >
                                                <MenuItem value="All">All</MenuItem>
                                                {categories.map((category, index) => (
                                                    <MenuItem key={index} value={category}>{category}</MenuItem>
                                                ))}
                                            </TextField>
                                        }
                                        name="category"
                                        control={control}
                                    />
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
                        <Box className={classes.books}>
                            {books && <Books books={books} />}
                        </Box>
                        {books && <Footer />}
                    </Box>
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
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
        [theme.breakpoints.up("sm")]: {
            minHeight: `calc(100vh - 64px)`
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: `calc(100vh - 48px)`
        }
    },
    container: {
        textAlign: 'center'
    },
    books: {
        flex: 1
    }
}))

export default Home