import axios from 'axios';

// fetcher를 여러개 만들어서 사용할 수 있다. (여러 방면에서 사용해야 유용)
// -> 다양하게 만들어서 그때그때 사용할 수 있도록
// const fetcher = (url: string) => axios.get(url, {
//   withCredentials: true
// }).then(response => response.data.length); // 데이터를 변조해서 넘겨받는 다던가. 비동기에만 국한되지 않고 사용하면 좋다.

// useSWR에서 넘긴 주소가 url로 넘어옴
 
const fetcher = (url: string) => axios.get(url, {
  // back, front 서버 주소가 다르면(도메인이 다르면) cookie 전달이 안되는 문제 발생
  // -> withCredentials: true로 설정하기
  // -> 쿠키는 보통 서버가 만들고, 프론트는 저장하거나 요청이 필요할때 사용한다.
  withCredentials: true
}).then(response => response.data);

// get, post, put, delete 든 데이터를 가져오고, 이것을 swr이 저장한다.
// 어떤 요청이 아닌 요청을 보냈을때 데이터를 저장하는게 중요함
const fetcherPost = (url: string) => axios.post(url, {
  withCredentials: true
}).then(response => response.data); 

export default fetcher;