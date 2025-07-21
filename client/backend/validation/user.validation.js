import Joi from 'joi';

const userSchema = Joi.object({
    fullName: Joi.string().required(), 
    email: Joi.string()
        .required()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .messages({
            'string.pattern.base': 'Please provide a valid email format (e.g., user@example.com)'
        }),
    password: Joi.string()
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
    phoneNumber: Joi.string()
        .required()
        .pattern(/^\d{10}$/)
        .messages({
            'string.pattern.base': 'Phone number must be exactly 10 digits'
        }),
    role: Joi.string()
        .required()
        .valid('student', 'recruiter')
        .messages({
            'any.only': 'Role must be either student or recruiter'
        }),
    profile: Joi.object().optional() 
});

const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .messages({
            'string.pattern.base': 'Please provide a valid email format (e.g., user@example.com)'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required'
        }),
    role: Joi.string()
        .required()
        .valid('student', 'recruiter')
        .messages({
            'any.only': 'Role must be either student or recruiter'
        })
});

export const validateUser = (userData) => {
    return userSchema.validate(userData, { 
        abortEarly: false,
        stripUnknown: true 
    });
};

export const validatelogin= (userData) => {
    return loginSchema.validate(userData, { 
        abortEarly: false,
        stripUnknown: true 
    });
};