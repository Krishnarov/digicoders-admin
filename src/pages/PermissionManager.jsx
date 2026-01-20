import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    Checkbox,
    Button,
    message,
    Spin,
    Drawer,
    Form,
    Select,
    Space,
    Divider,
    Tag
} from 'antd';
import { User, Key, Save } from 'lucide-react';

const { Option } = Select;

const PermissionManager = ({ employee, visible, onClose }) => {
    const [permissions, setPermissions] = useState([]);
    const [employeePermissions, setEmployeePermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (employee && visible) {
            fetchPermissions();
            fetchEmployeePermissions();
        }
    }, [employee, visible]);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/permissions/all');
            setPermissions(response.data.data || []);
        } catch (error) {
            message.error('Failed to fetch permissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeePermissions = async () => {
        try {
            const response = await axios.get(`/api/permissions/employee/${employee._id}`);
            const empPerms = response.data.data?.permissions || [];
            setEmployeePermissions(empPerms.map(p => p._id));

            // Group permissions by category for form
            const groupedPermissions = {};
            empPerms.forEach(perm => {
                if (!groupedPermissions[perm.category]) {
                    groupedPermissions[perm.category] = [];
                }
                groupedPermissions[perm.category].push(perm._id);
            });

            form.setFieldsValue({ permissions: groupedPermissions });
        } catch (error) {
            message.error('Failed to fetch employee permissions');
        }
    };

    const handleSave = async (values) => {
        try {
            setSaving(true);
            // Flatten permissions object
            const permissionIds = [];
            Object.values(values.permissions || {}).forEach(categoryPerms => {
                permissionIds.push(...categoryPerms);
            });

            await axios.post('/api/permissions/assign', {
                employeeId: employee._id,
                permissionIds: permissionIds,
                branch: employee.branch,
                assignedBy: JSON.parse(localStorage.getItem('user'))._id
            });

            message.success('Permissions updated successfully');
            onClose();
        } catch (error) {
            message.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
            acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
    }, {});

    return (
        <Drawer
            title="Manage Employee Permissions"
            width={720}
            onClose={onClose}
            open={visible}
            footer={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        loading={saving}
                        icon={<Save size={16} />}
                    >
                        Save Permissions
                    </Button>
                </Space>
            }
        >
            {loading ? (
                <Spin />
            ) : (
                <Card>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Employee Information</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                {employee.image?.url ? (
                                    <img
                                        src={`${import.meta.env.VITE_BASE_URI || ''}${employee.image.url}`}
                                        alt={employee.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User size={24} className="text-gray-500" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium">{employee.name}</h4>
                                <p className="text-gray-600 text-sm">{employee.email}</p>
                                <Tag color="blue">{employee.role}</Tag>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                    >
                        <h3 className="text-lg font-semibold mb-4">Select Permissions</h3>
                        <p className="text-gray-600 mb-6">
                            Select the permissions you want to assign to this employee.
                            Only selected permissions will be available in the employee's sidebar menu.
                        </p>

                        {Object.entries(groupedPermissions).map(([category, categoryPerms]) => (
                            <Card
                                key={category}
                                size="small"
                                title={category.replace(/_/g, ' ').toUpperCase()}
                                className="mb-4"
                            >
                                <Form.Item
                                    name={['permissions', category]}
                                    label=""
                                    className="mb-0"
                                >
                                    <Checkbox.Group className="w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categoryPerms.map(permission => (
                                                <div key={permission._id} className="border rounded p-3">
                                                    <Checkbox value={permission._id}>
                                                        <div>
                                                            <div className="font-medium">
                                                                {permission.name.replace(/_/g, ' ')}
                                                            </div>
                                                            <div className="text-gray-600 text-sm mt-1">
                                                                {permission.description}
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                </div>
                                            ))}
                                        </div>
                                    </Checkbox.Group>
                                </Form.Item>
                            </Card>
                        ))}

                        {permissions.length === 0 && (
                            <div className="text-center py-8">
                                <Key size={48} className="text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No permissions available</p>
                            </div>
                        )}
                    </Form>
                </Card>
            )}
        </Drawer>
    );
};

export default PermissionManager;