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
    MenuItem,
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

const MembersReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()

    const handleDateUpdate = (date) => {
        setDate(date)
        props.getNewMembersReport(date)
    }

    const handleDownloadCSV = () => {
        csvlink.current.link.click()
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('memberReport')}</Typography>
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
                                            <Grid item xs={12} sm={3} md={2}>
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
                                            <Grid item xs={12} sm={3} md={2}>
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
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}
                                >
                                    <Button variant="contained" fullWidth onClick={handleDownloadCSV}>{t('downloadcsv')}</Button>
                                    <CSVLink
                                        data={props.filteredMembers.length === 0 ? 'No records found' : props.filteredMembers}
                                        filename={`Members_Report_${new Date().toLocaleDateString()}.csv`}
                                        ref={csvlink}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                <TextField
                                    name="status"
                                    fullWidth
                                    variant="standard"
                                    label={t('status')}
                                    select
                                    value={props.filterMembers.status}
                                    onChange={props.handleMembersChange}
                                >
                                    <MenuItem value="All">{t('all')}</MenuItem>
                                    <MenuItem value="active">{t('active')}</MenuItem>
                                    <MenuItem value="suspended">{t('suspended')}</MenuItem>
                                </TextField>
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
                                        <TableCell>{t('registrationDetails')}</TableCell>
                                        <TableCell>{t('personalDetails')}</TableCell>
                                        <TableCell>{t('otherDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.filteredMembers.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.filteredMembers.map(record => (
                                        <TableRow key={record.RegistrationID}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('registrationId')}: {record.RegistrationID}</Typography>
                                                <Typography variant="caption" display="block">{t('memberid')}: {record.MemberID}</Typography>
                                                <Typography variant="caption" display="block">{t('memberType')}: {record.MemberType}</Typography>
                                                <Typography variant="caption" display="block">{t('date')}: {new Date(record.Date).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">{t('status')}: {record.Status}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('firstName')}: {record.FirstName}</Typography>
                                                <Typography variant="caption" display="block">{t('lastName')}: {record.LastName}</Typography>
                                                <Typography variant="caption" display="block">{t('email')}: {record.Email}</Typography>
                                                <Typography variant="caption" display="block">{t('phone')}: {record.Phone}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('type')}: {record.udmType}</Typography>
                                                {record.udmType === 'Staff' && <Typography variant="caption" display="block">{t('mode')}: {record.staffType}</Typography>}
                                                {record.udmType === 'Staff' && <Typography variant="caption" display="block">{t('academic')}: {record.academic}</Typography>}
                                                {record.udmType === 'Student' && <Typography variant="caption" display="block">{t('mode')}: {record.studentType}</Typography>}
                                                {record.faculty && <Typography variant="caption" display="block">{t('faculty')}: {record.faculty}</Typography>}
                                                {record.contractEndDate && <Typography variant="caption" display="block">{t('contract')}: {new Date(record.contractEndDate).toLocaleDateString()}</Typography>}
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

MembersReport.propTypes = {
    filteredMembers: PropTypes.array.isRequired,
    getNewMembersReport: PropTypes.func.isRequired,
    handleMembersChange: PropTypes.func.isRequired,
    filterMembers: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired
}

export default MembersReport