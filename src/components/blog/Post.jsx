import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import marked from 'marked'
import dompurify from 'dompurify'
import {
    Button,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    IconButton,
    makeStyles,
    Paper,
    Typography,
    useTheme
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import EditPost from './EditPost'

const Post = ({ post, user, handleDeletePost, handleEditPost }) => {
    const classes = useStyles()
    const [window, setWindow] = useState(false)
    const [edit, setEdit] = useState(false)
    const { t } = useTranslation()
    const sanitizer = dompurify.sanitize
    const theme = useTheme()

    // Close pop up window
    const handleToggle = () => {
        setWindow(!window)
    }

    // Call api to delete post
    const handleDelete = (id) => {
        setWindow(!window)
        axios.delete(`${url}/posts/${id}`, { withCredentials: true })
            .then(result => {
                handleDeletePost(result.data)
            })
            .catch(err => {
                handleDeletePost(err.response.data)
            })
    }

    // Open pop up window for editing post
    const handleEditToggle = () => {
        setEdit(!edit)
    }

    // Submit edited post
    const handleEdit = (result) => {
        handleEditPost(result)
        setEdit(!edit)
    }

    return (
        <>
            <Paper className={classes.container}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="h6">{post.title}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Typography variant="caption" display="block">{t('postedBy')} {post.userid.userid}</Typography>
                                <Typography variant="caption" display="block">{t('date')} {new Date(post.createdAt).toLocaleDateString()}</Typography>
                                {user.isLoggedIn && (user.memberType === 'Librarian' || user.memberType === 'Admin') &&
                                    <>
                                        <IconButton onClick={handleEditToggle}><EditIcon /></IconButton>
                                        <EditPost post={post} edit={edit} handleEditToggle={handleEditToggle} handleEdit={handleEdit} />
                                        <IconButton onClick={handleToggle}><DeleteIcon /></IconButton>
                                        <Dialog
                                            open={window}
                                            onClose={handleToggle}
                                            style={{ direction: theme.direction }}
                                        >
                                            <DialogContent>
                                                <DialogContentText>
                                                    {t('deleteMsg')}
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button variant="contained" onClick={handleToggle} color="secondary">
                                                    {t('cancel')}
                                                </Button>
                                                <Button variant="contained" onClick={() => handleDelete(post._id)} autoFocus>
                                                    {t('delete')}
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }}>
                            <div dangerouslySetInnerHTML={{ __html: sanitizer(marked(post.body)) }}></div>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    container: {
        padding: theme.spacing(2)
    }
}))

Post.propTypes = {
    user: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    handleDeletePost: PropTypes.func.isRequired,
    handleEditPost: PropTypes.func.isRequired,
}

export default Post