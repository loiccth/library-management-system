import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../../settings/api'
import { CSVLink } from 'react-csv'
import {
    Box,
    Button,
    Container,
    Grid,
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
import { LocalizationProvider, DateRangePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { enGB, fr, zhCN, arSA } from 'date-fns/locale'
import Row from './Row'

const localeMap = {
    enUS: enGB,
    frFR: fr,
    zhCN: zhCN,
    arEG: arSA
}

const maskMap = {
    enUS: '__/__/____',
    frFR: '__/__/____',
    zhCN: '__-__-__',
    arEG: '__/__/____'
}

const BooksReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [books, setBooks] = useState([])
    const [csv, setCsv] = useState([])
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()
    const [page, setPage] = useState(1)
    const rowPerPage = 5
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // Get data on page load
    useEffect(() => {
        const fetchData = async () => {
            const getBooks = await getBooksReport(firstDay, new Date())
            setBooks(getBooks)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Get new data on date range update
    const handleDateUpdate = (date) => {
        setDate(date)
        getNewBooksReport(date)
    }

    // Function to get books data
    const getBooksReport = async (from, to) => {
        const getBooks = await axios.post(`${url}/books/report`, { from, to }, { withCredentials: true })

        const temp = getBooks.data.map(book => {
            let temp = ''

            for (let i = 0; i < book.author.length; i++) {
                temp += book.author[i]
                if (book.author.length - 1 > i)
                    temp += ', '
            }

            return {
                ...book,
                author: temp
            }
        })
        return temp
    }

    // Get new books data on date range change
    const getNewBooksReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getBooks = await getBooksReport(date[0], date[1])
            setBooks(getBooks)
        }
    }

    // Download csv file
    const handleDownloadCSV = () => {
        axios.post(`${url}/books/reportcsv`, { from: date[0], to: date[1] }, { withCredentials: true })
            .then(books => {
                setCsv(books.data)
                csvlink.current.link.click()
            })
    }

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('bookReport')}</Typography>
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
                                <Button variant="contained" fullWidth onClick={handleDownloadCSV}>{t('downloadcsv')}</Button>
                                <CSVLink
                                    data={csv.length === 0 ? 'No records found' : csv}
                                    filename={`Books_Report_${new Date().toLocaleDateString()}.csv`}
                                    ref={csvlink}
                                />
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
                                        <TableCell width={'20%'}>{t('bookDetails')}</TableCell>
                                        <TableCell width={'20%'}>{t('author')}</TableCell>
                                        <TableCell width={'20%'}>{t('publishDetails')}</TableCell>
                                        <TableCell width={'15%'}>{t('locationDetails')}</TableCell>
                                        <TableCell width={'20%'}>{t('otherDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {books.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {books.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map((row, index) => (
                                        <Row key={index} row={row} />
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(books.length / rowPerPage)}
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

BooksReport.propTypes = {
    locale: PropTypes.string.isRequired
}

export default BooksReport