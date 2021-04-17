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
                    <Typography variant="caption" display="block">{t('title')}: {row.title}</Typography>
                    <Typography variant="caption" display="block">{t('isbn')}: {row.isbn}</Typography>
                    <Typography variant="caption" display="block">{t('category')}: {row.category}</Typography>
                </TableCell>
                <TableCell>{row.author}</TableCell>
                <TableCell>
                    <Typography variant="caption" display="block">{t('publisher')}: {row.publisher}</Typography>
                    <Typography variant="caption" display="block">{t('publishedDate')}: {new Date(row.publishedDate).toLocaleDateString()}</Typography>
                    {row.Transaction === 'Borrow' && <Typography variant="caption" display="block">{t('copyId')}: {row._id}</Typography>}
                </TableCell>
                <TableCell>
                    <Typography variant="caption" display="block">{t('campus')}: {row.campus}</Typography>
                    <Typography variant="caption" display="block">{t('location')}: {row.location}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="caption" display="block">{t('addedDate')}: {new Date(row.createdAt).toLocaleDateString()}</Typography>
                    <Typography variant="caption" display="block">{t('copies')}: {row.copies.length}</Typography>
                    <Typography variant="caption" display="block">{t('removed')}: {row.removed.length}</Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                {t('bookDetails')}
                            </Typography>
                            <Table size="small" aria-label="events">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'25%'}>{t('id')}</TableCell>
                                        <TableCell width={'25%'}>{t('status')}</TableCell>
                                        <TableCell width={'25%'}>{t('removedDate')}</TableCell>
                                        <TableCell width={'25%'}>{t('reason')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.removed.map(removedBook => (
                                        <TableRow key={removedBook._id}>
                                            <TableCell component="th" scope="row">
                                                {removedBook._id}
                                            </TableCell>
                                            <TableCell>Removed</TableCell>
                                            <TableCell>
                                                {new Date(removedBook.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {removedBook.reason}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {row.copies.map(book => (
                                        <TableRow key={book._id}>
                                            <TableCell component="th" scope="row">
                                                {book._id}
                                            </TableCell>
                                            <TableCell>Active</TableCell>
                                            <TableCell>N/A</TableCell>
                                            <TableCell>N/A</TableCell>
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