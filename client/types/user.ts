enum Sex {
  Male,
  Female,
}

class User {
  id: string;
  username: string;
  password: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  age: number;
  sex: Sex;
  emergencyContact: EmergencyContact;

  constructor(
    id: string,
    username: string,
    password: string,
    phoneNumber: string,
    email: string,
    fullName: string,
    age: number,
    sex: Sex,
    emergencyContact: EmergencyContact
  ) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.fullName = fullName;
    this.age = age;
    this.sex = sex;
    this.emergencyContact = emergencyContact;
  }
}


class Volunteer extends User {
  hight: number;
  sittingSizeMessure: number;
  floatingBeltSize: number;
  joinYear: number;
  senioretyYears: number;

  constructor(
    id: string,
    username: string,
    password: string,
    phoneNumber: string,
    email: string,
    fullName: string,
    age: number,
    sex: Sex,
    hight: number,
    sittingSizeMessure: number,
    floatingBeltSize: number,
    joinYear: number,
    senioretyYears: number,
    emergencyContact: EmergencyContact,
    abilities: VolunteerAbility[],
    certifications: Certification[],
    comments: string,
    experience: string
  ) {
    super(id, username, password, phoneNumber, email, fullName, age, sex, emergencyContact);
    this.hight = hight;
    this.sittingSizeMessure = sittingSizeMessure;
    this.floatingBeltSize = floatingBeltSize;
    this.joinYear = joinYear;
    this.senioretyYears = senioretyYears;
    this.emergencyContact = emergencyContact;
  }
}

class VolunteerAbility {
  type: string;
  rank: number;
  comments: string;

  constructor(type: string, rank: number, comments: string) {
    if (rank < 1 || rank > 9) {
      throw new Error("Rank must be between 1 and 9");
    }

    this.type = type;
    this.rank = rank;
    this.comments = comments;
  }
}

class Certification {
  exists: boolean;
  type: string;
  comments: string;

  constructor(exists: boolean, type: string, comments: string) {
    this.exists = exists;
    this.type = type;
    this.comments = comments;
  }
}

class EmergencyContact {
  name: string;
  phoneNumber: string;

  constructor(name: string, phoneNumber: string) {
    this.name = name;
    this.phoneNumber = phoneNumber;
  }
}
