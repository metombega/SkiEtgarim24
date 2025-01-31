import { Volunteer } from "./user";
import { StartReport, EndReport } from "./reports";
import { ActivityEquipment, Boat } from "./equipment";

export interface Activity {
    id: string;
    date: string;
    ski_type: string;
    surfer: string;
    number_of_additional_surfers: number;
    number_of_additional_guests: number;
    activity_manager: string;
    volunteers: Volunteer[];
    startTime: string;
    endTime: string;
    start_report: StartReport;
    end_report: EndReport;
    equipments: ActivityEquipment[];
    boat: Boat;
}
