import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import AdminWelcomeCard from '../../components/AdminWelcomeCard';
import { apiUrl } from '../../utils/Constants';
import { toast } from 'react-toastify';
import authAxios from '../../utils/authAxios';
import Loader from '../../components/Loader/Loader';
import validator from 'validator';
import Cookies from 'js-cookie';

const TeacherMNG = () => {
  const [notices, setNotices] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const [createTeacherFormData, setTeacherFormData] = useState({
    regNo: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    dob: '',
    contactNo: '',
    gender: '',
  });

  const [updateFormData, setUpdateFormData] = useState({
    regNo: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    dob: '',
    contactNo: '',
    gender: '',
  });

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const userRole = Cookies.get('userRole');


  const handleCreateChange = (field, value) => {
    setTeacherFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleChange = (field, value) => {
    setUpdateFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleAddTeacher = () => {
    setOpen(true);
  };

  const handleUpdateTeacher = (row) => {
    setUpdateFormData({
      regNo: row.regNo,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      password: row.password,
      address: row.address,
      dob: row.dob,
      contactNo: row.contactNo,
      gender: row.gender,
    });
    setOpen2(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

  const refreshPage = () => {
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/admin/get-all-teachers`);
        const data = await response.json();
        console.log(data);
        setNotices(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [refresh]);

  const handleTeacherSubmit = async () => {
    try {
      if (!validator.isEmail(createTeacherFormData.email)) {
        throw Error('Email should be valid email')
      }
      const result = await fetch(`${apiUrl}/admin/create-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createTeacherFormData),
      });
      const data = await result.json();

      if (result.ok) {
        console.log('Teacher created successfully:', data);
        toast.success(data.message);
        refreshPage();
        setOpen(false);
        handleClose();
      } else {
        console.error('Error creating teacher:', data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      toast.error('An error occurred while creating the teacher.');
    }
  };

  const handleDeleteTeacher = async (email) => {
    try {
      const result = await authAxios.delete(`${apiUrl}/admin/delete-teacher/${email}`);

      if (result) {
        toast.warning('Account Deleted Successfully');
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      refreshPage();
    }
  };

  const handleUpdate = async (email) => {
    try {
      const result = await authAxios.put(`${apiUrl}/admin/update-teacher/${email}`, updateFormData);

      if (result) {
        toast.success('Account Details Updated');
        handleClose2();
      }
      refreshPage();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <AdminWelcomeCard />
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2em' }}>Manage Teachers</h1>
      </div>

      <Button variant="contained" onClick={handleAddTeacher}>
        Add New Teacher
      </Button>

      <Dialog open={open} onClose={handleClose} sx={{ border: '2px solid #ccc' }}>
        <DialogTitle sx={{ textAlign: 'center' }}>Add New Teacher</DialogTitle>
        <DialogContent>
          <DialogContentText>Fill out the form below to add a new Teacher.</DialogContentText>

          <div>

            <TextField
              required
              id="outlined-required"
              label="First Name"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => handleCreateChange('firstName', e.target.value)}
              value={createTeacherFormData.firstName}
            />

            <TextField
              required
              id="outlined-required"
              label="Last Name"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => handleCreateChange('lastName', e.target.value)}
              value={createTeacherFormData.lastName}
            />

            <TextField
              required
              id="outlined-required"
              type='date'
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => handleCreateChange('dob', e.target.value)}
              value={createTeacherFormData.dob}
            />

            <TextField
              required
              id="outlined-required"
              label="Contact No"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => handleCreateChange('contactNo', e.target.value)}
              value={createTeacherFormData.contactNo}
            />

            <TextField
              required
              id="outlined-password-input"
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => handleCreateChange('email', e.target.value)}
              value={createTeacherFormData.email}
            />
            <p className='text-xs'>Password should contain a letter and charracters ex: test1234</p>
            <TextField
              InputLabelProps={'Password should contain a letter and charracters ex: test1234'}
              required
              id="outlined-password-input"
              label="Password"
              fullWidth
              margin="normal"
              variant="outlined"
              error={!passwordPattern.test(createTeacherFormData.password)}
              onChange={(e) => handleCreateChange('password', e.target.value)}
              value={createTeacherFormData.password}
            />

            <TextField
              required
              id="outlined-required"
              label="Address"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => handleCreateChange('address', e.target.value)}
              value={createTeacherFormData.address}
              multiline  // Set multiline to true
              rows={4}
            />

            <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={createTeacherFormData.gender}
              onChange={(e) => handleCreateChange('gender', e.target.value)}
            >
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
            </RadioGroup>

          </div>
          <DialogActions style={{ justifyContent: 'center' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleTeacherSubmit} variant="contained" color="primary">
              Add Teacher
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>


      {/*Table of All teacher details starts here...*/}
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Date Of Birth</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {!isLoading ? <TableBody>
            {notices.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.regNo}</TableCell>
                <TableCell>{row.firstName}</TableCell>
                <TableCell>{row.lastName}</TableCell>
                <TableCell>{row.gender}</TableCell>
                <TableCell>{row.contactNo}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.ownedClass ? row.ownedClass?.grade + "/"+row.ownedClass?.subClass : 'Not Assigned' }</TableCell>
                <TableCell>{row.ownedSubjects ? row.ownedSubjects.map((sub)=>(
                  <h5>{sub.subName}</h5>
                )) : 'N/A' }</TableCell>

                <TableCell>{new Date(row.dob).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small"
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUpdateTeacher(row)}
                    sx={{ marginRight: 2 }}
                  >
                    Update
                  </Button>

                  <Dialog open={open2} onClose={handleClose2} sx={{ border: '2px solid #ccc' }}>
                    <DialogTitle sx={{ textAlign: 'center' }}>Update {updateFormData.regNo}: {updateFormData.firstName} {updateFormData.lastName}</DialogTitle>
                    <DialogContent>
                      <DialogContentText>Fill out the form below to Update Teacher.</DialogContentText>
                      <div>

                        <TextField
                          id="outlined-read-only-input"
                          label="Teacher ID"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => handleChange('regNo', e.target.value)}
                          value={updateFormData.regNo}
                          disabled
                        />

                        <TextField
                          required
                          id="outlined-required"
                          label="First Name"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          value={updateFormData.firstName}
                        />

                        <TextField
                          required
                          id="outlined-required"
                          label="Last Name"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          value={updateFormData.lastName}
                        />

                        <TextField
                          required
                          id="outlined-required"
                          label="Contact No"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => handleChange('contactNo', e.target.value)}
                          value={updateFormData.contactNo}
                        />

                        <TextField
                          required
                          id="outlined-password-input"
                          label="Email"
                          type="email"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => handleChange('email', e.target.value)}
                          value={updateFormData.email}
                          disabled
                        />

                        <TextField
                          required
                          id="outlined-required"
                          label="Address"
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          onChange={(e) => handleChange('address', e.target.value)}
                          value={updateFormData.address}
                          multiline  // Set multiline to true
                          rows={4}
                        />

                      </div>
                      <DialogActions style={{ justifyContent: 'center' }}>
                        <Button onClick={() => handleUpdate(updateFormData.email)} variant="contained" color="primary">
                          Update
                        </Button>
                        <Button onClick={handleClose2}>Cancel</Button>
                      </DialogActions>
                    </DialogContent>
                  </Dialog>

                  {userRole !== 'support' && (
                    <Button size="small" variant="contained" color="error" onClick={() => handleDeleteTeacher(row.email)}>
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} align="right">
                <strong>Total number of Teachers:</strong>
              </TableCell>
              <TableCell align="center">
                <strong>{notices.length}</strong>
              </TableCell>
            </TableRow>
          </TableBody> : <Loader />
          }
        </Table>
      </TableContainer>
    </div>
  );
};

export default TeacherMNG;