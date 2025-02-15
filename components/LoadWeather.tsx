import React, { useEffect } from 'react';

interface WeatherData {
  [key: string]: string;
}

interface DateInfoMap {
  [key: string]: string[];
}

interface LoadWeatherProps {
  setDateInfoMap: React.Dispatch<React.SetStateAction<DateInfoMap>>;
  baseTime: string;
  latitude: string;
  longitude: string;
}

const LoadWeather: React.FC<LoadWeatherProps> = ({ setDateInfoMap, baseTime, latitude, longitude }) => {
  useEffect(() => {
    const fetchWeather = async () => {
      // 오늘 날짜 갖고오기
      const date = new Date();
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const initDate = `${year}${month}${day}`;
      console.log(initDate);
      const apiKey = process.env.DATAGOKR_APIKEY // 인코딩된 인증키
      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${initDate}&base_time=${baseTime}&nx=${latitude}&ny=${longitude}`;

      // API 호출 및 데이터 처리
      const response = await fetch(url);
      const data = await response.json();
      const items = data.response.body.items.item;
      
      const skyValues: WeatherData = {};
      const popValues: WeatherData = {};
      const rehValues: WeatherData = {};
      const tmxValues: WeatherData = {};
      const tmnValues: WeatherData = {};

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
        } else if (category === 'TMX') {
          const datetime = fcstDate + fcstTime;
          tmxValues[datetime] = fcstValue;
        } else if (category === 'TMN') {
          const datetime = fcstDate + fcstTime;
          tmnValues[datetime] = fcstValue;
        }
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
          const tmxInfo = `최고기온: ${tmxValues[datetime]}°C`;
          const tmnInfo = `최저기온: ${tmnValues[datetime]}°C`;

          if (!newDateInfoMap[datePart]) {
            newDateInfoMap[datePart] = [];
          }

          newDateInfoMap[datePart].push(skyInfo);
          newDateInfoMap[datePart].push(popInfo);
          newDateInfoMap[datePart].push(rehInfo);
          newDateInfoMap[datePart].push(tmxInfo);
          newDateInfoMap[datePart].push(tmnInfo);
        }
      }

      setDateInfoMap(newDateInfoMap);
    };

    fetchWeather();
  }, [setDateInfoMap, baseTime, latitude, longitude]);

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

  return null;
};

export default LoadWeather;