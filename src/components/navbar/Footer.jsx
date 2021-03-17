import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import GitHubIcon from '@material-ui/icons/GitHub'

const Footer = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Box sx={{ py: 2 }} component="footer" className={classes.footer}>
            <Typography variant="body2">Developed by Loïc SE 2.1 2020</Typography>
            <Typography variant="body2"><GitHubIcon /></Typography>
            <Button className={classes.btn} variant="contained" disableRipple disableElevation onClick={handleOpen}>
                Rules & Regulations
            </Button>
            <Button component={Link} to="/blog" className={classes.btn} variant="contained" disableRipple disableElevation>
                Blog
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="rules-and-regulations" maxWidth="sm" fullWidth>
                <DialogTitle id="rules-and-regulations">Rules & Regulations</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>Damaging books whether it is fire or water is not permitted.</Typography>
                    <Typography variant="body2">Failing to follow the above rules and regulations will result in an account suspension.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

const useStyles = makeStyles(theme => ({
    footer: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: 0,
        textAlign: 'center'
    },
    btn: {
        backgroundColor: theme.palette.primary.main,
        '&:hover, &:active': {
            backgroundColor: theme.palette.primary.main,
        }
    }
}))

export default Footer