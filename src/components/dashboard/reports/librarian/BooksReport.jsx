import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { CSVLink } from 'react-csv'
import {
    Box,
    Button,
    Container,
    Grid,
    makeStyles,
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
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()

    const handleDateUpdate = (date) => {
        setDate(date)
        props.getNewBooksReport(date)
    }

    const handleDownloadCSV = () => {
        csvlink.current.link.click()
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
                                    onChange={handleDateUpdate}
                                    renderInput={(startProps, endProps) => (
                                        <Grid container className={classes.heading} spacing={1}>
                                            <Grid item xs={12} sm={3} md={2}>
                                                <TextField
                                                    {...startProps}
                                                    variant="standard"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        style: {
                                                            left: props.locale === 'arEG' ? 'auto' : 0
                                                        }
                                                    }}
                                                    FormHelperTextProps={{
                                                        style: {
                                                            textAlign: props.locale === 'arEG' ? 'right' : 'left'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={3} md={2}>
                                                <TextField
                                                    {...endProps}
                                                    variant="standard"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        style: {
                                                            left: props.locale === 'arEG' ? 'auto' : 0
                                                        }
                                                    }}
                                                    FormHelperTextProps={{
                                                        style: {
                                                            textAlign: props.locale === 'arEG' ? 'right' : 'left'
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
                                <Button variant="contained" fullWidth onClick={handleDownloadCSV}>{t('downloadcsv')}</Button>
                                <CSVLink
                                    data={props.books.length === 0 ? 'No records found' : props.books}
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
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('author')}</TableCell>
                                        <TableCell>{t('publishDetails')}</TableCell>
                                        <TableCell>{t('locationDetails')}</TableCell>
                                        <TableCell>{t('otherDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.books.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.books.map(record => (
                                        <TableRow key={record.BookID}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {record.Title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {record.ISBN}</Typography>
                                                <Typography variant="caption" display="block">{t('category')}: {record.Category}</Typography>
                                            </TableCell>
                                            <TableCell>{record.Author}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('publisher')}: {record.Publisher}</Typography>
                                                <Typography variant="caption" display="block">{t('publishedDate')}: {record.PublishedDate}</Typography>
                                                {record.Transaction === 'Borrow' && <Typography variant="caption" display="block">{t('copyId')}: {record.BookCopyID}</Typography>}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('campus')}: {record.Campus}</Typography>
                                                <Typography variant="caption" display="block">{t('location')}: {record.Location}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('addedDate')}: {record.DateAdded}</Typography>
                                                <Typography variant="caption" display="block">{t('copies')}: {record.NumOfCopies}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
    }
}))

BooksReport.propTypes = {
    books: PropTypes.array.isRequired,
    getNewBooksReport: PropTypes.func.isRequired,
    locale: PropTypes.string.isRequired
}

export default BooksReport