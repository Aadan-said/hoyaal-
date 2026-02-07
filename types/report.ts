export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Report {
    id: string;
    reporter_id: string;
    property_id?: string;
    profile_id?: string;
    reason: string;
    details?: string;
    status: ReportStatus;
    created_at: string;
}

export interface CreateReportInput {
    property_id?: string;
    profile_id?: string;
    reason: string;
    details?: string;
}
