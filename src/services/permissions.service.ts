import { PayloadRequest } from 'payload';
import type { Permission } from '@/payload-types';

export type Module = 'cobranzas' | 'ventas' | 'inventario';
export type Operation = 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete';

export const checkModulePermission = async (
  req: PayloadRequest,
  moduleName: Module,
  operation: Operation
): Promise<boolean> => {
  const user = req.user;
  if (!user) return false;
  
  if (user.role === 'admin') return true;

  try {
    const permissionsInfo = await req.payload.find({
      collection: 'permissions',
      where: {
        user: { equals: user.id },
      },
      depth: 0,
    });

    if (!permissionsInfo || !permissionsInfo.docs || permissionsInfo.docs.length === 0) {
      return false;
    }

    const userPermissions = permissionsInfo.docs[0] as Permission;
    const modulePerms = userPermissions[moduleName];
    
    if (!modulePerms) return false;
    
    return modulePerms[operation] === true;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};
