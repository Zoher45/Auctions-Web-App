import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from "@mui/material/IconButton";
import {useState} from "react";
import {getUserByIdApi, getProfilePictureId} from '../Service/UserService';
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";


const theme = createTheme();

const UserProfile = () => {

    const [imageSource, setImageSource] = useState('');

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")

    const navigate = useNavigate()

    React.useEffect(() => {
        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        if (getUser === null) {
            navigate('/');
            return;
        } else {
            if (getUser.token === null || getUser.token === '') {
                navigate('/');
                return;
            }
        }
        getUserByIdApi(getUser.userId, getUser.token)
            .then((response) => {
                setFirstName(response.data.firstName)
                setLastName(response.data.lastName)
                setEmail(response.data.email)
            }, (error) => {
            })

        getProfilePictureId(getUser.userId)
            .then((response) => {
                const userImage = "http://localhost:4941/api/v1/users/" + getUser.userId +"/image"
                setImageSource(userImage)
            }, (error) => {

            })

    }, [])

    const goToEditPage = () => {
        navigate("/editProfile")
    }

        return (
            <ThemeProvider theme={theme}>
                <NavigationBar/>
                <Container component="main" maxWidth="xs">
                    <CssBaseline/>
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h4" sx={{paddingTop: 2, paddingBottom: 2}}>
                            Account Details
                        </Typography>
                        <Grid>
                            <label htmlFor="contained-button-file">
                                <Avatar sx={{m: 2, bgcolor: 'grey', height: 150, width: 150}} alt={""} src={imageSource}/>
                            </label>
                        </Grid>
                        <Card color={"blue"} sx={{width: "200%", height: "100%"}}>
                            <Stack spacing={6} padding={1}>
                                <Stack direction="row" spacing={2} justifyContent={"space-between"} paddingRight={2}>
                                    <Typography variant={"h5"}> First Name:  </Typography>
                                    <Typography variant={"h6"}> {firstName} </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} justifyContent={"space-between"} paddingRight={2}>
                                    <Typography variant={"h5"}> Last Name:  </Typography>
                                    <Typography variant={"h6"}> {lastName} </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} justifyContent={"space-between"} paddingRight={2}>
                                    <Typography variant={"h5"}> Email:  </Typography>
                                    <Typography variant={"h6"}> {email} </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} justifyContent={"center"} paddingRight={2}>
                                    <Button variant="contained" onClick={() => goToEditPage()}> Edit Information </Button>
                                </Stack>

                            </Stack>

                        </Card>
                    </Box>
                </Container>
            </ThemeProvider>
        );
    }
export default UserProfile;