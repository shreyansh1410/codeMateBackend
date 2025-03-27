import validator from "validator";

// User validation interfaces
interface ValidationResult {
  isValid: boolean;
  message: string;
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

// Individual validation functions
const validateFirstName = (firstName: string): ValidationResult => {
  if (!firstName) {
    return { isValid: false, message: "First name is required" };
  }
  if (firstName.length < 2) {
    return {
      isValid: false,
      message: "First name must be at least 2 characters long",
    };
  }
  if (firstName.length > 30) {
    return {
      isValid: false,
      message: "First name cannot exceed 30 characters",
    };
  }
  return { isValid: true, message: "", sanitizedData: firstName.trim() };
};

const validateLastName = (lastName: string): ValidationResult => {
  if (lastName && lastName.length > 30) {
    return { isValid: false, message: "Last name cannot exceed 30 characters" };
  }
  return { isValid: true, message: "", sanitizedData: lastName?.trim() };
};

const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }
  if (!validator.isEmail(email)) {
    return { isValid: false, message: "Please provide a valid email address" };
  }
  return {
    isValid: true,
    message: "",
    sanitizedData: email.toLowerCase().trim(),
  };
};

const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  if (password.length > 300) {
    return { isValid: false, message: "Password cannot exceed 300 characters" };
  }
  return { isValid: true, message: "", sanitizedData: password };
};

const validateAge = (age: number): ValidationResult => {
  if (age && (age < 18 || age > 150)) {
    return { isValid: false, message: "Age must be between 18 and 150" };
  }
  return { isValid: true, message: "", sanitizedData: age };
};

const validateGender = (gender: string): ValidationResult => {
  if (
    gender &&
    !["male", "female", "others", "prefer not to say"].includes(
      gender.toLowerCase()
    )
  ) {
    return {
      isValid: false,
      message: "Gender must be one of: male, female, others, prefer not to say",
    };
  }
  return { isValid: true, message: "", sanitizedData: gender?.toLowerCase() };
};

const validateSkills = (skills: string[]): ValidationResult => {
  if (skills && skills.length > 10) {
    return { isValid: false, message: "Maximum 10 skills allowed" };
  }
  if (skills && skills.some((skill) => skill.length > 30)) {
    return {
      isValid: false,
      message: "Each skill cannot exceed 30 characters",
    };
  }
  return { isValid: true, message: "", sanitizedData: skills };
};

const validateBio = (bio: string): ValidationResult => {
  if (bio && bio.length > 200) {
    return { isValid: false, message: "Bio cannot exceed 200 characters" };
  }
  return { isValid: true, message: "", sanitizedData: bio };
};

const validatePhotoURL = (photoURL: string): ValidationResult => {
  if (photoURL && !validator.isURL(photoURL)) {
    return {
      isValid: false,
      message: "Photo URL must be a valid HTTP/HTTPS URL",
    };
  }
  return { isValid: true, message: "", sanitizedData: photoURL };
};

// Combined validation functions
export const validateUserRegistration = (data: UserData): ValidationResult => {
  // Validate required fields
  const firstNameValidation = validateFirstName(data.firstName || "");
  if (!firstNameValidation.isValid) {
    return firstNameValidation;
  }

  const emailValidation = validateEmail(data.emailId || "");
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(data.password || "");
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // Validate optional fields if provided
  const lastNameValidation = data.lastName
    ? validateLastName(data.lastName)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!lastNameValidation.isValid) {
    return lastNameValidation;
  }

  const ageValidation = data.age
    ? validateAge(data.age)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!ageValidation.isValid) {
    return ageValidation;
  }

  const genderValidation = data.gender
    ? validateGender(data.gender)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!genderValidation.isValid) {
    return genderValidation;
  }

  const skillsValidation = data.skills
    ? validateSkills(data.skills)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!skillsValidation.isValid) {
    return skillsValidation;
  }

  const bioValidation = data.bio
    ? validateBio(data.bio)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!bioValidation.isValid) {
    return bioValidation;
  }

  const photoURLValidation = data.photoURL
    ? validatePhotoURL(data.photoURL)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!photoURLValidation.isValid) {
    return photoURLValidation;
  }

  // Prepare sanitized data
  const sanitizedData: any = {
    firstName: firstNameValidation.sanitizedData,
    emailId: emailValidation.sanitizedData,
    password: passwordValidation.sanitizedData,
  };

  // Add optional fields only if they were provided and validated
  if (lastNameValidation.sanitizedData !== undefined)
    sanitizedData.lastName = lastNameValidation.sanitizedData;
  if (ageValidation.sanitizedData !== undefined)
    sanitizedData.age = ageValidation.sanitizedData;
  if (genderValidation.sanitizedData !== undefined)
    sanitizedData.gender = genderValidation.sanitizedData;
  if (skillsValidation.sanitizedData !== undefined)
    sanitizedData.skills = skillsValidation.sanitizedData;
  if (bioValidation.sanitizedData !== undefined)
    sanitizedData.bio = bioValidation.sanitizedData;
  if (photoURLValidation.sanitizedData !== undefined)
    sanitizedData.photoURL = photoURLValidation.sanitizedData;

  return {
    isValid: true,
    message: "",
    sanitizedData,
  };
};

export const validateUserUpdate = (data: UserData): ValidationResult => {
  const firstNameValidation = data.firstName
    ? validateFirstName(data.firstName)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!firstNameValidation.isValid) {
    return firstNameValidation;
  }

  const lastNameValidation = data.lastName
    ? validateLastName(data.lastName)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!lastNameValidation.isValid) {
    return lastNameValidation;
  }

  const ageValidation = data.age
    ? validateAge(data.age)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!ageValidation.isValid) {
    return ageValidation;
  }

  const genderValidation = data.gender
    ? validateGender(data.gender)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!genderValidation.isValid) {
    return genderValidation;
  }

  const skillsValidation = data.skills
    ? validateSkills(data.skills)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!skillsValidation.isValid) {
    return skillsValidation;
  }

  const bioValidation = data.bio
    ? validateBio(data.bio)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!bioValidation.isValid) {
    return bioValidation;
  }

  const photoURLValidation = data.photoURL
    ? validatePhotoURL(data.photoURL)
    : { isValid: true, message: "", sanitizedData: undefined };
  if (!photoURLValidation.isValid) {
    return photoURLValidation;
  }

  const sanitizedData: any = {};
  if (firstNameValidation.sanitizedData !== undefined)
    sanitizedData.firstName = firstNameValidation.sanitizedData;
  if (lastNameValidation.sanitizedData !== undefined)
    sanitizedData.lastName = lastNameValidation.sanitizedData;
  if (ageValidation.sanitizedData !== undefined)
    sanitizedData.age = ageValidation.sanitizedData;
  if (genderValidation.sanitizedData !== undefined)
    sanitizedData.gender = genderValidation.sanitizedData;
  if (skillsValidation.sanitizedData !== undefined)
    sanitizedData.skills = skillsValidation.sanitizedData;
  if (bioValidation.sanitizedData !== undefined)
    sanitizedData.bio = bioValidation.sanitizedData;
  if (photoURLValidation.sanitizedData !== undefined)
    sanitizedData.photoURL = photoURLValidation.sanitizedData;

  return {
    isValid: true,
    message: "",
    sanitizedData,
  };
};

export { validateEmail, validatePassword };
