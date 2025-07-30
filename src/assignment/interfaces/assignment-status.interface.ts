export interface AssignmentStatus {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  progress?: {
    processed: number;
    total: number;
    failed?: number;
  };
  error?: string;
  results?: any;
}
