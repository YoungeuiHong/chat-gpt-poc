"use client";
import OpenAI from "openai";
import { useEffect, useState } from "react";
import { ChatCompletionTool } from "openai/src/resources/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources";
import Dictaphone from "@/components/Dictaphone";

interface Train {
  trainNumber: string;
  departureCity: string;
  destinationCity: string;
  departureTime: Date;
}

// 더메 데이터
const trainsDatabase: Train[] = [
  {
    trainNumber: "123",
    departureCity: "서울",
    destinationCity: "부산",
    departureTime: new Date(2024, 4, 8, 17, 30),
  },
  {
    trainNumber: "456",
    departureCity: "서울",
    destinationCity: "부산",
    departureTime: new Date(2024, 4, 8, 19),
  },
  {
    trainNumber: "789",
    departureCity: "서울",
    destinationCity: "부산",
    departureTime: new Date(2024, 4, 8, 21, 30),
  },
];

export default function Home() {
  // Chat GPT 응답
  const [answer, setAnswer] = useState<string | null>("");
  // 인식된 음성 스크립트
  const [transcript, setTranscript] = useState("");
  // 현재 사용자가 말하고 있는지 여부
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // 출발지
  const [departure, setDeparture] = useState<string>("");
  // 도착지
  const [destination, setDestination] = useState<string>("");
  // 열차 번호
  const [trainNumber, setTrainNumber] = useState<string>("");
  // SpeechSynthesis
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  // 대화 내역
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content:
        "민수는 기차역에서 근무하는 직원이야. 할아버지, 할머니께서 모르시는 걸 친절히 알려드려야 해.",
    },
  ]);

  // OpenAI 객체 생성
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Chat GPT가 호출할 수 있는 함수 목록 정의
  const tools: Array<ChatCompletionTool> = [
    {
      type: "function",
      function: {
        name: "findAvailableTrains",
        description:
          "기차 출발지, 도착지, 출발 시간을 알려주면 예매 가능한 열차를 알아봐주는 함수. ",
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
            departureTime: {
              type: "string",
              // TODO: Chat GPT가 오늘 날짜를 제대로 파악하지 못하는 것 같음.
              description:
                "출발 시간. 날짜는 오늘 날짜로 하고, JavaScript의 Date 객체 생성 파라미터로 넣을 수 있는 형태의 string으로 주세요.",
            },
          },
          required: ["departure", "destination", "departureTime"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "reserveTrain",
        description:
          "user가 예매하고 싶은 열차의 번호를 말하면 예매해주는 함수",
        parameters: {
          type: "object",
          properties: {
            train: {
              type: "string",
              description: "예매하려고 하는 열차의 번호",
            },
          },
          required: ["train"],
        },
      },
    },
  ];

  // Chat GPT에게 질문하는 함수
  async function askChatGpt() {
    // 인식된 음성을 대화내역에 추가
    messages.push({
      role: "user",
      content: transcript,
    });

    // Chat GPT API로 요청 보내기
    const response = await openai.chat.completions.create({
      messages: messages,
      // model: "ft:gpt-3.5-turbo-1106:personal:fine-tuning-test-1:9M9K8KzC",
      model: "gpt-3.5-turbo-0613",
      tools: tools,
    });

    const responseMessage = response.choices[0].message;
    setAnswer(responseMessage?.content);

    // Chat GPT의 응답이 Function Calling인 경우
    if (responseMessage.tool_calls) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === "findAvailableTrains") {
          const parsed = JSON.parse(toolCall.function.arguments);
          const result = findAvailableTrains(
            parsed.departure,
            parsed.destination,
            parsed.departureTime,
          );

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        } else if (toolCall.function.name === "reserveTrain") {
          const parsed = JSON.parse(toolCall.function.arguments);
          const result = reserveTrain(parsed);

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });

          const response2 = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo",
            tools: tools,
          });

          setAnswer(response2?.choices[0]?.message?.content);
        }
      }
    }
  }

  // 예매 가능한 열차를 찾는 함수
  function findAvailableTrains(
    departureCity: string,
    destinationCity: string,
    departureTime: string,
  ): Train[] {
    const availableTrains: Train[] = [];

    setDeparture(departureCity);
    setDestination(destinationCity);

    const departureDate = new Date(departureTime);
    for (const train of trainsDatabase) {
      if (
        train.departureCity === departureCity &&
        train.destinationCity === destinationCity &&
        train.departureTime.getTime() > departureDate.getTime()
      ) {
        availableTrains.push(train);
      }
    }

    return availableTrains;
  }

  // 열차를 예매해주는 함수
  function reserveTrain(train: any) {
    console.log("예약하려는 기차: ", train);
    setTrainNumber(train.train);
    return "예약 성공";
  }

  // Chat GPT의 응답을 음성으로 출력해주는 함수
  const playMessage = () => {
    const utterance = new SpeechSynthesisUtterance(answer ?? "");
    utterance.rate = 1.1;
    const synth = window.speechSynthesis;
    setSynth(synth);
    synth.speak(utterance);
  };

  // 음성 출력 중단하고 싶을 떄
  const stopPlayMessage = () => {
    if (synth) {
      synth.cancel();
    }
  };

  // 사용자가 말하는 게 중단되면 Chat GPT로 API 요청을 보냄
  useEffect(() => {
    if (!isSpeaking && transcript) {
      askChatGpt();
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (answer && !isSpeaking) {
      playMessage();
    }
  }, [answer]);

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handleSpeakingChange = (speakingStatus: boolean) => {
    setIsSpeaking(speakingStatus);
  };

  return (
    <main>
      <Dictaphone
        onTranscriptChange={handleTranscriptChange}
        onSpeakingChange={handleSpeakingChange}
      />
      <p style={{ marginTop: "20px" }}>응답: {answer}</p>
      <p>출발지: {departure}</p>
      <p>도착지: {destination}</p>
      <p>열차번호: {trainNumber}</p>
      <button onClick={stopPlayMessage}>재생 중지</button>
    </main>
  );
}
