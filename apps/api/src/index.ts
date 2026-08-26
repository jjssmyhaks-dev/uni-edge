// New Relic must be the first import in the application
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Routes
import healthRoutes from './routes/health';
import institutionRoutes from './routes/institutions';
import userRoutes from './routes/users';
import departmentRoutes from './routes/departments';
import programRoutes from './routes/programs';
import admissionCycleRoutes from './routes/admission-cycles';
import entranceExamRoutes from './routes/entrance-exams';
import auditLogRoutes from './routes/audit-logs';
import examCandidateRoutes from './routes/exam-candidates';
import examResultRoutes from './routes/exam-results';
import applicationRoutes from './routes/applications';
import documentRoutes from './routes/documents';
import attendanceRoutes from './routes/attendance';
import regularExamRoutes from './routes/regular-exams';
import noticeRoutes from './routes/notices';
import documentRequestRoutes from './routes/document-requests';
import proctoringRoutes from './routes/proctoring';
import dashboardRoutes from './routes/dashboard';
import onboardingRoutes from './routes/onboarding';
import feeRoutes from './routes/fees';
import examQuestionsRoutes from './routes/exam-questions';
import examSubmissionsRoutes from './routes/exam-submissions';
import meritListRoutes from './routes/merit-lists';

const app = express();

// ============================================
// Global Middleware
// ============================================

app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// ============================================
// Routes
// ============================================

const API_PREFIX = '/api/v1';

app.use('/health', healthRoutes);
app.use(`${API_PREFIX}/institutions`, institutionRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/departments`, departmentRoutes);
app.use(`${API_PREFIX}/programs`, programRoutes);
app.use(`${API_PREFIX}/admission-cycles`, admissionCycleRoutes);
app.use(`${API_PREFIX}/entrance-exams`, entranceExamRoutes);
app.use(`${API_PREFIX}/audit-logs`, auditLogRoutes);
app.use(`${API_PREFIX}/exam-candidates`, examCandidateRoutes);
app.use(`${API_PREFIX}/exam-results`, examResultRoutes);
app.use(`${API_PREFIX}/applications`, applicationRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);

// Module 4: Academic/Office Admin
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/notices`, noticeRoutes);
app.use(`${API_PREFIX}/document-requests`, documentRequestRoutes);

// Module 5: Regular Exam Process
app.use(`${API_PREFIX}/regular-exams`, regularExamRoutes);

// Module 6: Online Proctored Exam
app.use(`${API_PREFIX}/proctoring`, proctoringRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/onboarding`, onboardingRoutes);
app.use(`${API_PREFIX}/fees`, feeRoutes);
app.use(`${API_PREFIX}/exam-questions`, examQuestionsRoutes);
app.use(`${API_PREFIX}/exam-submissions`, examSubmissionsRoutes);
app.use(`${API_PREFIX}/merit-lists`, meritListRoutes);

// ============================================
// Error Handling
// ============================================

app.use(errorHandler);

// ============================================
// Start Server
// ============================================

app.listen(config.port, () => {
  console.log(`🚀 Uni-Edge API running on port ${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/health`);
  if (config.newRelic.licenseKey) {
    console.log('🔍 New Relic agent active');
  }
});

export default app;
