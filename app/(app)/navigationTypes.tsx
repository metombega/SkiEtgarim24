import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  SurfersManagement: undefined;
  surfer_details: { id: string };
  VolunteersManagement: undefined;
  volunteer_details: { id: string };
  volunteer: { id: string };
  surfer: { id: string };
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
export type VolunteerRouteProp = RouteProp<RootStackParamList, "volunteer">;
export type VolunteerNavigationProp = StackNavigationProp<
  RootStackParamList,
  "volunteer"
>;
export type SurferRouteProp = RouteProp<RootStackParamList, "surfer">;
export type SurferNavigationProp = StackNavigationProp<
  RootStackParamList,
  "surfer"
>;
