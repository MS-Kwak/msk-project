// api.js 또는 관련 파일
const localUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL;
const prodUrl = process.env.NEXT_PUBLIC_API_URL_PROD;

// 배포판 환경인지 분기해서 URL 선택
const apiBaseUrl =
  process.env.NODE_ENV === 'production' ? prodUrl : localUrl;

export default apiBaseUrl;
