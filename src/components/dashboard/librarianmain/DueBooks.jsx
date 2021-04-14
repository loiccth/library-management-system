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
    TextField,
    ThemeProvider,
    Toolbar,
    Tooltip,
    Typography,
    useTheme
} from '@material-ui/core'
import { LocalizationProvider, DateRangePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { enGB, fr, zhCN, arSA } from 'date-fns/locale'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

// Set date locale
const localeMap = {
    enUS: enGB,
    frFR: fr,
    zhCN: zhCN,
    arEG: arSA
}

// Set date mask
const maskMap = {
    enUS: '__/__/____',
    frFR: '__/__/____',
    zhCN: '__-__-__',
    arEG: '__/__/____'
}

const DueBooks = (props) => {
    const classes = useStyles()
    const [check, setCheck] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState([new Date(), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()
    const [page, setPage] = useState(1)
    const rowPerPage = 5

    // On date update, get new data from new date range
    const handleDateUpdate = (date) => {
        setDate(date)
        props.getNewDueBooks(date)
    }

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true);
    }

    // Close snackbar for feedbar
    const handleClose = () => {
        setOpen(false);
    }

    // Send notifications to selected due book records
    const handleOnClick = () => {
        axios.post(`${url}/users/notify`, { type: 'due', books: props.dueBooks }, { withCredentials: true })
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
                // Uncheck all and show snackbar feedback
                handleClick()
                props.handleUncheckAllDue()
                setCheck(false)
            })
    }

    // Uncheck all checkboxes
    const handleCheckAll = (e) => {
        setCheck(e.target.checked)
        props.handleCheckAllDue(e)
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
                    <Typography variant="h6">{t('dueBooks')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap[props.locale]}>
                            <ThemeProvider theme={{ ...theme, direction: 'ltr' }}>
                                <DateRangePicker
                                    mask={maskMap[props.locale]}
                                    startText={t('from')}
                                    endText={t('to')}
                                    value={date}
                                    minDate={new Date()}
                                    onChange={handleDateUpdate}
                                    renderInput={(startProps, endProps) => (
                                        <Grid container className={classes.heading} spacing={1}>
                                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                                <TextField
                                                    {...startProps}
                                                    variant="standard"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        style: {
                                                            left: theme.direction === 'rtl' ? 'auto' : 0
                                                        }
                                                    }}
                                                    FormHelperTextProps={{
                                                        style: {
                                                            textAlign: theme.direction === 'rtl' ? 'right' : 'left'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                                <TextField
                                                    {...endProps}
                                                    variant="standard"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        style: {
                                                            left: theme.direction === 'rtl' ? 'auto' : 0
                                                        }
                                                    }}
                                                    FormHelperTextProps={{
                                                        style: {
                                                            textAlign: theme.direction === 'rtl' ? 'right' : 'left'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}
                                />
                            </ThemeProvider>
                        </LocalizationProvider>
                        <Grid container className={classes.heading} spacing={1}>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
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
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Checkbox checked={check} color="primary" onChange={handleCheckAll} />
                                        </TableCell>
                                        <TableCell>{t('MemberID')}</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('borrowDetails')}</TableCell>
                                        <TableCell>{t('flags')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.dueBooks.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.dueBooks.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                <Checkbox value={row._id} checked={row.checked} color="primary" onChange={props.handleCheckDue} />
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
                                                        count={Math.ceil(props.dueBooks.length / rowPerPage)}
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
    table: {
        minWidth: 650,
        overflowX: 'auto'
    },
    title: {
        flex: 1
    },
    paper: {
        overflowX: 'auto'
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

DueBooks.propTypes = {
    dueBooks: PropTypes.array.isRequired,
    getNewDueBooks: PropTypes.func.isRequired,
    handleCheckDue: PropTypes.func.isRequired,
    handleCheckAllDue: PropTypes.func.isRequired,
    handleUncheckAllDue: PropTypes.func.isRequired,
    locale: PropTypes.string.isRequired
}

export default DueBooks