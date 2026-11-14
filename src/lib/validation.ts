import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid college or personal email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter the email associated with your account.'),
});

export const onboardingStep1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Valid email is required.'),
  college: z.string().min(2, 'College or university name is required.'),
  department: z.string().min(2, 'Department is required.'),
  academicYear: z.string().min(1, 'Select your academic year.'),
  educationLevel: z.string().min(1, 'Select your education level.'),
});

export const onboardingStep10Schema = z.object({
  weeklyStudyHours: z.number().min(2, 'Minimum 2 hours/week').max(60, 'Maximum 60 hours/week'),
  preferredStudyTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Night']),
});

export const projectSubmissionSchema = z.object({
  description: z.string().min(15, 'Describe what you built and how you tested it (min 15 characters).'),
  githubUrl: z
    .string()
    .refine((val) => val === '' || /^https?:\/\/.+/.test(val), 'Enter a valid http(s) repository URL or leave blank.'),
  liveDemoUrl: z
    .string()
    .refine((val) => val === '' || /^https?:\/\/.+/.test(val), 'Enter a valid http(s) demo URL or leave blank.'),
});

export const customCareerSchema = z.object({
  title: z.string().min(3, 'Career title must be at least 3 characters.'),
  skills: z
    .array(
      z.object({
        skill: z.string().min(1),
        requiredScore: z.number().min(30).max(100),
        importance: z.number().min(1).max(5),
        estimatedEffortHours: z.number().min(4).max(120),
      }),
    )
    .min(2, 'Select at least 2 required skills for your custom career goal.'),
});
