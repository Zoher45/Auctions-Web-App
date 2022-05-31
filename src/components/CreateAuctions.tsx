import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {Alert, FormControl, InputLabel, Select, Stack} from "@mui/material";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";
import MenuItem from "@mui/material/MenuItem";
import {
    AllCategoryApi,
    CreateAuctionApi,
    GetAuctionByIdApi,
    UpdateAuctionApi,
    UploadAuctionImageApi
} from "../Service/AuctionsService";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";


const theme = createTheme();

const mimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

const CreateAuction = () => {

    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [title, setTitle] = useState('')
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState<any | null>(null);


    const [categoryList, setCategoryList] = React.useState<Array<category>>([{categoryId:0, name:""}])
    const navigate = useNavigate()

    React.useEffect(() => {

        AllCategoryApi()
            .then((response) => {
                setCategoryList(response.data);
            }, (error) => {
            })
        let getUser: AuthenticationCookie;
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        if (getUser !== null) {
            if (getUser.token === null || getUser.token ==="" ) {
                        navigate('/');
            }
        } else { navigate('/')}
    }, [])

    const [imageSource, setImageSource] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);

    const updateDisplayPicture = async (event: any) => {
        const uploadPicture = event.target.files[0]
        setProfilePicture(uploadPicture)
        if (uploadPicture === undefined) {
            setImageSource("");
            return;
        }
        if (!mimeTypes.includes(uploadPicture.type)) {
            setImageSource("");
            return;
        }
        const imageSource = URL.createObjectURL(uploadPicture)
        setImageSource(imageSource)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const reserve = formData.get('reserve')



        if (title.trim().length === 0 || description.trim().length === 0 || category === null) {
            setErrorFlag(true);
            setErrorMessage("Please enter a value in the required field (*)")
            return
        }

        if (reserve !== null && parseInt(reserve.toString(),10) < 0) {
            setErrorFlag(true)
            setErrorMessage("Reserve must be a at least $1")
            return
        }

        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)

        let data



        if(reserve !== null) {
            if (reserve === "") {
                data = {
                    "title": title,
                    "description": description,
                    "endDate": endDate,
                    "categoryId": category,
                    "reserve": 0
                }
            } else {
                data = {
                    "title": title,
                    "description": description,
                    "endDate": endDate,
                    "categoryId": category,
                    "reserve": parseInt(reserve.toString(), 10)

                }
            }

        }

        CreateAuctionApi(getUser.token, data)
            .then((response) => {
                if (profilePicture !== null && profilePicture !== undefined) {

                    UploadAuctionImageApi(profilePicture, response.data.auctionId, getUser.token)
                        .then((response) => {
                            alert("Auction has been Created")
                            navigate('/myAuction')
                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.response.statusText)
                        })
                }

            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText)
            })

    }


    return (
        <ThemeProvider theme={theme}>
            <NavigationBar/>
            <Container component="form" onSubmit={handleSubmit}  maxWidth={'md'} style={{paddingBottom:50}}>
                <Typography component="h1" variant="h4" sx ={{paddingTop: 5}}>
                    Create Auction Page
                </Typography>

                {errorFlag ? <Alert onClose={() => {setErrorFlag(false)}} severity={'error'}>  {errorMessage}</Alert> : <></>}

                <Card sx={{ marginTop: 8, border: 1, padding: 1}}
                >

                    <Box
                        component={"img"}
                        sx={{
                            height: 300,
                            width: 300,
                            objectFit: 'contain'
                        }}
                        src={imageSource}
                    />

                    <Stack direction={'column'} padding={1} spacing={2}>
                        <CardMedia
                            component="img"
                            sx={{height: '50%',
                                width: '50%',
                                objectFit: 'fill',
                            }}

                        />
                        <input
                            accept=".jpg,.jpeg,.png,.gif"
                            id='fileInput'
                            required
                            multiple
                            type="file"
                            onChange={async (event) => await updateDisplayPicture(event)}
                        />
                        <TextField
                            autoComplete="given-name"
                            required
                            name="title"
                            fullWidth
                            id="title"
                            label="Edit Title"
                            onChange={(e)=> setTitle(e.target.value)}
                        />

                        <FormControl required>
                            <InputLabel > Select Category: </InputLabel>
                            <Select id={"category"} defaultValue={""}>
                                {categoryList.map((eachCategory) => (
                                        <MenuItem key={eachCategory.categoryId} value={eachCategory.name} onClick={() => setCategory(eachCategory.categoryId)}>
                                            {eachCategory.name}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>


                        <TextField
                            required
                            type={"datetime-local"}
                            label={"End Date"}
                            name="endDate"
                            id="endDate"
                            value={endDate}
                            InputLabelProps={{shrink: true}}
                            onChange={(e)=> setEndDate(e.target.value)}
                        />

                        <TextField
                            autoComplete="given-name"
                            required
                            name="description"
                            fullWidth
                            id="description"
                            multiline
                            label="Edit Description"
                            value={description}
                            rows={6}
                            onChange={(e)=> setDescription(e.target.value)}
                        />

                        <TextField
                            autoComplete="given-name"
                            name="reserve"
                            fullWidth
                            id="reserve"
                            label="Edit Reserve ($)"
                            type={'number'}
                            InputProps={{ inputProps: { min: 0 } }}
                        />


                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            type={"submit"}
                        >
                            Create Auction
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color={"error"}
                            onClick={() => navigate('/myAuction')}
                        >
                            Cancel
                        </Button>
                    </Stack>


                </Card>
            </Container>
        </ThemeProvider>
    )

}
export default CreateAuction;