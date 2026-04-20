// server/seed.js - Database Seeder for Demo Data
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const TestCase = require('./models/TestCase');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await TestCase.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create demo users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@bugsquash.com',
                password: 'Admin123',
                role: 'admin',
                title: 'QA Lead',
                department: 'QA'
            },
            {
                name: 'Sarah Chen',
                email: 'sarah@bugsquash.com',
                password: 'Sarah123',
                role: 'qa_engineer',
                title: 'Senior QA Engineer',
                department: 'QA'
            },
            {
                name: 'Mike Johnson',
                email: 'mike@bugsquash.com',
                password: 'Mike1234',
                role: 'developer',
                title: 'Full Stack Developer',
                department: 'Engineering'
            },
            {
                name: 'Emily Davis',
                email: 'emily@bugsquash.com',
                password: 'Emily123',
                role: 'viewer',
                title: 'Product Manager',
                department: 'Product'
            }
        ]);
        console.log(`✅ Created ${users.length} demo users`);

        // Create demo test cases
        const testCases = await TestCase.create([
            {
                testId: 'TC-AUTH-001',
                title: 'User Login with Valid Credentials',
                description: 'Verify that a user can log in with valid email and password',
                steps: [
                    { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page loads' },
                    { stepNumber: 2, action: 'Enter valid email', expectedResult: 'Email field populated' },
                    { stepNumber: 3, action: 'Enter valid password', expectedResult: 'Password field populated' },
                    { stepNumber: 4, action: 'Click Sign In button', expectedResult: 'User redirected to dashboard' }
                ],
                type: 'Manual',
                priority: 'Critical',
                status: 'Active',
                tags: ['authentication', 'login', 'smoke-test'],
                createdBy: 'Sarah Chen',
                assignedTo: 'Sarah Chen',
                estimatedTime: 5,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-01-15'), result: 'Passed', actualResult: 'User logged in successfully', executionTime: 3000 },
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-02-01'), result: 'Passed', actualResult: 'Login successful', executionTime: 2800 }
                ]
            },
            {
                testId: 'TC-AUTH-002',
                title: 'Login with Invalid Password',
                description: 'Verify error message when user attempts login with incorrect password',
                steps: [
                    { stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page loads' },
                    { stepNumber: 2, action: 'Enter valid email', expectedResult: 'Email field populated' },
                    { stepNumber: 3, action: 'Enter wrong password', expectedResult: 'Password field populated' },
                    { stepNumber: 4, action: 'Click Sign In', expectedResult: 'Error message displayed' }
                ],
                type: 'Manual',
                priority: 'High',
                status: 'Active',
                tags: ['authentication', 'negative-test', 'security'],
                createdBy: 'Sarah Chen',
                assignedTo: 'Sarah Chen',
                estimatedTime: 3,
                defectCount: 1,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-01-16'), result: 'Failed', actualResult: 'No error message shown', executionTime: 2500 },
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-02-10'), result: 'Passed', actualResult: 'Error message shown correctly', executionTime: 2200 }
                ]
            },
            {
                testId: 'TC-AUTH-003',
                title: 'Account Lockout After Failed Attempts',
                description: 'Verify account locks after 5 consecutive failed login attempts',
                steps: [
                    { stepNumber: 1, action: 'Attempt login with wrong password 5 times', expectedResult: 'Account locked message' },
                    { stepNumber: 2, action: 'Try login with correct password', expectedResult: 'Account locked error' }
                ],
                type: 'Manual',
                priority: 'Critical',
                status: 'Active',
                tags: ['authentication', 'security', 'lockout'],
                createdBy: 'Sarah Chen',
                estimatedTime: 10,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-02-15'), result: 'Passed', actualResult: 'Account locked after 5 attempts', executionTime: 15000 }
                ]
            },
            {
                testId: 'TC-REG-001',
                title: 'New User Registration',
                description: 'Verify that new users can register with valid information',
                steps: [
                    { stepNumber: 1, action: 'Navigate to registration page', expectedResult: 'Registration form loads' },
                    { stepNumber: 2, action: 'Fill in all required fields', expectedResult: 'Fields populated' },
                    { stepNumber: 3, action: 'Click Register button', expectedResult: 'Account created, redirected to dashboard' }
                ],
                type: 'Manual',
                priority: 'Critical',
                status: 'Active',
                tags: ['registration', 'smoke-test'],
                createdBy: 'Sarah Chen',
                estimatedTime: 5,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-01-20'), result: 'Passed', actualResult: 'User registered successfully', executionTime: 4000 }
                ]
            },
            {
                testId: 'TC-DASH-001',
                title: 'Dashboard Metrics Display',
                description: 'Verify all dashboard metrics load correctly on the main dashboard',
                steps: [
                    { stepNumber: 1, action: 'Login as QA engineer', expectedResult: 'Dashboard loads' },
                    { stepNumber: 2, action: 'Check stats cards', expectedResult: 'All metrics display correct values' },
                    { stepNumber: 3, action: 'Verify recent executions', expectedResult: 'Recent test results are shown' }
                ],
                type: 'Automated',
                priority: 'High',
                status: 'Active',
                tags: ['dashboard', 'metrics', 'ui'],
                createdBy: 'Mike Johnson',
                assignedTo: 'Mike Johnson',
                estimatedTime: 8,
                defectCount: 2,
                executionHistory: [
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-02-05'), result: 'Failed', actualResult: 'Metrics were not refreshing', executionTime: 5000 },
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-02-20'), result: 'Passed', actualResult: 'All metrics load correctly', executionTime: 4200 }
                ]
            },
            {
                testId: 'TC-TC-001',
                title: 'Create New Test Case',
                description: 'Verify QA engineers can create new test cases via the form',
                steps: [
                    { stepNumber: 1, action: 'Navigate to Test Cases page', expectedResult: 'Test case list loads' },
                    { stepNumber: 2, action: 'Click Create New button', expectedResult: 'Form opens' },
                    { stepNumber: 3, action: 'Fill in all required fields', expectedResult: 'Fields populated' },
                    { stepNumber: 4, action: 'Click Save', expectedResult: 'Test case created, appears in list' }
                ],
                type: 'Manual',
                priority: 'High',
                status: 'Active',
                tags: ['test-case', 'crud', 'form'],
                createdBy: 'Sarah Chen',
                estimatedTime: 10,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-02-12'), result: 'Passed', actualResult: 'Test case created with all fields', executionTime: 8000 }
                ]
            },
            {
                testId: 'TC-TC-002',
                title: 'Filter Test Cases by Priority',
                description: 'Verify filtering test cases by priority level works correctly',
                steps: [
                    { stepNumber: 1, action: 'Navigate to Test Cases page', expectedResult: 'Test case list loads' },
                    { stepNumber: 2, action: 'Select priority filter', expectedResult: 'Filter options shown' },
                    { stepNumber: 3, action: 'Choose Critical', expectedResult: 'Only Critical test cases displayed' }
                ],
                type: 'Automated',
                priority: 'Medium',
                status: 'Active',
                tags: ['test-case', 'filter', 'search'],
                createdBy: 'Mike Johnson',
                estimatedTime: 5,
                defectCount: 1,
                executionHistory: [
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-02-18'), result: 'Failed', actualResult: 'Filter not clearing properly', executionTime: 3000 },
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-03-01'), result: 'Passed', actualResult: 'Filters work correctly', executionTime: 2800 }
                ]
            },
            {
                testId: 'TC-API-001',
                title: 'API Health Check Endpoint',
                description: 'Verify /api/health returns correct status and uptime info',
                steps: [
                    { stepNumber: 1, action: 'Send GET to /api/health', expectedResult: 'Status 200' },
                    { stepNumber: 2, action: 'Check response body', expectedResult: 'Contains status, timestamp, uptime' }
                ],
                type: 'Automated',
                priority: 'Low',
                status: 'Active',
                tags: ['api', 'health-check', 'automated'],
                createdBy: 'Mike Johnson',
                estimatedTime: 2,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-03-05'), result: 'Passed', actualResult: 'Health check returns 200', executionTime: 150 }
                ]
            },
            {
                testId: 'TC-PERF-001',
                title: 'Dashboard Load Time Under 2s',
                description: 'Verify the dashboard page loads within 2 seconds under normal conditions',
                steps: [
                    { stepNumber: 1, action: 'Clear browser cache', expectedResult: 'Cache cleared' },
                    { stepNumber: 2, action: 'Navigate to dashboard', expectedResult: 'Dashboard loads' },
                    { stepNumber: 3, action: 'Measure load time', expectedResult: 'Load time < 2000ms' }
                ],
                type: 'Performance',
                priority: 'High',
                status: 'Active',
                tags: ['performance', 'dashboard', 'load-time'],
                createdBy: 'Sarah Chen',
                estimatedTime: 15,
                defectCount: 1,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-02-25'), result: 'Failed', actualResult: 'Load time was 3.2s', executionTime: 3200 },
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-03-10'), result: 'Passed', actualResult: 'Load time 1.4s after optimization', executionTime: 1400 }
                ]
            },
            {
                testId: 'TC-SEC-001',
                title: 'JWT Token Expiration',
                description: 'Verify expired JWT tokens are rejected by the API',
                steps: [
                    { stepNumber: 1, action: 'Generate expired JWT token', expectedResult: 'Token created' },
                    { stepNumber: 2, action: 'Make API request with expired token', expectedResult: '401 Unauthorized' }
                ],
                type: 'Security',
                priority: 'Critical',
                status: 'Active',
                tags: ['security', 'jwt', 'authentication'],
                createdBy: 'Sarah Chen',
                estimatedTime: 10,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-03-01'), result: 'Passed', actualResult: 'Expired token correctly rejected', executionTime: 500 }
                ]
            },
            {
                testId: 'TC-SEC-002',
                title: 'SQL Injection Prevention',
                description: 'Verify API inputs are sanitized against injection attacks',
                steps: [
                    { stepNumber: 1, action: 'Send malicious input in login form', expectedResult: 'Input rejected or sanitized' },
                    { stepNumber: 2, action: 'Send malicious input in search', expectedResult: 'No data leak' }
                ],
                type: 'Security',
                priority: 'Critical',
                status: 'Under Review',
                tags: ['security', 'injection', 'sanitization'],
                createdBy: 'Sarah Chen',
                estimatedTime: 20,
                defectCount: 0,
                executionHistory: [
                    { executedBy: 'Sarah Chen', executedAt: new Date('2024-03-08'), result: 'Passed', actualResult: 'All inputs sanitized', executionTime: 12000 }
                ]
            },
            {
                testId: 'TC-UI-001',
                title: 'Responsive Layout on Mobile',
                description: 'Verify the application layout adapts correctly on mobile viewports',
                steps: [
                    { stepNumber: 1, action: 'Open app on 375px viewport', expectedResult: 'Mobile layout renders' },
                    { stepNumber: 2, action: 'Check navigation', expectedResult: 'Mobile hamburger menu shown' },
                    { stepNumber: 3, action: 'Check form layouts', expectedResult: 'Forms stack vertically' }
                ],
                type: 'Manual',
                priority: 'Medium',
                status: 'Draft',
                tags: ['ui', 'responsive', 'mobile'],
                createdBy: 'Mike Johnson',
                estimatedTime: 15,
                defectCount: 3,
                executionHistory: [
                    { executedBy: 'Mike Johnson', executedAt: new Date('2024-03-12'), result: 'Failed', actualResult: 'Navigation overlaps on small screens', executionTime: 10000 }
                ]
            }
        ]);
        console.log(`✅ Created ${testCases.length} demo test cases`);

        console.log('\n🎉 Seeding complete!');
        console.log('═══════════════════════════════════════');
        console.log('Demo Login Credentials:');
        console.log('  Admin:     admin@bugsquash.com / Admin123');
        console.log('  QA:        sarah@bugsquash.com / Sarah123');
        console.log('  Developer: mike@bugsquash.com  / Mike1234');
        console.log('  Viewer:    emily@bugsquash.com  / Emily123');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
