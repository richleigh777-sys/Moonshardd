import { BaseRepository, ConflictError } from '../repositories/BaseRepository';
import { AuthService } from '../services/AuthService';
import { SystemOpsService } from '../services/SystemOpsService';
import { sendToGoogleSheet, testGoogleSheetConnection, validateConfig } from '../../lib/cloud/integrations';
import { User } from '../../types';

export { sendToGoogleSheet, testGoogleSheetConnection, validateConfig, ConflictError };

export class NexusDataGateway extends BaseRepository {
    private authService: AuthService;
    private systemOpsService: SystemOpsService;

    constructor() {
        super();
        this.authService = new AuthService(this);
        this.systemOpsService = new SystemOpsService(this);
    }

    // Auth Service Delegates
    public async verifySession(userId: string, role: string, level: number, sig: string): Promise<User | null> {
        return this.authService.verifySession(userId, role, level, sig);
    }

    public async authenticate(userId: string, userPass: string, companyId: string, companyPass: string) {
        return this.authService.authenticate(userId, userPass, companyId, companyPass);
    }

    public async authenticateRoot(userId: string, userPass: string) {
        return this.authService.authenticateRoot(userId, userPass, async () => {
            await this.seed();
        });
    }

    // System Ops Service Delegates
    public async seed() {
        return this.systemOpsService.seed();
    }

    public async simulateHighLoadTest() {
        return this.systemOpsService.simulateHighLoadTest();
    }

    public async injectSampleLeads() {
        return this.systemOpsService.injectSampleLeads();
    }

    public async injectClosedSales() {
        return this.systemOpsService.injectClosedSales();
    }

    public async sweepStalledLeads() {
        return this.systemOpsService.sweepStalledLeads();
    }

    public async logScriptUsage(scriptId: string, outcome: 'win' | 'loss', amount: number) {
        return this.systemOpsService.logScriptUsage(scriptId, outcome, amount);
    }

    public async validateGhostTarget(id: string) {
        return this.systemOpsService.validateGhostTarget(id);
    }
}

export const nexusGateway = new NexusDataGateway();

export const sendMessage = async (message: any) => {
    await nexusGateway.add('messages', message);
};
