import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AddBook from './AddBook'
import AddBookCSV from './AddBookCSV'
import SearchBook from './SearchBook'
import Divider from '@material-ui/core/Divider'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import axios from 'axios'
import url from '../../../settings/api'

const ManageBooks = ({ user }) => {
    const navigate = useNavigate()
    const [options, setOptions] = useState({
        csv: false,
        api: true
    })
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
        setOptions({
            ...options,
            [e.target.name]: e.target.checked
        })
    }

    if (user.memberType !== 'Librarian') {
        navigate('/dashboard', { replace: true })
    }

    return (
        <>
            <Box sx={{ my: 5 }}>
                <Container>
                    <Toolbar>
                        <Typography variant="h6">Add Book(s)</Typography>
                    </Toolbar>
                    <FormControlLabel
                        control={<Switch name="csv" checked={options.csv} onChange={handleChange} />}
                        label="Manual input"
                    />
                    {options.csv &&
                        <FormControlLabel
                            control={<Switch name="api" checked={options.api} onChange={handleChange} />}
                            label="Auto fill book details"
                        />
                    }
                </Container>
                {options.csv ?
                    <AddBook locations={locations} api={options.api} />
                    :
                    <AddBookCSV />
                }
                <Box sx={{ my: 7 }}>
                    <Divider />
                </Box>
                <SearchBook locations={locations} />
            </Box>
        </>
    )
}

export default ManageBooks