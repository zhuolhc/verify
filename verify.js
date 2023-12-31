// 验证码验证网页
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'GET') {
    // 返回验证码填写页面
    const htmlResponse = generateVerificationPage();
    return new Response(htmlResponse, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  } else if (request.method === 'POST') {
    // 处理验证码验证逻辑
    const formData = await request.formData();
    const userCode = formData.get('verificationCode');
    const storedCode = await getCodeFromKV();

    if (userCode === storedCode) {
      // 验证成功，可以进入第二个网站(以百度为例，测试下来第一个是静态页面，多点几下就是官方页面)
      return fetch('https://www.baidu.com');
    } else {
      // 验证失败，返回错误提示页面
      const errorHtml = generateErrorHTML();
      return new Response(errorHtml, {
        headers: { 'Content-Type': 'text/html' },
        status: 401
      });
    }
  } else {
    // 不支持的请求方法
    return new Response('Method Not Allowed', { status: 405 });
  }
}

async function getCodeFromKV() {
  // 使用 Cloudflare Workers KV API 从 KV 中获取验证码
  const storedValue = await yzm.get('verificationCode');
  return storedValue ? storedValue : '';
}

function generateVerificationPage() {
  // 构建验证码填写页面的 HTML 内容
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>验证码验证</title>
      </head>
      <body>
        <h1>请输入验证码：</h1>
        <form method="post">
          <input type="text" name="verificationCode" required>
          <button type="submit">提交</button>
        </form>
      </body>
    </html>
  `;
}

function generateErrorHTML() {
  // 构建错误提示的 HTML 内容
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>验证码验证失败</title>
      </head>
      <body>
        <h1>验证码验证失败</h1>
        <p>验证码错误。</p>
      </body>
    </html>
  `;
}
