import axios from "axios";

/**
 * @param depPlaceId
 * @param arrPlaceId
 * @param depPlandTime yyyyMMdd
 */
export default function findAvailableTrain(
  depPlaceId: string,
  arrPlaceId: string,
  depPlandTime: string,
) {
  return axios.get(
    `http://apis.data.go.kr/1613000/TrainInfoService/getStrtpntAlocFndTrainInfo?serviceKey=${process.env.NEXT_PUBLIC_KORAIL_API_KEY}&pageNo=1&numOfRows=10&_type=json&depPlaceId=${depPlaceId}&arrPlaceId=${arrPlaceId}&depPlandTime=${depPlandTime}&trainGradeCode=00`,
  );
}
