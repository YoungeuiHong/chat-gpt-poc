export interface SearchTrainRequestBody {
  departure: string;
  destination: string;
  date: string;
  time?: string;
}

export interface SearchTrainResponse {
  train_type: string;
  train_type_name: string;
  train_group: string;
  train_no: string;
  delay_time: string;
  dep_name: string;
  dep_code: string;
  dep_date: string;
  dep_time: string;
  arr_name: string;
  arr_code: string;
  arr_date: string;
  arr_time: string;
  run_date: string;
  reserve_possible: string;
  reserve_possible_name: string;
  special_seat: string;
  general_seat: string;
  wait_reserve_flag: number;
}

export interface ReserveTrainRequestBody {
  departure: string;
  destination: string;
  date: string;
  time: string;
}

export interface TicketInfo {
  departure: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  price: string;
}
