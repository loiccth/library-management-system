import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Link,
    TextField,
    useTheme
} from '@material-ui/core'

const AddPost = (props) => {
    const [window, setWindow] = useState(false)
    const { register, handleSubmit, errors, reset } = useForm()
    const { t } = useTranslation()
    const theme = useTheme()

    // Open pop up window
    const handleToggle = () => {
        setWindow(!window)
    }

    // Close pop up window and reset all data in fields
    const handleWindowClose = () => {
        setWindow(!window)
        reset()
    }

    // Submit form call api to add post
    const onSubmit = (data) => {
        axios.post(`${url}/posts`, data, { withCredentials: true })
            .then(result => {
                props.handleAddPost(result.data)
            })
            .catch(err => {
                props.handleAddPost(err.response.data)
            })
            .finally(() => {
                setWindow(false)
                reset()
            })
    }

    return (
        <>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Button variant="contained" onClick={handleToggle}>{t('addPost')}</Button>
                    <Dialog
                        maxWidth="sm"
                        fullWidth
                        open={window}
                        onClose={handleWindowClose}
                        style={{ direction: theme.direction }}
                    >
                        <DialogTitle>
                            {t('addPostTitle')}
                        </DialogTitle>
                        <DialogContent>
                            <form onSubmit={handleSubmit(onSubmit)} id="add-post" noValidate>
                                <TextField
                                    autoFocus
                                    required
                                    autoComplete="off"
                                    id="title"
                                    name="title"
                                    label={t('title')}
                                    fullWidth
                                    variant="standard"
                                    inputRef={register({ required: t('requiredField') })}
                                    error={!!errors.title}
                                    helperText={!!errors.title ? errors.title.message : " "}
                                />
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    margin="normal"
                                    required
                                    error={!!errors.body}
                                    id="body"
                                    name="body"
                                    label={t('body')}
                                    multiline
                                    minRows={5}
                                    inputRef={register({ required: t('requiredField') })}
                                    helperText={!!errors.body ? errors.body.message : <>{t('use')} <Link href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Markdown</Link> {t('markdown')}</>}
                                />
                            </form>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={handleWindowClose} color="secondary">
                                {t('close')}
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                form="add-post"
                            >
                                {t('post')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
        </>
    )
}

AddPost.propTypes = {
    handleAddPost: PropTypes.func.isRequired,
}

export default AddPost