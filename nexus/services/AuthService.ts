import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../../types';
import { BaseRepository } from '../repositories/BaseRepository';

export class AuthService {
    constructor(private repository: BaseRepository) {}

    public async verifySession(userId: string, _role: string, _level: number, sig: string): Promise<User | null> {
        try {
            await new Promise<void>((resolve) => {
                import('firebase/auth').then(({ onAuthStateChanged }) => {
                    const unsubscribe = onAuthStateChanged(auth, () => {
                        unsubscribe();
                        resolve();
                    });
                });
            });
            
            const isDummyProject = auth.app.options.projectId === 'dummy-project';
            
            if (!isDummyProject && !auth.currentUser) {
                console.warn("[Nexus] Session verification failed: Firebase Auth is not signed in.");
                return null;
            }

            if (!sig) {
                console.warn("[Nexus] Session verification failed: No signature provided.");
                return null;
            }
            const decoded = atob(sig);
            const [id, serverId, timestamp] = decoded.split(':');
            
            if (id !== userId) {
                console.warn(`[Nexus] Session verification failed: ID mismatch. Expected ${userId}, got ${id}`);
                return null;
            }

            const sessionAge = Date.now() - parseInt(timestamp);
            if (sessionAge > (12 * 60 * 60 * 1000)) {
                console.warn("[Nexus] Session expired");
                return null;
            }

            const effectiveServerId = serverId === 'sys_root' ? this.repository.activeServerId : serverId;
            if (effectiveServerId && effectiveServerId !== this.repository.activeServerId) {
                this.repository.setActiveServer(effectiveServerId);
            }

            if (userId === 'sys_root') {
                return { 
                   id: 'sys_root', 
                   serverId: effectiveServerId, 
                   role: 'admin', 
                   level: 10,
                   name: 'System Root',
                   pass: '',
                   status: 'active',
                   accessLevel: 10,
                   commissionRate: 0,
                   active: true,
                   currentStatus: 'online'
                } as User;
            }

            const path = this.repository.getPath('users', userId);
            const snap = await getDoc(doc(db, path));
            if (!snap.exists()) {
                console.warn(`[Nexus] Session verification failed: User document not found at ${path}.`);
                return null;
            }
            return snap.data() as User;
        } catch (err: any) {
            console.error("[Nexus] Session verification logic error:", err);
            if (err instanceof Error && (err.message.includes("client is offline") || err.message.includes("network") || err.message.includes("unavailable"))) {
                throw err;
            }
            if (err?.code === 'unavailable' || err?.code === 'failed-precondition') {
                throw err;
            }
            return null;
        }
    }

    public async authenticate(userId: string, userPass: string, companyId: string, _companyPass: string) {
        try {
            const isDummyProject = auth.app.options.projectId === 'dummy-project';
            if (isDummyProject) {
                this.repository.setActiveServer(companyId);
                const sig = btoa(`${userId}:${companyId}:${Date.now()}`);
                const authUser = { 
                   id: userId, 
                   serverId: companyId, 
                   role: 'agent', 
                   level: 1,
                   name: userId,
                   pass: '',
                   status: 'active',
                   accessLevel: 1,
                   commissionRate: 15,
                   active: true,
                   currentStatus: 'online'
                } as User;
                return { user: authUser, sig };
            }

            const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
            const email = `${userId}@${companyId}.local`;
            
            try {
                const creds = await signInWithEmailAndPassword(auth, email, userPass);
                this.repository.setActiveServer(companyId);
                const sig = btoa(`${userId}:${companyId}:${Date.now()}`);
                
                const authUser = { 
                   id: userId, 
                   serverId: companyId, 
                   role: 'agent', 
                   level: 1,
                   name: userId,
                   pass: '',
                   status: 'active',
                   accessLevel: 1,
                   commissionRate: 15,
                   active: true,
                   currentStatus: 'online'
                } as User;
                return { user: authUser, sig };
            } catch (err: any) {
                if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                    try {
                        const creds = await createUserWithEmailAndPassword(auth, email, userPass);
                        this.repository.setActiveServer(companyId);
                        const sig = btoa(`${userId}:${companyId}:${Date.now()}`);
                        
                        const authUser: User = { 
                           id: userId, 
                           serverId: companyId, 
                           role: 'agent', 
                           level: 1,
                           name: userId,
                           pass: '',
                           accessLevel: 1,
                           commissionRate: 15,
                           active: true,
                           currentStatus: 'online'
                        };
                        return { user: authUser, sig };
                    } catch (createErr: any) {
                         if (createErr.code === 'auth/operation-not-allowed') {
                             console.error("Firebase Auth is disabled in Project.", createErr);
                             return { error: "CRITICAL: Email/Password Auth is disabled in Firebase Console. Please enable it." };
                         }
                         throw createErr;
                    }
                }
                
                if (err.code === 'auth/operation-not-allowed') {
                    console.error("Firebase Auth is disabled in Project.", err);
                    return { error: "CRITICAL: Email/Password Auth is disabled in Firebase Console. Please enable it." };
                }
                throw err;
            }
        } catch (err: any) {
            console.error(`[Nexus] Firebase Auth failed`, err);
            return { error: err.message || "Authentication failed." };
        }
    }

    public async authenticateRoot(userId: string, userPass: string, onRootCreated: () => Promise<void>) {
        try {
            const isDummyProject = auth.app.options.projectId === 'dummy-project';
            const email = `sys_root@moonshard.local`;
            const sid = 'srv-001';

            if (isDummyProject) {
                this.repository.setActiveServer(sid);
                const sig = btoa(`sys_root:${sid}:${Date.now()}`);
                const authUser = { 
                   id: 'sys_root', 
                   serverId: sid, 
                   role: 'admin', 
                   level: 10,
                   name: 'System Root',
                   pass: '',
                   status: 'active',
                   accessLevel: 10,
                   commissionRate: 0,
                   active: true,
                   currentStatus: 'online'
                } as User;
                
                // Fire onRootCreated immediately since dummy doesn't keep track of if it was created just now.
                console.warn("[Nexus] Root user created (Dummy). Auto-triggering seed...");
                await onRootCreated();

                return { user: authUser, sig };
            }

            const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
            
            let creds;
            try {
                creds = await signInWithEmailAndPassword(auth, email, userPass);
            } catch (e: any) {
                if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
                    try {
                        creds = await createUserWithEmailAndPassword(auth, email, userPass);
                    } catch (createErr: any) {
                         if (createErr.code === 'auth/operation-not-allowed') {
                             console.error("Auth missing for auto-seed.");
                             return { error: "CRITICAL: Enable Email/Password Auth in Firebase Console to run Auto-Seed." };
                         }
                         throw createErr;
                    }
                    
                    console.warn("[Nexus] Root user created. Auto-triggering seed...");
                    await onRootCreated();
                } else if (e.code === 'auth/operation-not-allowed') {
                    return { error: "CRITICAL: Configure Email/Password Auth in Firebase Console before initializing Root." };
                } else {
                    throw e;
                }
            }
            
            if (creds) {
                this.repository.setActiveServer(sid);
                const sig = btoa(`sys_root:${sid}:${Date.now()}`);
                
                const authUser = { 
                   id: 'sys_root', 
                   serverId: sid, 
                   role: 'admin', 
                   level: 10,
                   name: 'System Root',
                   pass: '',
                   status: 'active',
                   accessLevel: 10,
                   commissionRate: 0,
                   active: true,
                   currentStatus: 'online'
                } as User;
                
                return { user: authUser, sig };
            }
        } catch (err: any) {
            console.error(`[Nexus] Root Auth failed`, err);
            return { error: err.message || "Root Authentication failed." };
        }
        return { error: "Super Admin access denied." };
    }
}
