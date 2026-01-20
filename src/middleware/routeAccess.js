import { checkRouteAccess } from '../utils/menuFilter.js';

export const checkAccess = (req, res, next) => {
    const user = req.user;
    const path = req.path;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    // Super Admin has all access
    if (user.isSuperAdmin) {
        return next();
    }

    // Admin has access to all routes (within their branch)
    if (user.role === "Admin") {
        return next();
    }

    // Check employee access
    if (user.role === "Employee") {
        const hasAccess = checkRouteAccess(path, user);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this resource"
            });
        }
    }

    next();
};