import { menuItems } from '../data/sidebarData.js';

export const getFilteredMenu = (user) => {
    if (!user) return [];

    // Super Admin gets all menu items
    if (user.isSuperAdmin) {
        return menuItems;
    }

    // Admin gets all items except Super Admin specific ones
    if (user.role === "Admin") {
        return menuItems.filter(item => {
            // Admin can't see Super Admin specific items
            if (item.roles && item.roles.includes("Super Admin")) {
                return false;
            }

            // Filter submenu items
            if (item.hasSubmenu && item.submenu) {
                item.submenu = item.submenu.filter(subItem => {
                    return !subItem.roles || subItem.roles.includes("Admin");
                });
                return item.submenu.length > 0;
            }

            return !item.roles || item.roles.includes("Admin");
        });
    }

    // Employee gets menu based on permissions
    if (user.role === "Employee") {
        const employeePermissions = user.permissions || [];

        return menuItems.filter(item => {
            // Check if employee has permission for this menu item
            const hasPermission = checkMenuItemPermission(item, employeePermissions);

            if (item.hasSubmenu && item.submenu) {
                item.submenu = item.submenu.filter(subItem => {
                    return checkMenuItemPermission(subItem, employeePermissions);
                });
                return item.submenu.length > 0;
            }

            return hasPermission;
        });
    }

    return [];
};

const checkMenuItemPermission = (menuItem, permissions) => {
    // Map menu items to permissions
    const permissionMap = {
        // Dashboard
        '/dashboard': 'view_dashboard',

        // Student Management
        '/AddStudent': 'add_student',
        '/new': 'view_student',
        '/accepted': 'approve_registration',
        '/rejected': 'reject_registration',
        '/all-students': 'view_student',

        // Fee Management
        '/pay-fee': 'collect_fee',
        '/new-fee': 'view_fee',
        '/accepted-fee': 'approve_fee',
        '/rejected-fee': 'reject_fee',

        // Attendance
        '/attendance-marking': 'mark_attendance',
        '/attendance-viwe': 'view_attendance',

        // Assignments
        '/assignments': ['create_assignment', 'view_assignment'],

        // Reports
        '/reg-reoprts': 'view_registration_report',
        '/fee-reports': 'view_fee_report',
        '/attendenc-reports': 'view_attendance_report',

        // Settings (most employees won't have these)
        '/duration': 'manage_duration',
        '/technology': 'manage_technology',
        '/course': 'manage_course',
        '/branchs': 'manage_branch',
        '/batchs': 'manage_batch',
        '/employee': 'manage_employee',

        // Jobs
        '/create-company': 'post_job',
        '/create-jobs': 'post_job',
        '/student-assing-job': 'assign_job',
        '/job-applications': 'view_job'
    };

    const requiredPermissions = permissionMap[menuItem.path];

    if (!requiredPermissions) {
        return true; // If no specific permission mapped, allow
    }

    if (Array.isArray(requiredPermissions)) {
        return requiredPermissions.some(perm => permissions.includes(perm));
    }

    return permissions.includes(requiredPermissions);
};

export const checkRouteAccess = (path, user) => {
    if (!user) return false;

    // Super Admin has all access
    if (user.isSuperAdmin) return true;

    // Admin has all access to their branch
    if (user.role === "Admin") return true;

    // Employee needs specific permission
    if (user.role === "Employee") {
        const permissionMap = {
            '/AddStudent': 'add_student',
            '/new': 'view_student',
            '/accepted': 'approve_registration',
            '/rejected': 'reject_registration',
            '/all-students': 'view_student',
            '/pay-fee': 'collect_fee',
            '/new-fee': 'view_fee',
            '/accepted-fee': 'approve_fee',
            '/rejected-fee': 'reject_fee',
            '/attendance-marking': 'mark_attendance',
            '/attendance-viwe': 'view_attendance',
            '/assignments': ['create_assignment', 'view_assignment'],
            '/reg-reoprts': 'view_registration_report',
            '/fee-reports': 'view_fee_report',
            '/attendenc-reports': 'view_attendance_report',
        };

        const requiredPermissions = permissionMap[path];
        if (!requiredPermissions) return true;

        if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.some(perm => user.permissions.includes(perm));
        }

        return user.permissions.includes(requiredPermissions);
    }

    return false;
};