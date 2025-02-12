import React, { useState } from 'react';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Location {
  [city: string]: {
    [district: string]: { x: number; y: number };
  };
}

const locationData: Location = {
  "서울특별시": {
    "강남구": { x: 61, y: 126 },
    "강동구": { x: 62, y: 126 },
    "강북구": { x: 61, y: 128 },
    "강서구": { x: 58, y: 126 },
    "관악구": { x: 59, y: 125 },
    "광진구": { x: 62, y: 126 },
    "구로구": { x: 58, y: 125 },
    "금천구": { x: 59, y: 124 },
    "노원구": { x: 61, y: 129 },
    "도봉구": { x: 61, y: 129 },
    "동대문구": { x: 61, y: 127 },
    "동작구": { x: 59, y: 125 },
    "마포구": { x: 59, y: 127 },
    "서대문구": { x: 59, y: 127 },
    "서초구": { x: 61, y: 125 },
    "성동구": { x: 61, y: 127 },
    "성북구": { x: 61, y: 127 },
    "송파구": { x: 62, y: 126 },
    "양천구": { x: 58, y: 126 },
    "영등포구": { x: 58, y: 126 },
    "용산구": { x: 60, y: 126 },
    "은평구": { x: 59, y: 127 },
    "종로구": { x: 60, y: 127 },
    "중구": { x: 60, y: 127 },
    "중랑구": { x: 62, y: 128 }
  },
  "부산광역시": {
    "강서구": { x: 96, y: 76 },
    "금정구": { x: 98, y: 77 },
    "기장군": { x: 100, y: 77 },
    "남구": { x: 98, y: 75 },
    "동구": { x: 98, y: 75 },
    "동래구": { x: 98, y: 76 },
    "부산진구": { x: 97, y: 75 },
    "북구": { x: 96, y: 76 },
    "사상구": { x: 96, y: 75 },
    "사하구": { x: 96, y: 74 },
    "서구": { x: 97, y: 74 },
    "수영구": { x: 99, y: 75 },
    "연제구": { x: 98, y: 76 },
    "영도구": { x: 98, y: 74 },
    "중구": { x: 97, y: 74 },
    "해운대구": { x: 99, y: 75 }
  },
  "강원특별자치도": {
    "강릉시": { x: 92, y: 131 },
    "고성군": { x: 85, y: 145 },
    "동해시": { x: 97, y: 127 },
    "삼척시": { x: 98, y: 125 },
    "속초시": { x: 87, y: 141 },
    "양구군": { x: 77, y: 139 },
    "양양군": { x: 88, y: 138 },
    "영월군": { x: 86, y: 119 },
    "원주시": { x: 76, y: 122 },
    "인제군": { x: 80, y: 138 },
    "정선군": { x: 89, y: 123 },
    "철원군": { x: 65, y: 139 },
    "춘천시": { x: 73, y: 134 },
    "태백시": { x: 95, y: 119 },
    "평창군": { x: 84, y: 123 },
    "홍천군": { x: 75, y: 130 },
    "화천군": { x: 72, y: 139 },
    "횡성군": { x: 77, y: 125 }
  },
  "세종특별자치시": {
    "세종특별자치시": { x: 66, y: 103 }
  },
  "제주특별자치도": {
    "서귀포시": { x: 52, y: 33 },
    "제주시": { x: 53, y: 38 }
  }
};


interface WeatherData {
  [key: string]: string;
}

interface DateInfoMap {
  [key: string]: string[];
}

export default function Home() {
  const [latitude, setLatitude] = useState<string | null>(null); // 서울의 위도
  const [longitude, setLongitude] = useState<string | null>(null); // 서울의 경도
  const [baseTime, setBaseTime] = useState<string>('0500');
  const [dateInfoMap, setDateInfoMap] = useState<DateInfoMap>({});

  const handleLocationChange = (city: string, district: string) => {
    const location = locationData[city][district];
    setLatitude(location.x.toString());
    setLongitude(location.y.toString());
  };

  const fetchWeather = async () => {
    if (!latitude || !longitude) {
      alert("위치 정보를 선택해 주세요.");
      return;
    }

    // 오늘 날짜 갖고오기
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const initDate = `${year}${month}${day}`;
    console.log(initDate);
    const apiKey = '공공데이터포털 인증키'; // 인코딩된 인증키
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${initDate}&base_time=${baseTime}&nx=${latitude}&ny=${longitude}`;

    // API 호출 및 데이터 처리
    const response = await fetch(url);
    const data = await response.json();
    const items = data.response.body.items.item;
    
    const skyValues: WeatherData = {};
    const popValues: WeatherData = {};
    const rehValues: WeatherData = {};
    // const tmxValues: WeatherData = {};
    // const tmnValues: WeatherData = {};

    for (const item of items) {
      const category = item.category;
      const fcstValue = item.fcstValue;
      const fcstTime = item.fcstTime;
      const fcstDate = item.fcstDate;

      if (category === 'SKY') {
        const datetime = fcstDate + fcstTime;
        skyValues[datetime] = getSkyDescription(fcstValue);
      } else if (category === 'POP') {
        const datetime = fcstDate + fcstTime;
        popValues[datetime] = fcstValue;
      } else if (category === 'REH') {
        const datetime = fcstDate + fcstTime;
        rehValues[datetime] = fcstValue;
      } 
      // else if (category === 'TMX') {
        // const datetime = fcstDate + fcstTime;
        // tmxValues[datetime] = fcstValue;
      // } else if (category === 'TMN') {
        // const datetime = fcstDate + fcstTime;
        // tmnValues[datetime] = fcstValue;
      // }
    }

    const newDateInfoMap: DateInfoMap = {};

    for (const datetime in skyValues) {
      if (datetime.endsWith("0600") || datetime.endsWith("1200") || datetime.endsWith("1800")) {
        const monthVal = datetime.slice(4, 6);
        const dayVal = datetime.slice(6, 8);
        const timeVal = datetime.slice(8, 10);

        const datePart = `${monthVal}월 ${dayVal}일`;
        const skyInfo = `${timeVal}시 - SKY: ${skyValues[datetime]}`;
        const popInfo = `강수확률: ${popValues[datetime]}%`;
        const rehInfo = `습도: ${rehValues[datetime]}%`;
        // const tmxInfo = `최고기온: ${tmxValues[datetime]}°C`;
        // const tmnInfo = `최저기온: ${tmnValues[datetime]}°C`;

        if (!newDateInfoMap[datePart]) {
          newDateInfoMap[datePart] = [];
        }

        newDateInfoMap[datePart].push(skyInfo);
        newDateInfoMap[datePart].push(popInfo);
        newDateInfoMap[datePart].push(rehInfo);
        // newDateInfoMap[datePart].push(tmxInfo);
        // newDateInfoMap[datePart].push(tmnInfo);
      }
    }

    setDateInfoMap(newDateInfoMap);
  };

  function getSkyDescription(skyValue: string): string {
    switch (skyValue) {
      case "1":
        return "맑음";
      case "3":
        return "구름많음";
      case "4":
        return "흐림";
      default:
        return "알 수 없음";
    }
  }

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">날씨 정보 가져오기</h1>
        <div>
          <select onChange={(e) => {
            const [city, district] = e.target.value.split(' ');
            if (city && district) {
              handleLocationChange(city, district);
            }
          }} required>
            <option value="">지역 선택</option>
            {Object.keys(locationData).map(city => (
              Object.keys(locationData[city]).map(district => (
              <option key={`${city} ${district}`} value={`${city} ${district}`}>
                {city} {district}
              </option>
              ))
            ))}
          </select>
          {/* <input
            type="text"
            placeholder="기준 시간"
            value={baseTime}
            onChange={(e) => setBaseTime(e.target.value)}
          /> */}
          <button onClick={fetchWeather}>날씨 정보 가져오기</button>
        </div>
        <div className="date-info grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(dateInfoMap).map(datePart => (
            <div key={datePart} className="bg-white shadow-md rounded-lg p-4">
              <h4 className="text-xl font-semibold mb-2">{datePart}</h4>
              {dateInfoMap[datePart].map((info, index) => (
                <p key={index} className="text-gray-700">{info}</p>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}