import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../../settings/api'
import { CSVLink } from 'react-csv'
import {
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    IconButton,
    Input,
    InputLabel,
    InputAdornment,
    makeStyles,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    ThemeProvider,
    Toolbar,
    Typography,
    useTheme
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { LocalizationProvider, DateRangePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { enGB, fr, zhCN, arSA } from 'date-fns/locale'
import Row from './Row'

// Date locale
const localeMap = {
    enUS: enGB,
    frFR: fr,
    zhCN: zhCN,
    arEG: arSA
}

// Date mask
const maskMap = {
    enUS: '__/__/____',
    frFR: '__/__/____',
    zhCN: '__-__-__',
    arEG: '__/__/____'
}

const AnalyticsReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()
    const [page, setPage] = useState(1)
    const [analytics, setAnalytics] = useState([])
    const [csv, setCsv] = useState([])
    const rowPerPage = 5
    const { register, handleSubmit, getValues } = useForm()

    // Change date range
    const handleDateUpdate = (date) => {
        setDate(date)
        getNewAnalyticsReport(date)
    }

    useEffect(() => {
        const fetchData = async () => {
            getAnalyticsReport(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), new Date())

        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Get analytics report within range
    const getAnalyticsReport = (from, to, userid = '') => {
        axios.post(`${url}/analytics/report`, { from, to, userid }, { withCredentials: true })
            .then(result => {
                setAnalytics(result.data)
            })
    }

    // Get new data for analytics when date range is updated
    const getNewAnalyticsReport = (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            getAnalyticsReport(date[0], date[1], getValues('userid'))
        }
    }

    // Download csv file
    const handleDownloadCSV = () => {
        axios.post(`${url}/analytics/csv`, { from: date[0], to: date[1], userid: getValues('userid') }, { withCredentials: true })
            .then(response => {
                setCsv(response.data)
                csvlink.current.link.click()
            })
    }

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
    }

    const onSubmit = (data) => {
        getAnalyticsReport(date[0], date[1], data.userid)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('analyticsReport')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} lg={10}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap[props.locale]}>
                            <ThemeProvider theme={{ ...theme, direction: 'ltr' }}>
                                <DateRangePicker
                                    mask={maskMap[props.locale]}
                                    startText={t('from')}
                                    endText={t('to')}
                                    value={date}
                                    disableFuture
                                    onChange={handleDateUpdate}
                                    renderInput={(startProps, endProps) => (
                                        <Grid container className={classes.heading} spacing={1}>
                                            <Grid item xs={12} sm={4} md={3} lg={2}>
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
                                            <Grid item xs={12} sm={4} md={3} lg={2}>
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
                            <Grid item xs={12} sm={4} md={3} lg={2}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}>
                                    <Button variant="contained" fullWidth onClick={handleDownloadCSV}>{t('downloadcsv')}</Button>
                                    <CSVLink
                                        data={csv.length === 0 ? 'No records found' : csv}
                                        filename={`Analytics_Report_${new Date().toLocaleDateString()}.csv`}
                                        ref={csvlink}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3} lg={2}>
                                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="userid">{t('filterMemberID')}</InputLabel>
                                        <Input
                                            autoComplete="off"
                                            id="userid"
                                            name="userid"
                                            fullWidth
                                            type="text"
                                            inputRef={register()}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton type="submit">
                                                        <SearchIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                </form>
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
                                        <TableCell width={'5%'} />
                                        <TableCell width={'25%'}>{t('userDetails')}</TableCell>
                                        <TableCell width={'15%'}>{t('geolocation')}</TableCell>
                                        <TableCell width={'55%'}>{t('deviceDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analytics.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {analytics.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map((row, index) => (
                                        <Row key={index} row={row} />
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(analytics.length / rowPerPage)}
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
        minWidth: 850
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
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

AnalyticsReport.propTypes = {
    locale: PropTypes.string.isRequired
}

export default AnalyticsReport