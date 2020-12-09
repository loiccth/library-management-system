import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const Footer = (props) => {
    const classes = useStyles()

    return (
        <Paper component="footer" style={props.style} className={classes.footer}>
            <div>hey guys :) whats up!</div>
        </Paper>
    )
}

const useStyles = makeStyles((theme) => ({
    footer: {
        backgroundColor: theme.palette.secondary.main,
        borderRadius: 0
    }
}))

export default Footer