const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // التأكد من أن جسم الطلب موجود قبل التحليل
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "لم يتم إرسال بيانات الطلب." })
      };
    }

    let params;
    try {
      params = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "صيغة JSON غير صالحة." })
      };
    }

    const username = params.username;
    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "مطلوب إدخال اسم المستخدم/معرف القصة." })
      };
    }

    // إرسال طلب GET لجلب الكوكيز والتوكن
    const initialResponse = await axios.get('https://leofame.com/free-instagram-story-views', {
      withCredentials: true
    });

    const setCookie = initialResponse.headers['set-cookie'];
    if (!setCookie) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "فشل الحصول على الكوكيز." })
      };
    }

    // استخراج قيمة token من الكوكيز
    let token = "";
    setCookie.forEach(cookie => {
      if (cookie.startsWith("token=")) {
        token = cookie.split(";")[0].replace("token=", "");
      }
    });

    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "لم يتم العثور على token." })
      };
    }

    // تجهيز بيانات الطلب POST
    const postData = new URLSearchParams();
    postData.append("token", token);
    postData.append("timezone_offset", "Africa/Cairo");
    postData.append("free_link", username);

    // إعداد الـ headers للطلب
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": `token=${token}`,
      "origin": "https://leofame.com",
      "referer": "https://leofame.com/free-instagram-story-views",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
    };

    // إرسال الطلب إلى API
    const postResponse = await axios.post(
      'https://leofame.com/free-instagram-story-views?api=1',
      postData.toString(),
      { headers }
    );

    // تأكد من أن postResponse.data ليست فارغة
    if (!postResponse.data) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "لم يتم استلام بيانات من API." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result: postResponse.data })
    };

  } catch (error) {
    // سجل الخطأ إذا احتجت إلى مزيد من التحليل
    console.error("Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "حدث خطأ غير متوقع." })
    };
  }
};
