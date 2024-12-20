import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Button,
    Grid,
    makeStyles,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core'

const Users = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar feedback
    const handleClose = () => {
        setOpen(false)
    }

    // Toggle users status
    const handleToggle = (e) => {
        axios.post(`${url}/users/togglestatus`, { userid: e }, { withCredentials: true })
            .then(result => {
                props.toggleUser(e)
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message, { user: result.data.userid })
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: t(err.response.data.error)
                })
            })
            .finally(() => {
                handleClick()
            })
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Grid container justifyContent="center">
                <Grid item xs={12} md={11} lg={10}>
                    <Paper className={classes.paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('MemberID')}</TableCell>
                                    <TableCell>{t('memberType')}</TableCell>
                                    <TableCell>{t('status')}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {props.users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell width={'30%'}>{user.userid}</TableCell>
                                        <TableCell width={'30%'}>{user.memberType}</TableCell>
                                        <TableCell width={'30%'}>{user.status}</TableCell>
                                        <TableCell width={'10%'}>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleToggle(user._id)}
                                                color={user.status === 'active' ? 'secondary' : 'primary'}
                                            >
                                                {user.status === 'active' ? t('suspend') : t('reactivate')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

const useStyles = makeStyles(() => ({
    table: {
        minWidth: 600,
    },
    hidden: {
        display: 'none'
    },
    paper: {
        overflowX: 'auto'
    }
}))

Users.propTypes = {
    users: PropTypes.array.isRequired,
    toggleUser: PropTypes.func.isRequired
}

export default Users