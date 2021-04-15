import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Container,
    Grid,
    makeStyles,
    Toolbar,
    Typography
} from '@material-ui/core'

const RecommendedBooks = () => {
    const classes = useStyles()
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const { t } = useTranslation()

    useEffect(() => {
        axios.get(`${url}/books/recommended`, { withCredentials: true })
            .then(res => setBooks(res.data))
    }, [])

    return (
        <>
            {books.length === 0 ? null :
                <>
                    <Container>
                        <Toolbar>
                            <Typography variant="h6">{t('recommendedBooks')}</Typography>
                        </Toolbar>
                    </Container>
                    <Box sx={{ mt: 3 }}></Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <Box sx={{ pb: 3 }} className={classes.container}>
                            <Grid container justifyContent="center">
                                <Grid item xs={12} md={10}>
                                    <Grid container justifyContent="space-evenly">
                                        {books.map(book => (
                                            <Grid item key={book._id} xs={2} md={2} lg={2} xl={2}>
                                                <Card style={{ height: '100%' }}>
                                                    <CardActionArea style={{ height: '100%' }} onClick={() => navigate(`/book/${book._id}`)}>
                                                        <CardMedia
                                                            component="img"
                                                            className={classes.media}
                                                            image={book.thumbnail}
                                                            title={book.title}
                                                        />
                                                        <CardContent>
                                                            <Typography gutterBottom variant="body1">{book.title}</Typography>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </>
            }
        </>
    )
}

const useStyles = makeStyles({
    media: {
        height: 240,
    },
    container: {
        minWidth: 850
    }
})

export default RecommendedBooks