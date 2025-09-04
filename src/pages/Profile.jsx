import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
  CameraAlt as CameraIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import axiosInstance from "../axiosInstance";

const Profile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState('');
  const [message, setMessage] = useState({ type: "", text: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const userId = useSelector((state) => state.auth.user.id);
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    post: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    isTwoFactor: false,
  });

  const getUser = async () => {
    try {
      const res = await axiosInstance.get(`/auth/getme/${userId}`);
      setUser(res.data.user);
      setFormData((prev) => ({
        ...prev,
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        phone: res.data.user.phone || "",
        address: res.data.user.address || "",
        post: res.data.user.post || "",
        isTwoFactor: res.data.user.isTwoFactor || false,
      }));
    } catch (error) {
      console.log(error);
      showMessage("error", "Failed to load user data");
    }
  };

  useEffect(() => {
    getUser();
  }, [userId]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 3000);
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.put(`/auth/update/${userId}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        post: formData.post,
      });

      if (res.data.success) {
        showMessage("success", "Personal information updated successfully");
        getUser(); // Refresh user data
      }
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update personal information"
      );
    } finally {
      setLoading(false);
       getUser();
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const data = {
      oldpassword: formData.currentPassword,
      newpassword: formData.newPassword,
    };
    console.log(data);
    
    try {
      const res = await axiosInstance.put(`/auth/update/${userId}`, data);
      console.log(res);

      if (res.status === 200) {
        showMessage("success", "Password updated successfully");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update password"
      );
    } finally {
      setLoading(false);
       getUser();
    }
  };

  const handleTwoFactorToggle = async () => {
    setLoading("TwoFactor")
    const newValue = !formData.isTwoFactor;
    try {
      const res = await axiosInstance.put(`/auth/update/${userId}`, {
        isTwoFactor: newValue,
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, isTwoFactor: newValue }));
        showMessage(
          "success",
          `Two-factor authentication ${newValue ? "enabled" : "disabled"}`
        );
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to update two-factor authentication");
    } finally {
      getUser();
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDatas = new FormData();
    formDatas.append("image", file);

    try {
      const res = await axiosInstance.put(`/auth/update/${userId}`, formDatas, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res);

      if (res.status === 200) {
        showMessage("success", "Profile image updated successfully");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to upload image");
    } finally {
      getUser();
    }
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
      <div className=" mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative">
                <Avatar
                  sx={{ width: 100, height: 100, border: "3px solid white" }}
                  src={user?.image?.url}
                  alt="Profile"
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="icon-button-file">
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "white",
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                    size="small"
                    component="span"
                  >
                    <CameraIcon sx={{ color: "blue.500" }} />
                  </IconButton>
                </label>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="flex items-center justify-center md:justify-start mt-1">
                  <WorkIcon sx={{ fontSize: 18, marginRight: 0.5 }} />
                  {user?.post || "No position set"}
                </p>
                <p className="flex items-center justify-center md:justify-start mt-1">
                  <LocationIcon sx={{ fontSize: 18, marginRight: 0.5 }} />
                  {user?.address || "No address set"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information Fieldset */}
        <Card className="mb-6">
          <CardContent>
            <Box className="flex items-center mb-4">
              <PersonIcon color="primary" className="mr-2" />
              <Typography variant="h6" component="h2">
                Personal Information
              </Typography>
            </Box>
            <Divider className="mb-4" />

            <form onSubmit={handlePersonalInfoSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Position"
                  name="post"
                  value={formData.post}
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  className="md:col-span-2"
                />
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {loading ? "Saving..." : "Save Personal Information"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Fieldset */}
        <Card className="mb-6">
          <CardContent>
            <Box className="flex items-center mb-4">
              <LockIcon color="primary" className="mr-2" />
              <Typography variant="h6" component="h2">
                Change Password
              </Typography>
            </Box>
            <Divider className="mb-4" />

            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4 max-w-lg mx-auto mt-5">
                <TextField
                  fullWidth
                  sx={{ mb: 2 }}
                  label="Current Password"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  sx={{ mb: 2 }}
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowNewPassword}>
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  sx={{ mb: 2 }}
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowConfirmPassword}>
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <div className="flex justify-end mt-6">
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Fieldset */}
        <Card className="mb-6">
          <CardContent>
            <Box className="flex items-center mb-4">
              <SecurityIcon color="primary" className="mr-2" />
              <Typography variant="h6" component="h2">
                Security Settings
              </Typography>
            </Box>
            <Divider className="mb-4" />

            <div className="space-y-6 mt-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isTwoFactor}
                    onChange={handleTwoFactorToggle}
                    color="primary"
                  />
                }
                label="Two-Factor Authentication"
              />
              {formData.isTwoFactor ? (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="mt-2"
                >
                  🔐 Two-Factor Authentication is <b>enabled</b>. Next time you
                  login, an <b>OTP will be sent to your registered email</b> for
                  verification.
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="mt-2"
                >
                  Enhance your account's security by enabling Two-Factor
                  Authentication. You’ll need to verify your identity using an
                  OTP sent to your email when signing in.
                </Typography>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTwoFactorToggle}
                  disabled={loading}
                >
                  {formData.isTwoFactor ? "Disable" : "Enable"} Two-Factor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snackbar for messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={message.type} onClose={() => setSnackbarOpen(false)}>
            {message.text}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Profile;
