export type condition = "New" | "Good" | "Poor" | "Damaged";

export class boat {
    id: number;
    name: string;
    type: string;
    engineTime: number;
    ongoingTreatment: string;
    lastTest: Date;
    nextTest: Date;
    malfunctions: Array<string>;
    patrolLeft: number;

    constructor(id: number, name: string, type: string, engineTime: number, ongoingTreatment: string, lastTest: Date, nextTest: Date, malfunctions: Array<string>, patrolLeft: number) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.engineTime = engineTime;
        this.ongoingTreatment = ongoingTreatment;
        this.lastTest = lastTest;
        this.nextTest = nextTest;
        this.malfunctions = malfunctions;
        this.patrolLeft = patrolLeft;
    }
}

export class ActivityEquipment {
    subject: string;
    quantity: number;
    condition: condition;
    remarks: string;
    constructor(subject: string, quantity: number, condition: condition, remarks: string) {
        this.subject = subject;
        this.quantity = quantity;
        this.condition = condition;
        this.remarks = remarks;
    }
}

