export type Sex = "M" | "F";  

export interface User {
  id: string;
  username: string;
  password: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  height: number;
  age: number;
  sex: Sex;
  emergencyContact: EmergencyContact;
}

export interface Volunteer extends User {
  sittingSizeMessure: number;
  floatingBeltSize: number;
  joinYear: number;
  senioretyYears: number;
  abilities: VolunteerAbility[];
  certifications: Certification[];
}

export interface VolunteerAbility {
  type: string;
  rank: number;
  comments: string;
}

export interface Certification {
  exists: boolean;
  type: string;
  comments: string;
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
}
