import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
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
    TextField
} from '@material-ui/core'

const AddPost = (props) => {
    const [window, setWindow] = useState(false)
    const { register, handleSubmit, errors, reset } = useForm()
    const { t } = useTranslation()

    const handleToggle = () => {
        setWindow(!window)
    }

    const handleWindowClose = () => {
        setWindow(!window)
        reset()
    }

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
                                    helperText={!!errors.body ? errors.body.message : <>Use <Link href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Markdown</Link> to format text</>}
                                />
                            </form>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={handleWindowClose} color="secondary">
                                {t('close')}
                            </Button>
                            <Button
                                autoFocus
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

export default AddPost