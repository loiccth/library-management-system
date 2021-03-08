import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { DropzoneArea } from 'material-ui-dropzone'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'

const RegisterMemberCSV = () => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { handleSubmit, errors, reset, control } = useForm()

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        const dataForm = new FormData()
        dataForm.append('csv', data.csv[0])
        axios.post(`${url}/users/register_csv`, dataForm, { withCredentials: true })
            .then(result => console.log(result))
        reset()

        // TODO: display list of registered user and errors
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={10} md={10}>
                        <Paper className={classes.paper}>
                            <form className={classes.root} noValidate onSubmit={handleSubmit(onSubmit)}>
                                <Controller
                                    as={<DropzoneArea
                                        acceptedFiles={[".csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values"]}
                                        filesLimit={1}
                                        dropzoneText="Drag and drop a CSV file here or browse"
                                        showPreviews={true}
                                        showPreviewsInDropzone={false}
                                        useChipsForPreview
                                        previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                                        previewChipProps={{ classes: { root: classes.previewChip } }}
                                        previewText="Selected CSV file"
                                        maxFileSize={10485760}
                                    />}
                                    name="csv"
                                    control={control}
                                    rules={{ validate: value => value.length > 0 }}
                                    defaultValue={[]}
                                />
                                <FormHelperText error children={!!errors.csv ? "CSV file required." : ""} />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                >Register members</Button>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    previewChip: {
        minWidth: 160,
        maxWidth: 210,
    }
}))

export default RegisterMemberCSV