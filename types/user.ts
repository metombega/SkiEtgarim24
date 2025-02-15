export interface User {
  id: string;
  username: string;
  password: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  height: number;
  age: number;
  sex: string;
  emeregencyContactName: string;
  emeregencyContactPhoneNumber: string;
}


export interface ApprovedUser extends User {
  sittingSizeMessure: number;
  sittingPosition: number;
  floatingBeltSize: string;
  joinYear: number;
  senioretyYears: number;
}

export interface Volunteer extends ApprovedUser {
  abilities: VolunteerAbility[];
  certifications: VolunteerCertification[];
}

export interface VolunteerAbility {
  type: string;
  rank: number;
  comments: string;
}

export interface VolunteerCertification {
  type: string;
  exists: boolean;
  comments: string;
}

export interface Surfer extends ApprovedUser {
  ropeType: string;
  surfingSpeed: number;
  abilities: SurferAbility[];
  specialEquipment: string;
  shoulderHarness: boolean;
  paddle: boolean;
  floats: boolean;
}

export interface SurferAbility {
  type: string;
  exists: boolean;
  comments: string;
}

// create a const list of fake abilities
export const surferAbilitiesTypes = ['standing', 'kneeling', 'sitting', 'lying'];