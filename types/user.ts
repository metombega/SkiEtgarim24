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
  sittingChairNumber: number;
  sittingSizeMessure: number;
  sittingPosition: number;
  floatingBeltSize: string;
  joinYear: number;
  senioretyYears: number;
}

export interface Volunteer extends ApprovedUser {
  abilities: VolunteerAbility[];
  certifications: VolunteerCertification[];
  isActivityManager: boolean;
  isAdministrator: boolean;
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
  kenSkiAbilities: SurferAbility[];
  twoSkiesAbilities: SurferAbility[];
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
export const surferAbilitiesTypes = ['ken_ski', 'ken_ski_crack', 'ken_ski_carbon', 'two_skies_fifty_six', 'two_skies_small', 'surf_ski', 'wikboard', 'slalum'];
export const twoSkiesAbilitiesTypes = ['standing_with_two_with_tbar', 'standing_with_two_with_separate_bar', 'standing_alone'];
export const kenSkiAbilitiesTypes = ['sitting_with_two', 'sitting_with_one', 'sitting_alone'];
export const volunteerAbilitiesTypes = ['standing_with_one', 'standing_alone', 'sitting_with_one', 'sitting_alone'];
export const volunteerCertificationsTypes = ['activity_manager', 'ski_instructor', 'skipper', 'driver', 'paramedic'];