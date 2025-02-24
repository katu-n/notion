// ----------------------- LINE -----------------------------
function doPost(e) {
  // スクリプトプロパティに格納したLINE Messaging APIのチャネルアクセストークンを取得
  let Line_token = 'write your LINE token';

  // 取得したJSONデータを取得
  let json = JSON.parse(e.postData.contents);

  //取得したデータから、応答用のトークン・メッセージを取得
  let replyToken = json.events[0]?.replyToken;
  let message = json.events[0]?.message.text;
 
  //google scriptにlogをとる
  log(json);

  // メッセージを改行ごとに分ける
  let splitedMessage_base = message.split(/\r\n|\n/);

  // Notionにデータを追加
  let result = addDataToNotion(splitedMessage_base);

  // 応答メッセージ用のAPI URLを定義
  let url = 'https://api.line.me/v2/bot/message/reply';

  if (result[0] != 200 && result[0] != 201) {
    //ユーザーからの投稿メッセージから応答メッセージを用意
    let replyMessage = "エラーにより失敗しました。\nエラー情報：" + result[0] + result[1];

    // payloadに返信用トークンとメッセージを設定
    let payload = {
      'replyToken': replyToken,
      'messages': [{
          'type': 'text',
          'text': replyMessage
        }]
    };

    // optionsにPOST設定、チャネルトークン、jsonを設定
    let options = {
      'payload' : JSON.stringify(payload),
      'method'  : 'POST',
      'headers' : {"Authorization" : "Bearer " + Line_token},
      'contentType' : 'application/json'
    };

    //LINE Messaging APIにリクエストし返信
    UrlFetchApp.fetch(url, options);
  } else {
    //ユーザーからの投稿メッセージから応答メッセージを用意
    let replyMessage = "登録しました！\r\nURLをチェック：https://www.notion.so/1a44eba2565b801f82f8d3677a3fa82b?v=1a44eba2565b80bd825f000cf869bf39";

    // payloadに返信用トークンとメッセージを設定
    let payload = {
      'replyToken': replyToken,
      'messages': [{
          'type': 'text',
          'text': replyMessage
        }]
    };

    // optionsにPOST設定、チャネルトークン、jsonを設定
    let options = {
      'payload' : JSON.stringify(payload),
      'method'  : 'POST',
      'headers' : {"Authorization" : "Bearer " + Line_token},
      'contentType' : 'application/json'
    };

    //LINE Messaging APIにリクエストし返信
    UrlFetchApp.fetch(url, options);
  }
}


//---------------- Notion ---------------------------------- 
function addDataToNotion(splitedMessage) {    // splitedMessageとしてLINEで入力された値が来る

  //トークンを取得
  const dbId = 'write your notion databese id';
  const token = 'write your notion API token'

  const apiUrl = 'https://api.notion.com/v1/pages';
  
  const obj = generateObj(dbId, splitedMessage);

  // optionsに必要な情報を設定
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "Authorization": "Bearer " + token,
      "Notion-Version": '2022-06-28',
    },
    payload: JSON.stringify(obj),
    muteHttpExceptions:true, //エラーでもレスポンスを獲得できるようにする
  };
  //NotionAPIにポストでアクセスし、DBにデータを挿入
  try {
    let response = UrlFetchApp.fetch(apiUrl, options);
    let resultCode = response.getResponseCode();
    let resultText = response.getContentText("UTF-8");
    
    //console.log("HTTPSステータスコード:", resultCode);
    //console.log("レスポンス内容:",resultText);

    // 成功か失敗かのjudge
    if (resultCode === 200 || resultCode === 201) {
      return [resultCode,resultText];
    } else {
      return [resultCode,resultText];
    }
  } catch (e) {
    // エラー文を返却
    let result = e;
    return result;
  }
}

function generateObj(dbId, splitedMessage){
  let title = splitedMessage[0];
  let text= splitedMessage[1];
  let url = splitedMessage[2]||null;
  let date = Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd");

    let properties = {
   "作成日":{
    "date":{
      "start":date
      }
    },
    "タイトル": {
      "title": [{
        "text": {
          "content": title
        }
      }]
    },
    "メモ": {
      "rich_text": [{
        "text": {
          "content": text
        }
      }]
    },
  "リンク":url ? {"url":url}:undefined
  }

  //undefined のプロパティを削除
  Object.keys(properties).forEach(key =>{
    if(properties[key] === undefined){
      delete properties[key];
    }
  })

  return {
    parent:{database_id:dbId},
    properties:properties
  };

}

//--------------- option function ------------------------
const sheetId = "write your sheet Id";

function log(json){
 let logsheet = SpreadsheetApp.openById(sheetId).getSheetByName("log");

  if (json.events) {
    json.events.forEach((event) => {
      if (event.type === "message") {
        let userID = event.source.userId;
        let message = event.message.text;
        let timestamp = new Date(event.timestamp);

        //スプレッドシートに記録
        if (logsheet) logsheet.appendRow([userID, message, timestamp]);
      }
    });
  }
}
