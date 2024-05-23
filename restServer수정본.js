const http = require('http'); // HTTP 모듈을 불러와 HTTP 서버를 생성
const fs = require('fs').promises; // 파일 시스템 모듈을 불러와 프로미스 기반의 파일 작업 사용
const path = require('path'); // 경로 조작을 위한 모듈 불러오기

const users = {}; // 사용자 데이터를 저장할 객체
const userPin = '1016';

// HTTP 서버 생성
http.createServer(async (req, res) => {
  try {
    // GET 요청 처리
    if (req.method === 'GET') {
      if (req.url === '/') {
        // 루트 경로 요청 시 restFront.html 파일 제공
        const data = await fs.readFile(path.join(__dirname, 'restFront.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/about') {
        // /about 경로 요청 시 about.html 파일 제공
        const data = await fs.readFile(path.join(__dirname, 'about.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/users') {
        // /users 경로 요청 시 users 객체를 JSON 형식으로 제공
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(users));
      }

      // 위에 해당하지 않는 경우, 요청된 파일을 제공
      try {
        const data = await fs.readFile(path.join(__dirname, req.url));
        return res.end(data);
      } catch (err) {
        // 파일을 찾지 못하면 404 Not Found 응답
      }
    } 
    // POST 요청 처리
    else if (req.method === 'POST') {
        if (req.url === '/user') {
            let body = '';
            // 요청의 body를 스트림 형식으로 받음
            req.on('data', (data) => {
                body += data;
            });
            // 요청의 body를 다 받은 후 실행됨
            req.on('end', () => {
                try {
                    const { pin , name} = JSON.parse(body);
                    if (pin === userPin) {
                        const id = Date.now(); // 현재 시간을 ID로 사용
                        users[id] = name; // 사용자 데이터 저장
                        res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
                        res.end('등록 성공');
                    } else {
                        res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
                        res.end('핀번호가 올바르지 않습니다.');
                    } 
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                    return res.end('잘못된 요청입니다.');
                }  
            });
        }
    }
    
    // PUT 요청 처리
    else if (req.method === 'PUT') {
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2]; // URL에서 사용자 ID 추출
        let body = '';
        req.on('data', (data) => {
          body += data;
        });
        return req.on('end', () => {
          console.log('PUT 본문(Body):', body);
          users[key] = JSON.parse(body).name; // 사용자 데이터 수정
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end(JSON.stringify(users));
        });
      }
    } 
    // DELETE 요청 처리
    else if (req.method === 'DELETE') {
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2]; // URL에서 사용자 ID 추출
        delete users[key]; // 사용자 데이터 삭제
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(JSON.stringify(users));
      }
    }
    // 해당하지 않는 경로 요청 시 404 Not Found 응답
    res.writeHead(404);
    return res.end('NOT FOUND');
  } catch (err) {
    // 서버 에러 발생 시 500 Internal Server Error 응답
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(err.message);
  }
})
// 서버를 8082 포트에서 대기
.listen(8082, () => {
  console.log('8082번 포트에서 서버 대기 중입니다');
});
