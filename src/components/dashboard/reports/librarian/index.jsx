import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../../../settings/api'
import { Box, Divider } from '@material-ui/core'
import TransactionsReport from './TransactionsReport'
import PaymentsReport from './PaymentsReport'
import BooksReport from './BooksReport'

const LibrarianReports = ({ locale }) => {
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState()
    const [filteredTransactions, setFilteredTransactions] = useState()
    const [filterTransactions, setFilterTransactions] = useState({
        type: 'All',
        status: 'All'
    })
    const [payements, setPayments] = useState()
    const [filteredPayments, setFilteredPayments] = useState()
    const [filterPayment, setFilterPayment] = useState({
        paid: 'All'
    })
    const [books, setBooks] = useState()
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    useEffect(() => {
        const fetchData = async () => {
            const getTransactions = await getTransactionsReport(firstDay, new Date())
            setTransactions(getTransactions)
            setFilteredTransactions(getTransactions)

            const getPayments = await getPaymentsReport(firstDay, new Date())
            setPayments(getPayments)
            setFilteredPayments(getPayments)

            const getBooks = await getBooksReport(firstDay, new Date())
            setBooks(getBooks)

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleTransactionChange = (e) => {
        setFilterTransactions({
            ...filterTransactions,
            [e.target.name]: e.target.value
        })
        handleFilterTransactions(e.target.name, e.target.value)
    }

    const getTransactionsReport = async (from, to) => {
        const getBooks = await axios.post(`${url}/books/transactionsreport`, { from, to }, { withCredentials: true })

        const temp = getBooks.data.map(transaction => {
            return {
                Transaction: transaction.transactionType,
                TransactionID: transaction._id,
                Created: new Date(transaction.createdAt).toLocaleString(),
                Status: transaction.status,
                MemberID: transaction.userid.userid,
                BookTitle: transaction.bookid.title,
                BookISBN: transaction.bookid.isbn,
                BookCopyID: transaction.transactionType === 'Reserve' ? 'null' : transaction.copyid,
                ReservationExpire: transaction.transactionType === 'Reserve' ? new Date(transaction.expireAt).toLocaleString() : 'null',
                ReservationCancelled: transaction.transactionType === 'Reserve' ? transaction.isCancel : 'null',
                HighDemand: transaction.transactionType === 'Reserve' ? 'null' : transaction.isHighDemand,
                Renews: transaction.transactionType === 'Reserve' ? 'null' : transaction.renews,
                Due: transaction.transactionType === 'Reserve' ? 'null' : new Date(transaction.dueDate).toLocaleString(),
                Returned: transaction.transactionType === 'Reserve' ? 'null' : transaction.returnedOn && new Date(transaction.returnedOn).toLocaleString()
            }
        })
        return temp
    }

    const getNewTransactionsReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getBooks = await getTransactionsReport(date[0], date[1])
            setTransactions(getBooks)

            if (filterTransactions.type !== 'All')
                handleFilterTransactions('type', filterTransactions.type)
            else if (filterTransactions.status !== 'All')
                handleFilterTransactions('status', filterTransactions.status)
            else
                setFilteredTransactions(getBooks)
        }
    }

    const handleFilterTransactions = (key, value) => {
        if (key === 'type') {
            if (value !== 'All' && filterTransactions.status !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Transaction === value && record.Status === filterTransactions.status))
            else if (filterTransactions.status !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Status === filterTransactions.status))
            else if (value !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Transaction === value))
            else
                setFilteredTransactions([...transactions])
        }
        if (key === 'status') {
            if (value !== 'All' && filterTransactions.type !== 'All') {
                setFilteredTransactions(transactions.filter((record) => record.Status === value && record.Transaction === filterTransactions.type))
            }
            else if (filterTransactions.type !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Transaction === filterTransactions.type))
            else if (value !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Status === value))
            else
                setFilteredTransactions([...transactions])
        }
    }

    const getPaymentsReport = async (from, to) => {
        const getPayments = await axios.post(`${url}/books/paymentssreport`, { from, to }, { withCredentials: true })

        const temp = getPayments.data.map(payment => {
            return {
                PaymentID: payment._id,
                Created: payment.createdAt,
                Paid: payment.paid,
                MemberID: payment.userid.userid,
                BookTitle: payment.bookid.title,
                BookISBN: payment.bookid.isbn,
                BookCopyID: payment.copyid,
                NumberOfDays: payment.numOfDays,
                PricePerDay: payment.pricePerDay
            }
        })
        return temp
    }

    const getNewPaymentsReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getPayments = await getPaymentsReport(date[0], date[1])
            setPayments(getPayments)

            if (filterPayment.paid !== 'All')
                handleFilterPayments(filterPayment.paid)
            else
                setFilteredPayments(getPayments)
        }
    }

    const handlePayChange = (e) => {
        setFilterPayment({
            ...filterPayment,
            [e.target.name]: e.target.value
        })
        handleFilterPayments(e.target.value)
    }

    const handleFilterPayments = (value) => {
        if (value === 'All')
            setFilteredPayments([...payements])
        else
            if (value === 'Paid')
                setFilteredPayments(payements.filter(record => record.Paid))
            else if (value === 'Unpaid')
                setFilteredPayments(payements.filter(record => !record.Paid))
    }

    const getBooksReport = async (from, to) => {
        const getBooks = await axios.post(`${url}/books/booksreport`, { from, to }, { withCredentials: true })

        const temp = getBooks.data.map(book => {
            let temp = ''

            for (let i = 0; i < book.author.length; i++) {
                temp += book.author[i]
                if (book.author.length - 1 > i)
                    temp += '; '
            }

            return {
                BookID: book._id,
                ISBN: book.isbn,
                Title: book.title.replace(/,/g, '; '),
                Author: temp,
                Publisher: book.publisher.replace(/,/g, '; '),
                PublishedDate: new Date(book.publishedDate).toLocaleDateString(),
                Category: book.category.replace(/,/g, '; '),
                Campus: book.campus === 'rhill' ? 'Rose-Hill Campus' : 'Swami Dayanand Campus',
                Location: book.location.replace(/,/g, '; '),
                NumOfCopies: book.copies.length,
                DateAdded: new Date(book.createdAt).toLocaleDateString(),
            }
        })
        return temp
    }

    const getNewBooksReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getBooks = await getBooksReport(date[0], date[1])
            setBooks(getBooks)
        }
    }

    return (
        <>
            {loading ? null :
                <Box sx={{ my: 5 }}>
                    <TransactionsReport filteredTransactions={filteredTransactions} getNewTransactionsReport={getNewTransactionsReport} handleTransactionChange={handleTransactionChange} filterTransactions={filterTransactions} locale={locale} />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <PaymentsReport filteredPayments={filteredPayments} getNewPaymentsReport={getNewPaymentsReport} handlePayChange={handlePayChange} filterPayment={filterPayment} locale={locale} />
                    <Box sx={{ my: 3 }}>
                        <Divider />
                    </Box>
                    <BooksReport books={books} getNewBooksReport={getNewBooksReport} locale={locale} />
                </Box>
            }
        </>
    )
}

LibrarianReports.propTypes = {
    locale: PropTypes.string.isRequired
}

export default LibrarianReports