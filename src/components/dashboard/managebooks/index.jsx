import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddBook from './AddBook'
import AddBookCSV from './AddBookCSV'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

const ManageBooks = ({ user }) => {
    const navigate = useNavigate()
    const [csv, setCSV] = useState(false)

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
                <Grid container justify="center">
                    {csv ?
                        <Grid item md={10} lg={6}>
                            <AddBook />
                        </Grid>
                        :
                        <Grid item md={10} lg={12}>
                            <AddBookCSV />
                        </Grid>
                    }
                </Grid>
            </Container>
        </>
    )
}

export default ManageBooks