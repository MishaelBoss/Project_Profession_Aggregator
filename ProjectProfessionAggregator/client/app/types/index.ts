export interface RegisterFormData extends User {
  password: string;
  name?: string;
  surname?: string;
  patronymic?: string;
  phone?: string;
  about?: string;
  years?: string;
  experience?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: User;
}

export interface UserProfile extends User {
  profile: UserProfileData;
}

export interface UserProfileData {
  name: string;
  surname: string;
  patronymic: string;
  phone: string;
  about: string;
  years: string;
  experience: string;
}

export interface User {
  username: string;
  email: string;
}

export interface Company{
  id?: number;
  name_company: string;
  email_company: string;
  phone_company: string;
  address_company: string;
  image?: File | null;
}

export interface VacancyDeteils{
  id: number;
  title: string;
  JobTitle: string;
  salary: string;
  experience: string;
  graphy: string;
  watch: string;
  information?: string;
  education_information?: string;
  education_link?: string;
  education: string;
  selection: string;
  category: string;
  company_details: Company;
  // company_details: {
  //   id: number;
  //   name_company: string;
  //   email_company?: string;
  //   phone_company?: string;
  //   address_company?: string;
  //   image?: File | null;
  // };
}

export interface Vacancy {
  company: number;
  title: string;
  JobTitle: string;
  salary: string;
  experience: string;
  graphy: string;
  watch: string;
  information?: string;
  image?: File | null;
  education_information?: string;
  education_link?: string;
  education: string;
  selection: string;
  category: string;
}

export interface VacancyMember{
  id: number;
  username: string;
  email: string;
}