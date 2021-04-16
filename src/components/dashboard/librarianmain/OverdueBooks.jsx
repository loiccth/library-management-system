import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Container,
    Grid,
    makeStyles,
    Pagination,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
} from '@material-ui/core'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const OverdueBooks = (props) => {
    const classes = useStyles()
    const [check, setCheck] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const [page, setPage] = useState(1)
    const rowPerPage = 5

    // Open snackbar to display feedback
    const handleClick = () => {
        setOpen(true);
    }

    // Close snackbar
    const handleClose = () => {
        setOpen(false);
    }

    // Send notifications to all checkboxes checked
    const handleOnClick = () => {
        axios.post(`${url}/users/notify`, { type: 'overdue', books: props.overdueBooks }, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message, { amount: result.data.users.length })
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
                props.handleUncheckAll()
                setCheck(false)
            })
    }

    // Toggle all checkboxes
    const handleCheckAll = (e) => {
        setCheck(e.target.checked)
        props.handleCheckAll(e)
    }

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('overDue')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} lg={10}>
                        <Grid container className={classes.heading} spacing={1}>
                            <Grid item xs={12} sm={4} md={3} lg={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleOnClick}
                                >
                                    {t('reminder')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={11} lg={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'10%'}>
                                            <Checkbox checked={check} color="primary" onChange={handleCheckAll} />
                                        </TableCell>
                                        <TableCell width={'20%'}>{t('MemberID')}</TableCell>
                                        <TableCell width={'30%'}>{t('bookDetails')}</TableCell>
                                        <TableCell width={'30%'}>{t('borrowDetails')}</TableCell>
                                        <TableCell width={'10%'}>{t('flags')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.overdueBooks.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.overdueBooks.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                <Checkbox value={row._id} checked={row.checked} color="primary" onChange={props.handleCheck} />
                                            </TableCell>
                                            <TableCell>
                                                {row.userid}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('borrow')}: {row.isHighDemand ? new Date(row.borrowDate).toLocaleString() : new Date(row.borrowDate).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">{t('due')}: {row.isHighDemand ? new Date(row.dueDate).toLocaleString() : new Date(row.dueDate).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">{t('renews')}: {row.renews}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.isHighDemand &&
                                                    <Tooltip title={t('highDemand')} arrow>
                                                        <PriorityHighIcon className={classes.highpriority} />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(props.overdueBooks.length / rowPerPage)}
                                                        page={page}
                                                        onChange={handlePagination}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 850
    },
    heading: {
        justifyContent: 'flex-end',
        [theme.breakpoints.down("sm")]: {
            justifyContent: 'center'
        }
    },
    highpriority: {
        color: 'red'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

OverdueBooks.propTypes = {
    overdueBooks: PropTypes.array.isRequired,
    handleCheck: PropTypes.func.isRequired,
    handleCheckAll: PropTypes.func.isRequired,
    handleUncheckAll: PropTypes.func.isRequired
}

export default OverdueBooks