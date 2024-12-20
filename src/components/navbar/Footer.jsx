import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Link as MuiLink,
    Typography,
    useTheme
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import GitHubIcon from '@material-ui/icons/GitHub'

const Footer = (props) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const theme = useTheme()

    // Open pop up window for rules and regulations
    const handleOpen = () => {
        setOpen(true)
    }

    // Close pop up window for rules and regulations
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Box sx={{ py: 2 }} component="footer" className={classes.footer}>
            <Typography variant="body2">{t('develop')} Loïc SE 2.1 2020 - 2021</Typography>
            <Typography variant="body2">{t('contribute')}</Typography>
            <Typography variant="body2" style={{ marginTop: '5px' }}>
                <MuiLink href="https://github.com/loiccth/library-system" target="_blank" rel="noreferrer" color="inherit" style={{ outline: 'none' }}><GitHubIcon /></MuiLink>
            </Typography>
            <Button className={classes.btn} variant="contained" disableRipple disableElevation onClick={handleOpen}>
                {t('rules')}
            </Button>
            <Button component={Link} to="/blog" className={classes.btn} variant="contained" disableRipple disableElevation>
                {t('blog')}
            </Button>
            <Button component={Link} to="/info" className={classes.btn} variant="contained" disableRipple disableElevation>
                {t('information')}
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth style={{ direction: theme.direction }}>
                <DialogTitle id="rules-and-regulations">{t('rules')}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>{t('rulesParagraph')}</Typography>
                    <Typography variant="body2">{t('rulesParagraph2')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" onClick={handleClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

const useStyles = makeStyles(theme => ({
    footer: {
        backgroundColor: theme.palette.custom.main,
        borderRadius: 0,
        textAlign: 'center'
    },
    btn: {
        color: theme.palette.custom.contrastText,
        backgroundColor: theme.palette.custom.main,
        '&:hover, &:active': {
            backgroundColor: theme.palette.custom.main,
        }
    }
}))

Footer.propTypes = {
    darkMode: PropTypes.bool.isRequired
}

export default Footer