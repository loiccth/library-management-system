import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useNavigate } from 'react-router-dom'
import LibraryHours from './LibraryHours'
import Container from '@material-ui/core/Container'

const Settings = ({ user }) => {
    const navigate = useNavigate()
    const [hours, setHours] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${url}/settings/hours`, { withCredentials: true })
            .then(result => {
                setHours({
                    opening: result.data.opening.options,
                    closing: result.data.closing.options
                })
                setLoading(false)
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            {loading ? null :
                <Container>
                    <LibraryHours hours={hours} />
                </Container>
            }
        </>
    )
}

export default Settings