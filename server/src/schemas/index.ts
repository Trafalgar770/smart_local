import { z } from 'zod';

export const ServiceCategoryEnum = z.enum([
  'PLUMBER', 'ELECTRICIAN', 'PAINTER', 'LABOUR', 'FUEL_DELIVERY',
  'BIKE_MECHANIC', 'CAR_MECHANIC', 'PUNCTURE_REPAIR', 'BATTERY_JUMPSTART',
  'TOWING', 'CARPENTER', 'AC_REPAIR', 'WELDER', 'MASON', 'MOVERS',
  'APPLIANCE_REPAIR', 'OTHER_SERVICES'
]);

export type ServiceCategory = z.infer<typeof ServiceCategoryEnum>;

export const ChecklistAnswerEnum = z.enum(['CHECKED', 'UNCHECKED', 'DONT_KNOW']);
export type ChecklistAnswer = z.infer<typeof ChecklistAnswerEnum>;

export const AnalyzeRequestSchema = z.object({
  problemDescription: z.string().min(3, 'Problem description is too short'),
  inputType: z.enum(['TEXT', 'VOICE', 'VISION']).default('TEXT'),
  imageBufferBase64: z.string().optional().nullable(),
  categoryHint: z.string().optional(),
});

export const ReassessRequestSchema = z.object({
  rawInput: z.string().optional(),
  initialCategory: ServiceCategoryEnum.or(z.string()).optional(),
  responses: z.record(z.string(), z.any()).optional(),
  checklistAnswers: z.record(z.string(), z.any()).optional(),
  sessionId: z.string().optional(),
});

export const ServiceRequestCreateSchema = z.object({
  providerId: z.string().optional(),
  diagnosticId: z.string().optional().nullable(),
  category: ServiceCategoryEnum.or(z.string()).optional(),
  serviceId: z.string().optional(),
  problemSummary: z.string().optional(),
  problemDescription: z.string().optional(),
  aiSummary: z.string().optional(),
  estimatedCostMin: z.number().optional().default(299),
  estimatedCostMax: z.number().optional().default(999),
  estimatedMin: z.number().optional(),
  estimatedMax: z.number().optional(),
  customerAddressText: z.string().optional(),
  customerAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  customerLatitude: z.number().optional(),
  customerLongitude: z.number().optional(),
  aiSessionId: z.string().optional(),
});

export const CreateRequestSchema = ServiceRequestCreateSchema;

export const LocationConsentSchema = z.object({
  approved: z.boolean().optional(),
  permissionStatus: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const LocationPermissionSchema = z.object({
  permissionStatus: z.enum(['shared', 'not_shared', 'stopped']).or(z.string()),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
  address: z.string().optional(),
});

export const LocationUpdateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
});

export const RequestStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
]);

export const StatusUpdateSchema = z.object({
  status: RequestStatusEnum.or(z.string()),
  note: z.string().optional(),
});

export const UpdateStatusSchema = z.object({
  status: z.string(),
  note: z.string().optional(),
});

export const TrackingUpdateSchema = z.object({
  requestId: z.string().min(1),
  providerId: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  heading: z.number().optional(),
  speedKmh: z.number().optional(),
});

export const CreateReviewSchema = z.object({
  requestId: z.string().min(1),
  providerId: z.string().min(1),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional(),
});

export const SendMessageSchema = z.object({
  requestId: z.string().min(1),
  receiverId: z.string().min(1),
  message: z.string().min(1, 'Message cannot be empty'),
});

export const FollowUpSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

export const ScanProblemSchema = z.object({
  image: z.string().min(5),
  mimeType: z.string().optional(),
  notes: z.string().optional(),
});

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  role: z.enum(['customer', 'provider', 'CUSTOMER', 'PROVIDER']).default('customer'),
  businessName: z.string().optional(),
  serviceCategoryIds: z.array(z.string()).optional(),
  serviceArea: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
