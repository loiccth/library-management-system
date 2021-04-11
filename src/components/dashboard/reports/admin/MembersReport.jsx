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
    MenuItem,
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

const MembersReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()
    const [members, setMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])
    const [filterMembers, setFilterMembers] = useState({
        status: 'All'
    })
    const [page, setPage] = useState(1)
    const rowPerPage = 5
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    useEffect(() => {
        const fetchData = async () => {
            const getMembers = await getMembersReport(firstDay, new Date())
            setMembers(getMembers)
            setFilteredMembers(getMembers)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // Date range updated
    const handleDateUpdate = (date) => {
        setDate(date)
        getNewMembersReport(date)
    }

    // Set filter type for member report
    const handleMembersChange = (e) => {
        setFilterMembers({
            [e.target.name]: e.target.value
        })
        handleFilterMembers(e.target.value)
    }

    // Filter members
    const handleFilterMembers = (value) => {
        if (value === 'All')
            setFilteredMembers([...members])
        else
            setFilteredMembers(members.filter(record => record.Status === value))
    }

    // Get new data when date range is updated
    const getNewMembersReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getMembers = await getMembersReport(date[0], date[1])
            setMembers(getMembers)

            if (filterMembers.status !== 'All')
                handleFilterMembers(filterMembers.status)
            else
                setFilteredMembers(getMembers)
        }
    }

    // Function to get data
    const getMembersReport = async (from, to) => {
        const getMembers = await axios.post(`${url}/users/membersreport`, { from, to }, { withCredentials: true })

        const temp = getMembers.data.map(member => {
            return {
                RegistrationID: member._id,
                Date: member.createdAt,
                Status: member.status,
                MemberID: member.userid,
                MemberType: member.memberType,
                FirstName: member.udmid.firstName,
                LastName: member.udmid.lastName,
                Email: member.udmid.email,
                Phone: member.udmid.phone,
                udmType: member.udmid.udmType,
                staffType: member.udmid.udmType === 'Staff' ? member.udmid.staffType : null,
                studentType: member.udmid.udmType === 'Student' ? member.udmid.studentType : null,
                academic: member.udmid.academic === true ? 'Yes' : 'No',
                faculty: member.udmid.faculty,
                contractEndDate: (member.udmid.udmType === 'Staff' && member.udmid.staffType === 'pt') ? member.udmid.contractEndDate : null
            }
        })
        return temp
    }

    // Download csv file
    const handleDownloadCSV = () => {
        csvlink.current.link.click()
    }

    // Page change
    const handlePagination = (e, value) => {
        setPage(value)
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
                                        data={filteredMembers.length === 0 ? 'No records found' : filteredMembers}
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
                                    value={filterMembers.status}
                                    onChange={handleMembersChange}
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
                                    {filteredMembers.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {filteredMembers.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(record => (
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
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(filteredMembers.length / rowPerPage)}
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
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

MembersReport.propTypes = {
    locale: PropTypes.string.isRequired
}

export default MembersReport