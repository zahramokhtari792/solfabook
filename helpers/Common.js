import { Dimensions, Platform, ToastAndroid } from "react-native";
import Constants from "expo-constants";
import { toJalaali } from 'jalaali-js';
import dayjs from 'dayjs';


var jalaali = require('jalaali-js');

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

export const appName = () => {
    return Constants?.expoConfig?.name;
}

export const appVersion = () => {
    return Constants?.expoConfig?.version;
}

export const getColumnsCount = () => {
    if (deviceWidth >= 1024) {
        //desktop
        return 4;
    } else if (deviceWidth >= 768) {
        //tablet
        return 3;
    } else {
        //phone
        return 2;
    }
}

export const getImageSize = (height, width) => {
    if (height > width) {
        //portrait
        return 300;
    } else if (height < width) {
        //landscape
        return 250;
    } else {
        //square
        return 200;
    }
}

export const generateUniqueCode = () => {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000); // عدد تصادفی بین 0 تا 9999
    const uniqueCode = timestamp + randomPart;
    return uniqueCode.toString().slice(-10); // 10 رقم آخر را برمی‌گرداند
}

// Helper function to calculate contrast ratio
export const calculateContrastRatio = (bgColor, textColor) => {
  // Convert hex colors to RGB values
  const bgRgb = hexToRgb(bgColor);
  const textRgb = hexToRgb(textColor);
  // Calculate luminance for background and text
  const bgLum = (0.2126 * bgRgb.r + 0.7152 * bgRgb.g + 0.0722 * bgRgb.b) / 255;
  const textLum = (0.2126 * textRgb.r + 0.7152 * textRgb.g + 0.0722 * textRgb.b) / 255;
  // Calculate contrast ratio
  const contrastRatio = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
  return contrastRatio;
}

// Helper function to convert hex color to RGB
export const hexToRgb = (hex)=> {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    g: parseInt(result[3], 16)
  } : null;
}

export const cleanText = (text) => text?.replace(/(<([^>]+)>)/gi, "")?.replace(/\&nbsp;/g, '')?.replace(/\&ldquo;/g, '')?.replace(/\&rdquo;/g, '')?.replace(/\&hellip;/g, '')?.replace(/\&zwnj;/g, '‌')?.replace(/\&raquo;/g, '')?.replace(/\&laquo;/g, '')?.replace(/\&quot;/g, '');

export const showToastOrAlert = (message) => {
    Platform.OS === 'android' ? ToastAndroid.show(message, ToastAndroid.SHORT) : alert(message);
};

export const formatPrice =  (text) => text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatDateTime = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    
    // گرفتن ساعت و دقیقه
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${jy}/${jm}/${jd} - ${hours}:${minutes}`;
};

export const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return `${jy}/${jm}/${jd}`;
  };

const weekDaysFa = [
    'یکشنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنجشنبه',
    'جمعه',
    'شنبه',
];
  
const persianMonths = [
    '',
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
];

const padZero = (num) => (num < 10 ? `0${num}` : `${num}`);

export const getNext20DaysJalaali = () => {
    const days = [];
    for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay();
        const jDate = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const weekday = weekDaysFa[dayOfWeek];
        const monthName = persianMonths[jDate.jm];
        const day = jDate.jd;
        const value = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
        days.push({
          id: i + 1,
          weekday: weekday,
          date: `${day} ${monthName}`,
          value: value,
        });
    }
    return days;
};

export function generateTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
  
    const parseTime = (timeStr) => {
      const [h, m] = timeStr?.split(':').map(Number);
      return [h, m];
    };
  
    let [startHour, startMinute] = parseTime(startTime);
    let [endHour, endMinute] = parseTime(endTime);
  
    let start = new Date();
    start.setHours(startHour, startMinute, 0, 0);
  
    let end = new Date();
    end.setHours(endHour, endMinute, 0, 0);
  
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    let id = 1;
    while (start <= end) {
      const hours = start?.getHours()?.toString()?.padStart(2, '0');
      const minutes = start?.getMinutes()?.toString()?.padStart(2, '0');
      slots.push({id: id, value: `${hours}:${minutes}`});
      start = new Date(start.getTime() + intervalMinutes * 60000);
      id++
    }
  
    return slots;
}

export function isMoreThan4HoursFromNow(dateString, timeString) {
    const targetDateTime = new Date(`${dateString}T${timeString}:00`);
    const now = new Date();
    const diffMs = targetDateTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 4;
}
  
export const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export const handleError = (error) => {
    try {
      if (error?.response?.status == 409) {
        const message = error?.response?.data?.message || "خطایی رخ داد";
        showToastOrAlert(`${message}`);
      } else if (error?.response?.status == 401) {
        showToastOrAlert('لطفا وارد شوید.');
      } else {
        showToastOrAlert('یک خطای غیرمنتظره رخ داده است.');
      }
    } catch (e) {
      showToastOrAlert(`خطای اتصال به اینترنت`);
    }
  };


// یک تاریخ نمونه (مثلاً "2025-05-30")
export const calculateDaysDifference = (targetDate) => {
  const now = dayjs();
  const givenDate = dayjs(targetDate);
  const diffInDays = now.diff(givenDate, 'day');
  return diffInDays;
};
  
////////////////////////////////////////////////////////////////////////////////

// function generateCode(id){
//     const codeElement = document.getElementById('code-'+id);
//     const copyElement = document.getElementById('copyBtn-'+id);
//     const generateElement = document.getElementById('generateBtn-'+id);
    
//     const randomLetters = generateRandomLetters(3);
//     const randomNumbers = generateRandomNumbers(8);
//     const code = ${randomLetters}-${randomNumbers};
    
//     generateElement.style.display = 'none';
//     copyElement.style.display = 'block';
//     codeElement.textContent = code;
    
//     useCode(id, code);
// }

// function generateRandomLetters(length) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));   
//     }
//     return result;
// }

// function generateRandomNumbers(length)
// {
//     return Math.floor(10 ** length * Math.random()).toString().padStart(length, '0');
// }


