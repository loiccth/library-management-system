import React from 'react'
import PropTypes from 'prop-types'
import { Box, Divider } from '@material-ui/core'
import TransactionsReport from './TransactionsReport'
import PaymentsReport from './PaymentsReport'
import BooksReport from './BooksReport'

const LibrarianReports = ({ locale }) => {
    return (
        <>
            <Box sx={{ my: 5 }}>
                <TransactionsReport locale={locale} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <PaymentsReport locale={locale} />
                <Box sx={{ my: 3 }}>
                    <Divider />
                </Box>
                <BooksReport locale={locale} />
            </Box>
        </>
    )
}

LibrarianReports.propTypes = {
    locale: PropTypes.string.isRequired
}

export default LibrarianReports