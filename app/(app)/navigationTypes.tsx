import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  SurfersManagement: undefined;
  surfer_details: { id: string };
  VolunteersManagement: undefined;
  volunteer_details: { id: string };
  activity_day: { date: string };
};

export type SurferDetailsRouteProp = RouteProp<
  RootStackParamList,
  "surfer_details"
>;
export type SurferDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "surfer_details"
>;
export type VolunteerDetailsRouteProp = RouteProp<
  RootStackParamList,
  "volunteer_details"
>;
export type VolunteerDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "volunteer_details"
>;
export type ActivityDayRouteProp = RouteProp<
  RootStackParamList,
  "activity_day"
>;
export type ActivityDayNavigationProp = StackNavigationProp<
  RootStackParamList,
  "activity_day"
>;
