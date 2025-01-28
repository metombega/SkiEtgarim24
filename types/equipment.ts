export type condition = "New" | "Good" | "Poor" | "Damaged";

export interface Boat {
    id: number;
    name: string;
    type: string;
    engineTime: number;
    ongoingTreatment: string;
    lastTest: Date;
    nextTest: Date;
    malfunctions: Array<string>;
    patrolLeft: number;
}

export interface ActivityEquipment {
    subject: string;
    quantity: number;
    condition: condition;
    remarks: string;
}

