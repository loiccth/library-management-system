import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import queryString from 'query-string'
import {
    Alert,
    Box,
    Container,
    Grid,
    makeStyles,
    Pagination,
    Snackbar
} from '@material-ui/core'
import Navbar from '../navbar/Navbar'
import AddPost from './AddPost'
import Post from './Post'
import Footer from '../navbar/Footer'

const Blog = (props) => {
    const classes = useStyles()
    const navigate = useNavigate()
    const { search } = useLocation()
    const query = queryString.parse(search)
    const [page, setPage] = useState(query.page ? parseInt(query.page) : 1)
    const [posts, setPosts] = useState([])
    const [postsSubset, setPostsSubset] = useState([])
    const [loading, setLoading] = useState(true)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()

    // On page load get all posts
    useEffect(() => {
        axios.get(`${url}/posts`, { withCredentials: true })
            .then(result => {
                setPosts(result.data)
                // Create a subset for pagination
                setPostsSubset(result.data.slice((page - 1) * 5, (page * 5)))
                setLoading(false)
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // On page change in query string update post subset
    useEffect(() => {
        if (query.page && (query.page > Math.ceil(posts.length / 5) || query.page < 1 || isNaN(query.page))) {
            setPage(1)
            query.page = 1
            const stringified = queryString.stringify(query)
            navigate(`?${stringified}`)
        }
        else {
            setPage(query.page ? parseInt(query.page) : 1)
            setPostsSubset(posts.slice((page - 1) * 5, (page * 5)))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.page])

    useEffect(() => {
        setPostsSubset(posts.slice((page - 1) * 5, (page * 5)))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts])

    // Update page number and query string when pagination button is clicked
    const handlePagination = (e, value) => {
        setPage(value)
        query.page = value
        const stringified = queryString.stringify(query)
        navigate(`?${stringified}`)
    }

    // Show snackbar message
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar message
    const handleClose = () => {
        setOpen(false)
    }

    // Add recently added post to the list of post and display snackbar
    const handleAddPost = (result) => {
        if (result.message) {
            setSnackbar({
                type: 'success',
                msg: t(result.message)
            })

            let temp = {
                _id: result.post._id,
                userid: {
                    userid: props.user.userid
                },
                title: result.post.title,
                body: result.post.body,
                createdAt: result.post.createdAt,
                updatedAt: result.post.updatedAt
            }

            setPosts([
                temp,
                ...posts
            ])

        }
        else
            // Add post unsuccessful, display warning message
            setSnackbar({
                type: 'warning',
                msg: t(result.error)
            })
        handleClick()
    }

    // Remove post from list of post and display snackbar feedback
    const handleDeletePost = (result) => {
        if (result.message) {
            setSnackbar({
                type: 'success',
                msg: t(result.message)
            })
            setPosts(posts.filter(post => post._id !== result.id))
        }
        else
            // Delete unsuccessful
            setSnackbar({
                type: 'warning',
                msg: t(result.error)
            })
        handleClick()
    }

    // Update post and show snackbar
    const handleEditPost = (result) => {
        if (result.message) {
            setSnackbar({
                type: 'success',
                msg: t(result.message)
            })
            setPosts(posts.filter(post => {
                if (post._id === result.post._id) {
                    post.title = result.post.title
                    post.body = result.post.body
                }
                return post
            }))
        }
        else
            setSnackbar({
                type: 'warning',
                msg: t(result.error)
            })
        handleClick()
    }

    return (
        <>
            <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLocale={props.handleLocale} handleLogout={props.handleLogout} />
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            {loading ? null :
                <>
                    <Box className={classes.wrapper}>
                        <Box sx={{ my: 3 }} className={classes.container}>
                            <Container>
                                <Grid container justifyContent="center">
                                    {props.user.isLoggedIn && (props.user.memberType === 'Librarian' || props.user.memberType === 'Admin') &&
                                        <Grid item xs={12} sm={10} md={7} lg={7} xl={8}>
                                            <AddPost handleAddPost={handleAddPost} />
                                        </Grid>
                                    }
                                    {postsSubset.map(post => (
                                        <Grid key={post._id} item xs={12} sm={10} md={7} lg={7} xl={8}>
                                            <Box sx={{ my: 1 }}>
                                                <Post user={props.user} post={post} handleDeletePost={handleDeletePost} handleEditPost={handleEditPost} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Container>
                        </Box>
                        <Pagination className={classes.pagination} count={Math.ceil(posts.length / 5)} page={page} onChange={handlePagination} />
                        <Footer darkMode={props.darkMode} />
                    </Box>
                </>}
        </>
    )
}

const useStyles = makeStyles(theme => ({
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
        flex: 1
    },
    pagination: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(4),
        display: 'flex',
        justifyContent: 'center'
    }
}))

Blog.propTypes = {
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLocale: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired,
}

export default Blog