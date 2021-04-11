import React from 'react'
import PropTypes from 'prop-types'
import { Box, Divider } from '@material-ui/core'
import RequestBooks from './RequestBooks'
import BorrowedBooks from './BorrowedBooks'
import ReservedBooks from './ReservedBooks'

const MyBooks = (props) => {
    return (
        <>
            <Box sx={{ my: 5 }}>
                {props.user.memberType === 'MemberA' &&
                    <>
                        <RequestBooks />
                        <Box sx={{ my: 3 }}>
                            <Divider />
                        </Box>
                    </>
                }
                <BorrowedBooks />
                <Box sx={{ my: 7 }}>
                    <Divider />
                </Box>
                <ReservedBooks />
            </Box>
        </>
    )
}

MyBooks.propTypes = {
    user: PropTypes.object.isRequired
}

export default MyBooks