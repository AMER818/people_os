import React, { createContext, useContext, ReactNode } from 'react';
import { useOrgStore } from "@/store/orgStore";
import { Permission, SystemRole } from '@/types';
import { hasPermission as checkPermission } from '../config/permissions';

interface RBACContextType {
    hasPermission: (permission: Permission) => boolean;
    hasRole: (role: SystemRole | SystemRole[]) => boolean;
    userRole: SystemRole | undefined;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useOrgStore();

    const userRole = currentUser?.role;

    const hasPermission = (permission: Permission): boolean => {
        if (!userRole) {return false;}
        return checkPermission(userRole, permission);
    };

    const hasRole = (role: SystemRole | SystemRole[]): boolean => {
        if (!userRole) {return false;}
        if (Array.isArray(role)) {
            return role.includes(userRole);
        }
        return userRole === role;
    };

    return (
        <RBACContext.Provider value={{ hasPermission, hasRole, userRole }}>
            {children}
        </RBACContext.Provider>
    );
};

export const useRBAC = (): RBACContextType => {
    const context = useContext(RBACContext);
    if (!context) {
        throw new Error('useRBAC must be used within an RBACProvider');
    }
    return context;
};
