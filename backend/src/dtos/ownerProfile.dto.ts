export interface OwnerProfileResponseDTO {
  id: string;
  userId: string;
  businessName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetupOwnerProfileRequestDTO {
  name?: string;
  phone?: string;
  profileImage?: string;
  businessName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  location?: string;
}
