import * as validator from "validator";

// User validation interfaces
interface UserValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedData?: any;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  emailId?: string;
  password?: string;
  age?: number;
  gender?: string;
  skills?: string[];
  bio?: string;
  photoURL?: string;
}

// Validation functions
export const validateRequiredFields = (
  data: UserData,
  requiredFields: string[]
): UserValidationResult => {
  const missingFields = requiredFields.filter(
    (field) => !data[field as keyof UserData]
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Please provide all required fields: ${missingFields.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
};

export const validateFirstName = (firstName: string): UserValidationResult => {
  if (!validator.isLength(firstName, { min: 2, max: 30 })) {
    return {
      isValid: false,
      message: "First name must be between 2 and 30 characters",
    };
  }

  return {
    isValid: true,
    sanitizedData: validator.trim(firstName),
  };
};

export const validateLastName = (lastName: string): UserValidationResult => {
  if (!validator.isLength(lastName, { max: 30 })) {
    return {
      isValid: false,
      message: "Last name cannot exceed 30 characters",
    };
  }

  return {
    isValid: true,
    sanitizedData: validator.trim(lastName),
  };
};

export const validateEmail = (emailId: string): UserValidationResult => {
  if (!validator.isEmail(emailId)) {
    return {
      isValid: false,
      message: "Please provide a valid email address",
    };
  }

  return {
    isValid: true,
    sanitizedData: validator.normalizeEmail(emailId),
  };
};

export const validatePassword = (password: string): UserValidationResult => {
  if (!validator.isLength(password, { min: 6, max: 30 })) {
    return {
      isValid: false,
      message: "Password must be between 6 and 30 characters",
    };
  }

  return { isValid: true };
};

export const validateAge = (age: number): UserValidationResult => {
  if (isNaN(age) || age < 18 || age > 150) {
    return {
      isValid: false,
      message: "Age must be between 18 and 150 years",
    };
  }

  return { isValid: true };
};

export const validateGender = (gender: string): UserValidationResult => {
  const validGenders = ["male", "female", "others", "prefer not to say"];
  if (!validGenders.includes(gender.toLowerCase())) {
    return {
      isValid: false,
      message: "Gender must be one of: male, female, others, prefer not to say",
    };
  }

  return {
    isValid: true,
    sanitizedData: gender.toLowerCase(),
  };
};

export const validateSkills = (skills: string[]): UserValidationResult => {
  if (!Array.isArray(skills) || skills.length > 10) {
    return {
      isValid: false,
      message: "Maximum 10 skills allowed",
    };
  }

  if (skills.some((skill) => !validator.isLength(skill, { max: 30 }))) {
    return {
      isValid: false,
      message: "Each skill cannot exceed 30 characters",
    };
  }

  return {
    isValid: true,
    sanitizedData: skills.map((skill) => validator.trim(skill)),
  };
};

export const validateBio = (bio: string): UserValidationResult => {
  if (!validator.isLength(bio, { max: 200 })) {
    return {
      isValid: false,
      message: "Bio cannot exceed 200 characters",
    };
  }

  return {
    isValid: true,
    sanitizedData: validator.trim(bio),
  };
};

export const validatePhotoURL = (photoURL: string): UserValidationResult => {
  if (!validator.isURL(photoURL)) {
    return {
      isValid: false,
      message: "Photo URL must be a valid HTTP/HTTPS URL",
    };
  }

  return { isValid: true };
};

export const validateMongoId = (id: string): UserValidationResult => {
  if (!validator.isMongoId(id)) {
    return {
      isValid: false,
      message: "Invalid ID format",
    };
  }

  return { isValid: true };
};

// Combined validation functions
export const validateUserRegistration = (
  data: UserData
): UserValidationResult => {
  // Validate required fields
  const requiredFields = ["firstName", "emailId", "password"];
  const requiredValidation = validateRequiredFields(data, requiredFields);
  if (!requiredValidation.isValid) {
    return requiredValidation;
  }

  // Validate and sanitize fields
  const validations = [
    validateFirstName(data.firstName!),
    data.lastName ? validateLastName(data.lastName) : { isValid: true },
    validateEmail(data.emailId!),
    validatePassword(data.password!),
    data.age ? validateAge(data.age) : { isValid: true },
    data.gender ? validateGender(data.gender) : { isValid: true },
    data.skills ? validateSkills(data.skills) : { isValid: true },
    data.bio ? validateBio(data.bio) : { isValid: true },
  ];

  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }

  // Prepare sanitized data
  const sanitizedData = {
    firstName: validator.trim(data.firstName!),
    lastName: data.lastName ? validator.trim(data.lastName) : undefined,
    emailId: validator.normalizeEmail(data.emailId!),
    password: data.password,
    age: data.age ? Number(data.age) : undefined,
    gender: data.gender ? data.gender.toLowerCase() : undefined,
    skills: data.skills
      ? data.skills.map((skill) => validator.trim(skill))
      : undefined,
    bio: data.bio ? validator.trim(data.bio) : undefined,
  };

  return { isValid: true, sanitizedData };
};

export const validateUserUpdate = (data: UserData): UserValidationResult => {
  const sanitizedData: any = {};

  if (data.firstName) {
    const validation = validateFirstName(data.firstName);
    if (!validation.isValid) return validation;
    sanitizedData.firstName = validation.sanitizedData;
  }

  if (data.lastName) {
    const validation = validateLastName(data.lastName);
    if (!validation.isValid) return validation;
    sanitizedData.lastName = validation.sanitizedData;
  }

  if (data.password) {
    const validation = validatePassword(data.password);
    if (!validation.isValid) return validation;
    sanitizedData.password = data.password;
  }

  if (data.age) {
    const validation = validateAge(data.age);
    if (!validation.isValid) return validation;
    sanitizedData.age = Number(data.age);
  }

  if (data.gender) {
    const validation = validateGender(data.gender);
    if (!validation.isValid) return validation;
    sanitizedData.gender = validation.sanitizedData;
  }

  if (data.skills) {
    const validation = validateSkills(data.skills);
    if (!validation.isValid) return validation;
    sanitizedData.skills = validation.sanitizedData;
  }

  if (data.bio) {
    const validation = validateBio(data.bio);
    if (!validation.isValid) return validation;
    sanitizedData.bio = validation.sanitizedData;
  }

  if (data.photoURL) {
    const validation = validatePhotoURL(data.photoURL);
    if (!validation.isValid) return validation;
    sanitizedData.photoURL = data.photoURL;
  }

  return { isValid: true, sanitizedData };
};
