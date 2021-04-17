import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Box,
    Collapse,
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@material-ui/core'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

const Row = (props) => {
    const { row } = props
    const [open, setOpen] = useState(false)
    const classes = useRowStyles()
    const { t } = useTranslation()

    return (
        <>
            <TableRow className={classes.root}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Typography variant="caption" display="block">{t('sessionid')}: {row.sessionid}</Typography>
                    <Typography variant="caption" display="block">{t('sessionDate')}: {new Date(row.sessionDate).toLocaleString()}</Typography>
                    <Typography variant="caption" display="block">{t('memberid')}: {row.user === null ? <span className={classes.guest}>Guest</span> : row.user.userid}</Typography>
                    {row.user !== null && row.user !== 'Guest' && <Typography variant="caption" display="block">{t('memberType')}: {row.user.memberType}</Typography>}
                </TableCell>
                <TableCell>
                    <Typography variant="caption" display="block">{t('ip')}: {row.ip}</Typography>
                    {row.geolocation !== null && <>
                        <Typography variant="caption" display="block">{t('continent')}: {row.geolocation.continentName}</Typography>
                        <Typography variant="caption" display="block">{t('country')}: {row.geolocation.countryName}</Typography>
                        <Typography variant="caption" display="block">{t('region')}: {row.geolocation.regionName}</Typography>
                    </>}
                </TableCell>
                <TableCell>
                    <Typography variant="caption" display="block">{t('deviceType')}: {row.device}</Typography>
                    <Typography variant="caption" display="block">{t('userAgent')}: {row.userAgent}</Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                {t('events')}
                            </Typography>
                            <Table size="small" aria-label="events">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'33%'}>{t('date')}</TableCell>
                                        <TableCell width={'33%'}>{t('type')}</TableCell>
                                        <TableCell width={'33%'}>{t('information')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.events.map((eventsRow) => (
                                        <TableRow key={eventsRow.date}>
                                            <TableCell component="th" scope="row">
                                                {new Date(eventsRow.date).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {eventsRow.type}
                                            </TableCell>
                                            <TableCell>
                                                {eventsRow.info}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

const useRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    },
    guest: {
        fontWeight: 550
    }
})

export default Row