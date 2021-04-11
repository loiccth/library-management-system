import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../../settings/api'
import { Box, Divider, Grid, makeStyles } from '@material-ui/core'
import IssueBook from './IssueBook'
import ReturnBook from './ReturnBook'
import OverdueBooks from './OverdueBooks'
import DueBooks from './DueBooks'
import DuePayments from './DuePayments'
import Reservations from './Reservations'

const LibrarianMain = (props) => {
    const classes = useStyles()
    const [overdueBooks, setOverdueBooks] = useState([])
    const [dueBooks, setDueBooks] = useState([])
    const [duePayments, setDuePayments] = useState([])
    const [reservations, setReservations] = useState([])

    // Get data on page load
    useEffect(() => {
        const fetchData = async () => {
            // Get overdue books and set data in state
            const getOverdue = await axios.get(`${url}/books/overdue`, { withCredentials: true })
            setOverdueBooks(
                // Format data
                getOverdue.data.map(borrow => {
                    return {
                        checked: false,
                        _id: borrow._id,
                        userid: borrow.userid.userid,
                        email: borrow.userid.udmid.email,
                        phone: borrow.userid.udmid.phone,
                        title: borrow.bookid.title,
                        isbn: borrow.bookid.isbn,
                        dueDate: borrow.dueDate,
                        borrowDate: borrow.createdAt,
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
            // Get due books and set data in state
            const getDue = await getDueBooks(new Date(), new Date())
            setDueBooks(
                // Format data
                getDue.data.map(borrow => {
                    return {
                        checked: false,
                        _id: borrow._id,
                        userid: borrow.userid.userid,
                        email: borrow.userid.udmid.email,
                        phone: borrow.userid.udmid.phone,
                        title: borrow.bookid.title,
                        isbn: borrow.bookid.isbn,
                        dueDate: borrow.dueDate,
                        borrowDate: borrow.createdAt,
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
            // Get reservation and set data in state
            const getReserve = await axios.get(`${url}/books/reservation`, { withCredentials: true })
            setReservations(
                // Format data
                getReserve.data.map(reserve => {
                    return {
                        _id: reserve._id,
                        userid: reserve.userid.userid,
                        title: reserve.bookid.title,
                        isbn: reserve.bookid.isbn,
                        reserveDate: reserve.createdAt,
                        expireDate: reserve.expireAt,
                        isHighDemand: reserve.bookid.isHighDemand
                    }
                })
            )
            // Get payments due and set data in state
            const getDuePayments = await axios.get(`${url}/users/fine`, { withCredentials: true })
            setDuePayments(
                // Format data
                getDuePayments.data.map(payment => {
                    return {
                        _id: payment._id,
                        borrowDate: payment.borrowid.createdAt,
                        returnedDate: payment.borrowid.returnedOn,
                        dueDate: payment.borrowid.dueDate,
                        userid: payment.userid.userid,
                        memberType: payment.userid.memberType,
                        title: payment.bookid.title,
                        isbn: payment.bookid.isbn,
                        copyid: payment.copyid,
                        days: payment.numOfDays,
                        price: payment.pricePerDay,
                        date: payment.createdAt
                    }
                })
            )
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Get due books function
    const getDueBooks = (from, to) => {
        return axios.post(`${url}/books/due`, { from, to }, { withCredentials: true })
    }

    // Get new due books when date range is changed
    const getNewDueBooks = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getDue = await getDueBooks(date[0], date[1])
            setDueBooks(
                getDue.data.map(borrow => {
                    return {
                        checked: false,
                        _id: borrow._id,
                        userid: borrow.userid.userid,
                        email: borrow.userid.udmid.email,
                        title: borrow.bookid.title,
                        isbn: borrow.bookid.isbn,
                        dueDate: borrow.dueDate,
                        borrowDate: borrow.createdAt,
                        renews: borrow.renews,
                        isHighDemand: borrow.isHighDemand
                    }
                })
            )
        }
    }

    // Check checkbox for overdue
    const handleCheck = (e) => {
        setOverdueBooks(
            overdueBooks.map(borrow => {
                if (borrow._id === e.target.value) {
                    borrow.checked = e.target.checked
                }
                return borrow
            })
        )
    }

    // Check all checkboxes
    const handleCheckAll = (e) => {
        setOverdueBooks(
            overdueBooks.map(borrow => {
                borrow.checked = e.target.checked
                return borrow
            })
        )
    }

    // Uncheck all checkboxes
    const handleUncheckAll = () => {
        setOverdueBooks(
            overdueBooks.map(borrow => {
                borrow.checked = false
                return borrow
            })
        )
    }

    // Check checkbox for due books
    const handleCheckDue = (e) => {
        setDueBooks(
            dueBooks.map(borrow => {
                if (borrow._id === e.target.value) {
                    borrow.checked = e.target.checked
                }
                return borrow
            })
        )
    }

    // Check all checkboxes for due books
    const handleCheckAllDue = (e) => {
        setDueBooks(
            dueBooks.map(borrow => {
                borrow.checked = e.target.checked
                return borrow
            })
        )
    }

    // Uncheck all checkboxes for due books
    const handleUncheckAllDue = () => {
        setDueBooks(
            dueBooks.map(borrow => {
                borrow.checked = false
                return borrow
            })
        )
    }

    // Remove from table after fine is paid
    const handleFinePayment = (payment) => {
        setDuePayments(duePayments.filter(due => due._id !== payment._id))
    }

    // Remove from reservation when book is issued
    const handleIssueBook = (id) => {
        setReservations(reservations.filter(reserve => reserve._id !== id))
    }

    // Remove from due/overdue when book is returned
    const handleReturnBook = (id, dueCount) => {
        if (dueCount <= 0)
            setDueBooks(dueBooks.filter(book => book._id !== id))
        else
            setOverdueBooks(overdueBooks.filter(book => book._id !== id))
    }

    // Add to payment when a book is overdued and fine is not paid
    const handleNewPayment = (payment) => {
        setDuePayments([
            ...duePayments,
            {
                _id: payment._id,
                userid: payment.userid.userid,
                memberType: payment.userid.memberType,
                title: payment.bookid.title,
                isbn: payment.bookid.isbn,
                copyid: payment.copyid,
                days: payment.numOfDays,
                price: payment.pricePerDay,
                date: payment.createdAt
            }
        ])
    }

    return (
        <>
            <Box sx={{ my: 5 }}>
                <Grid container justifyContent="space-evenly">
                    <Grid item xs={5} sm={3} md={2} lg={2} xl={1} className={classes.button}>
                        <IssueBook handleIssueBook={handleIssueBook} />
                    </Grid>
                    <Grid item xs={5} sm={3} md={2} lg={2} xl={1} className={classes.button}>
                        <ReturnBook handleReturnBook={handleReturnBook} handleNewPayment={handleNewPayment} />
                    </Grid>
                </Grid>
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <OverdueBooks overdueBooks={overdueBooks} handleCheck={handleCheck} handleCheckAll={handleCheckAll} handleUncheckAll={handleUncheckAll} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <DueBooks dueBooks={dueBooks} getNewDueBooks={getNewDueBooks} handleCheckDue={handleCheckDue} handleCheckAllDue={handleCheckAllDue} handleUncheckAllDue={handleUncheckAllDue} locale={props.locale} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <DuePayments duePayments={duePayments} handleFinePayment={handleFinePayment} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <Reservations reservations={reservations} />
            </Box>
        </>
    )
}

const useStyles = makeStyles(() => ({
    button: {
        textAlign: 'center'
    }
}))

LibrarianMain.propTypes = {
    locale: PropTypes.string.isRequired
}

export default LibrarianMain