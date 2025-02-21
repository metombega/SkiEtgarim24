import { Volunteer } from "./user";
import { StartReport, EndReport } from "./reports";
import { ActivityEquipment, Boat } from "./equipment";

export interface Activity {
    date: string;
    status: string;
    skiType: string;
    surfer: string;
    numberOfAdditionalSurfers: number;
    numberOfAdditionalGuests: number;
    activityManager: string;
    volunteers: Volunteer[];
    startTime: string;
    endTime: string;
    startReport: StartReport;
    endReport: EndReport;
    equipments: ActivityEquipment[];
    boat: Boat;
}
const activityStatuses = ["Initialized", "Volunteers Assigned", "Surfer Assigned", "Finished", "Canceled"];