export function validateStudentId(studentId: string): string | null {
  if (!studentId || studentId.trim().length === 0) {
    return 'Student ID is required';
  }
  if (studentId.length < 3) {
    return 'Student ID must be at least 3 characters';
  }
  if (studentId.length > 20) {
    return 'Student ID must be less than 20 characters';
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.length > 100) {
    return 'Name must be less than 100 characters';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

export function validateTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.length > 200) {
    return 'Title must be less than 200 characters';
  }
  return null;
}

export function validateDescription(description: string): string | null {
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  if (description.length < 10) {
    return 'Description must be at least 10 characters';
  }
  if (description.length > 2000) {
    return 'Description must be less than 2000 characters';
  }
  return null;
}

