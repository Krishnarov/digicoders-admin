import React, { useState, useEffect } from 'react';
import axios from "../axiosInstance";
import { Card, Checkbox, Button, message, Spin } from 'antd';

const PermissionManager = ({ employeeId }) => {
    const [permissions, setPermissions] = useState({});
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPermissions();
        fetchEmployeePermissions();
    }, [employeeId]);

    const fetchPermissions = async () => {
        try {
            const response = await axios.get('/permissions/all');
            setPermissions(response.data.data);

        } catch (error) {
            message.error('Failed to fetch permissions');
        }
    };

    const fetchEmployeePermissions = async () => {
        try {
            const response = await axios.get(`/permissions/employee/${employeeId}`);
            const empPerms = response.data.data.permissions || [];
            setSelectedPermissions(empPerms.map(p => p._id));


        } catch (error) {
            message.error('Failed to fetch employee permissions');
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await axios.post('/permissions/assign', {
                employeeId,
                permissionIds: selectedPermissions
            });
            message.success('Permissions updated successfully');
        } catch (error) {
            message.error('Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    // if (Object.keys(permissions).length === 0) {
    //     return <Spin />;
    // }

    return (
        <Card title="Manage Permissions" extra={
            <Button type="primary" onClick={handleSave} loading={loading}>
                Save Permissions
            </Button>
        }>
            {Object.entries(permissions).map(([category, categoryPermissions]) => (
                <div key={category} style={{ marginBottom: 24 }}>
                    <h3>{category.toUpperCase()}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        {categoryPermissions.map(permission => (
                            <Card key={permission._id} size="small" style={{ width: 200 }}>
                                <Checkbox
                                    checked={selectedPermissions.includes(permission._id)}
                                    onChange={() => handlePermissionToggle(permission._id)}
                                >
                                    {permission.name.replace('_', ' ')}
                                </Checkbox>
                                <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                                    {permission.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </Card>
    );
};

export default PermissionManager;