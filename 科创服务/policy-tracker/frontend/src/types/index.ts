export interface Policy {
  id: string;
  name: string;
  code?: string;
  category: string;
  level: string;
  department: string;
  description?: string;
  eligibility?: string[];
  benefits?: {
    type: string;
    amount: string;
    description: string;
  }[];
  materials?: {
    name: string;
    required: boolean;
    description: string;
    template?: string;
  }[];
  process?: {
    step: number;
    title: string;
    description: string;
  }[];
  publishDate?: string;
  applyStartDate?: string;
  applyEndDate?: string;
  validUntil?: string;
  officialUrl?: string;
  documentUrl?: string;
  status: string;
  region?: string;
  industries?: string[];
  viewCount: number;
  applyCount: number;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enterprise {
  id: string;
  name: string;
  creditCode: string;
  industry?: string;
  scale: string;
  registerDate?: string;
  registerCapital?: number;
  employees?: number;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  qualifications?: string[];
  intellectualProperty?: {
    patents: number;
    softwareCopyrights: number;
    trademarks: number;
  };
  annualRevenue?: number;
  rdExpense?: number;
  rdRatio?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  trackedPolicyIds?: string[];
  notificationSettings?: {
    email: boolean;
    sms: boolean;
    wechat: boolean;
    advanceDays: number;
  };
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
}

export interface ApplicationTask {
  id: string;
  enterpriseId: string;
  policyId: string;
  status: string;
  progress: number;
  materials?: {
    materialId: string;
    name: string;
    status: string;
    fileUrl?: string;
    uploadedAt?: string;
    remark?: string;
  }[];
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  resultComment?: string;
  approvedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}