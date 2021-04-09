import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Container,
    IconButton,
    makeStyles,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import Users from './Users'

const SearchUsers = () => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [showForm, setShowForm] = useState(false)
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

    // Search user
    const onSubmit = (data) => {
        axios.post(`${url}/users/search`, data, { withCredentials: true })
            .then(users => {
                setUsers(users.data)
                setShowForm(true)
            })
            .catch(err => {
                setSnackbar(t(err.response.data.error))
                handleClick()
            })
    }

    // Suspend/unsuspend user
    const toggleUser = (id) => {
        setUsers(users.filter(user => {
            if (user._id === id)
                user.status = user.status === 'active' ? 'suspended' : 'active'
            return user
        }))
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
                    <Typography variant="h6">{t('searchUser')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Container maxWidth="sm" className={classes.container}>
                        <TextField
                            placeholder={t('searchMemberID')}
                            autoComplete="off"
                            style={{ width: '85%' }}
                            name="userid"
                            variant="standard"
                            error={!!errors.userid}
                            inputRef={register({ required: t('requiredField') })}
                            helperText={!!errors.userid ? errors.userid.message : " "}
                        />
                        <IconButton type="submit" className={classes.iconButton} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Container>
                </form>
            </Box>
            {showForm &&
                <Users users={users} toggleUser={toggleUser} />
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

export default SearchUsers