import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import GitHubIcon from '@material-ui/icons/GitHub'

const Footer = () => {
    const classes = useStyles()

    return (
        <Box sx={{ py: 2 }} component="footer" className={classes.footer}>
            <Typography variant="body2">Developed by Loïc SE 2.1 2020</Typography>
            <Typography variant="body2"><GitHubIcon /></Typography>
        </Box>
    )
}

const useStyles = makeStyles(theme => ({
    footer: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: 0,
        textAlign: 'center'
    }
}))

export default Footer