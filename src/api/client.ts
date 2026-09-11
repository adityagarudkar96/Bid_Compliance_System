import { AuditLog, Bid, Bidder, BidderDocument, ComplianceResult, DashboardStats, OfficerDecision, Recommendation, Requirement, User, VerificationCheck } from '../types/index.ts';

const API_BASE = '/api';

export class ApiClient {
  private static token: string | null = localStorage.getItem('gem_auth_token');

  static setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('gem_auth_token', token);
    } else {
      localStorage.removeItem('gem_auth_token');
    }
  }

  static getToken(): string | null {
    return this.token || localStorage.getItem('gem_auth_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMsg = errorJson.error || errorJson.message || errorMsg;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  static async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await this.request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(res.token);
      return res;
    } catch (err: any) {
      // Fallback try /login directly if /api/auth/login had an issue
      try {
        const fallbackRes = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          this.setToken(data.token);
          return data;
        }
      } catch {
        // use original error
      }
      throw err;
    }
  }

  // Dashboard
  static async getDashboard(): Promise<{ stats: DashboardStats; recent_bids: Bid[] }> {
    return this.request('/dashboard');
  }

  // Bids
  static async getBids(params?: { department?: string; status?: string; search?: string }): Promise<{ bids: Bid[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/bids${query ? `?${query}` : ''}`);
  }

  static async getBid(bidId: string): Promise<{ bid: Bid; requirements: Requirement[]; bidders: Bidder[] }> {
    return this.request(`/bids/${bidId}`);
  }

  static async createBid(bidData: Partial<Bid>): Promise<{ bid: Bid }> {
    return this.request('/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  static async analyzeTender(bidId: string, tenderText?: string): Promise<{ bid_id: string; requirements: Requirement[]; message: string }> {
    return this.request(`/bids/${bidId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ tender_text: tenderText }),
    });
  }

  static async verifyAllBidders(bidId: string): Promise<{ bid_id: string; total_bidders: number; results: any[]; message: string }> {
    return this.request(`/bids/${bidId}/verify-all`, {
      method: 'POST',
    });
  }

  // Bidders
  static async getBidder(bidderId: string): Promise<{
    bidder: Bidder;
    documents: BidderDocument[];
    compliance: ComplianceResult | null;
    recommendation: Recommendation | null;
    checks: VerificationCheck[];
  }> {
    return this.request(`/bidders/${bidderId}`);
  }

  static async uploadDocument(bidderId: string, docData: { document_type: string; file_name: string; file_text?: string; file_size?: string }): Promise<{
    document: BidderDocument;
    extraction: any;
    message: string;
  }> {
    return this.request(`/bidders/${bidderId}/documents`, {
      method: 'POST',
      body: JSON.stringify(docData),
    });
  }

  static async verifyBidder(bidderId: string): Promise<{
    score: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'HIGH_RISK';
    passed: number;
    review: number;
    failed: number;
    mandatory_failure: boolean;
    recommendation: string;
    verification_id: string;
    checks: VerificationCheck[];
    compliance: ComplianceResult;
    full_recommendation: Recommendation;
  }> {
    return this.request(`/bidders/${bidderId}/verify`, {
      method: 'POST',
    });
  }

  static async getComplianceReport(bidderId: string): Promise<{
    bidder: Bidder;
    compliance: ComplianceResult | null;
    checks: VerificationCheck[];
    recommendation: Recommendation | null;
  }> {
    return this.request(`/bidders/${bidderId}/compliance`);
  }

  static async getEvidence(checkId: string): Promise<{ check: VerificationCheck; evidence_details: any }> {
    return this.request(`/checks/${checkId}/evidence`);
  }

  static async getAuditTrail(bidderId?: string): Promise<{ audit_logs: AuditLog[] }> {
    const url = bidderId ? `/bidders/${bidderId}/audit` : '/audit';
    return this.request(url);
  }

  static async submitOfficerDecision(bidderId: string, decision: OfficerDecision, reason: string, officer_name?: string): Promise<{ bidder: Bidder; message: string }> {
    return this.request(`/bidders/${bidderId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason, officer_name }),
    });
  }
}
