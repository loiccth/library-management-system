import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
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
    Toolbar,
    Typography
} from '@material-ui/core'

const TransactionHistory = () => {
    const classes = useStyles()
    const [transactions, setTransactions] = useState([])
    const { t } = useTranslation()
    const [page, setPage] = useState(1)
    const rowPerPage = 5

    // Get list of transactions made on page load
    useEffect(() => {
        const fetchData = async () => {
            const temp = await axios.get(`${url}/users/transactions_history`, { withCredentials: true })
            setTransactions(temp.data)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('transactionHistory')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('transactionDetails')}</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('date')}</TableCell>
                                        <TableCell>{t('otherDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {transactions.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('transactionType')}: {row.transactionType}</Typography>
                                                <Typography variant="caption" display="block">{t('status')}: {row.status}</Typography>
                                                <Typography variant="caption" display="block">{t('id')}: {row._id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{row.transactionType === 'Borrow' ? t('borrowDate') : t('reserveDate')}: {new Date(row.createdAt).toLocaleString()}</Typography>
                                                {row.transactionType === 'Borrow' &&
                                                    <>
                                                        <Typography variant="caption" display="block">{t('dueDate')}: {new Date(row.dueDate).toLocaleString()}</Typography>
                                                        <Typography variant="caption" display="block">{t('returnDate')}: {new Date(row.returnedOn).toLocaleString()}</Typography>
                                                    </>
                                                }
                                                {row.transactionType === 'Reserve' &&
                                                    <Typography variant="caption" display="block">{t('expireDate')}: {new Date(row.expireAt).toLocaleString()}</Typography>
                                                }
                                                {row.transactionType === 'Reserve' && row.isCancel &&
                                                    <Typography variant="caption" display="block">{t('cancelDate')}: {new Date(row.updatedAt).toLocaleString()}</Typography>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {row.transactionType === 'Borrow' &&
                                                    <>
                                                        <Typography variant="caption" display="block">{t('renews')}: {row.renews}</Typography>
                                                    </>
                                                }
                                                {row.transactionType === 'Reserve' &&
                                                    <Typography variant="caption" display="block">{t('cancel')}: {row.isCancel ? 'Yes' : 'No'}</Typography>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(transactions.length / rowPerPage)}
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

const useStyles = makeStyles(() => ({
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
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

export default TransactionHistory