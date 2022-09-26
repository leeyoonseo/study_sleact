import axios from 'axios';

// useSWR에서 넘긴 주소가 url로 넘어옴
 
const fetcher = (url: string) => axios.get(url, {
  // back, front 서버 주소가 다르면(도메인이 다르면) cookie 전달이 안되는 문제 발생
  // -> withCredentials: true로 설정하기
  // -> 쿠키는 보통 서버가 만들고, 프론트는 저장하거나 요청이 필요할때 사용한다.
  withCredentials: true
}).then(response => response.data);

export default fetcher;