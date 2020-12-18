import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AddBook from './AddBook'
import AddBookCSV from './AddBookCSV'
import SearchBook from './SearchBook'
import Container from '@material-ui/core/Container'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import axios from 'axios'
import url from '../../../settings/api'

const ManageBooks = ({ user }) => {
    const navigate = useNavigate()
    const [csv, setCSV] = useState(false)
    const [locations, setLocations] = useState({
        pam: {
            options: []
        },
        rhill: {
            options: []
        }
    })

    useEffect(() => {
        axios.get(`${url}/settings/locations`, { withCredentials: true })
            .then(locations => {
                setLocations(locations.data)
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleChange = (e) => {
        setCSV(e.target.checked)
    }

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <Container>
                <FormControlLabel
                    control={<Switch checked={csv} onChange={handleChange} />}
                    label="Manual input"
                />
                {csv ?
                    <AddBook locations={locations} />
                    :
                    <AddBookCSV />
                }
            </Container>
            <SearchBook locations={locations} />
        </>
    )
}

export default ManageBooks