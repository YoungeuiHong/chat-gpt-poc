import { ChatCompletionTool } from "openai/src/resources/chat/completions";

/**
 * TODO: 함수 호출 단계 세분화 필요
 *
 * ex)
 *   step1: 출발지, 도착지 state 값을 셋팅하는 함수
 *   step2: 출발 날짜, 출발시간 state 값을 셋팅하는 함수
 *   step3:  예매 가능한 열차를 알아봐주는 함수.
 *   step4: 예매 API 요청 보내는 함수
 *   step5: 신용카드 인식 카메라로 사진찍고 OCR API 요청 보내는 함수
 *   step6: 생년월일이랑 카드 비밀번호 앞 두 자리 물어보는 함수
 *   step7: 결제 API 요청 보내는 함수
 */

const searchTrainTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "searchTrain",
    description:
      "기차 출발지, 도착지, 출발 날짜, 출발 시간을 알려주면 예매 가능한 열차를 알아봐주는 함수. ",
    parameters: {
      type: "object",
      properties: {
        departure: {
          type: "string",
          description: "출발지 (Departure)",
        },
        destination: {
          type: "string",
          description: "도착지 (Destination)",
        },
        departure_year: {
          type: "string",
          description: "출발 날짜의 연도 (format: yyyy)",
        },
        departure_month: {
          type: "string",
          description: "출발 날짜의 월 (format: MM)",
        },
        departure_date: {
          type: "string",
          description: "출발 날짜의 일 (format: dd)",
        },
        time: {
          type: "string",
          description: "출발 시간 (format: hhmmss)",
        },
      },
      required: ["departure", "destination"],
    },
  },
};

const reserveTrain: ChatCompletionTool = {
  type: "function",
  function: {
    name: "reserveTrain",
    description:
      "searchTrain 결과 조회된 기차를 사용자가 기차를 예매해달라고 하면 예매해주는 함수",
  },
};
export const tools: Array<ChatCompletionTool> = [searchTrainTool, reserveTrain];
