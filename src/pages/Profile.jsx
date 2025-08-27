import React, { useState } from 'react';
import {
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  Box,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
  CameraAlt as CameraIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative">
              <Avatar
                sx={{ width: 100, height: 100, border: '3px solid white' }}
                src="/path/to/avatar.jpg"
                alt="Profile"
              >
                JD
              </Avatar>
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                size="small"
              >
                <CameraIcon sx={{ color: 'blue.500' }} />
              </IconButton>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="flex items-center justify-center md:justify-start mt-1">
                <WorkIcon sx={{ fontSize: 18, marginRight: 0.5 }} />
                Software Developer
              </p>
              <p className="flex items-center justify-center md:justify-start mt-1">
                <LocationIcon sx={{ fontSize: 18, marginRight: 0.5 }} />
                San Francisco, CA
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-auto">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'white',
                  color: 'blue.600',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                startIcon={<EditIcon />}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab icon={<PersonIcon />} label="Personal Info" />
            <Tab icon={<LockIcon />} label="Change Password" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Security" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <div className="p-6">
          {tabValue === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                fullWidth
                label="First Name"
                defaultValue="John"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                defaultValue="Doe"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Email"
                defaultValue="john.doe@example.com"
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
                defaultValue="+1 (555) 123-4567"
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
                label="Date of Birth"
                defaultValue="January 15, 1990"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Address"
                defaultValue="123 Main St, San Francisco, CA"
                multiline
                rows={2}
              />
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button variant="contained" color="primary">
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {tabValue === 1 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
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
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
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
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowConfirmPassword}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <div className="flex justify-end mt-6">
                <Button variant="contained" color="primary">
                  Update Password
                </Button>
              </div>
            </div>
          )}

          {tabValue === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    color="primary"
                  />
                }
                label="Enable Email Notifications"
              />
              <FormControlLabel
                control={<Switch color="primary" defaultChecked />}
                label="Product Updates"
              />
              <FormControlLabel
                control={<Switch color="primary" defaultChecked />}
                label="Security Alerts"
              />
              <FormControlLabel
                control={<Switch color="primary" />}
                label="Marketing Promotions"
              />
              <div className="flex justify-end mt-6">
                <Button variant="contained" color="primary">
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {tabValue === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Security Settings</h3>
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorEnabled}
                    onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    color="primary"
                  />
                }
                label="Two-Factor Authentication"
              />
              <p className="text-sm text-gray-500">
                Enhance your account's security by enabling two-factor authentication.
              </p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Active Sessions</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-gray-500">San Francisco, CA • Last active: 2 hours ago</p>
                    </div>
                    <Button color="error" size="small">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="contained" color="primary">
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;