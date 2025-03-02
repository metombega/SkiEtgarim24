import { Volunteer } from "./user";
import { StartReport, EndReport } from "./reports";
import { ActivityEquipment, Boat } from "./equipment";

export interface Activity {
    date: Date;
    status: string;
    skiType: string;
    surfer: string;
    numberOfAdditionalSurfers: number;
    numberOfAdditionalGuests: number;
    activityManager: string;
    volunteers: string[];
    startTime: string;
    endTime: string;
    // startReport: StartReport;
    // endReport: EndReport;
    // equipments: ActivityEquipment[];
    // boat: Boat;
    availableVolunteers: string[];
}
const activityStatuses = ["Initialized", "Volunteers Assigned", "Surfer Assigned", "Finished", "Canceled"];