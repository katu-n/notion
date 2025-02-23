const { Client } = require("@notionhq/client")
//自身の利用するデータベースID
const databaseId = 'your-databaseId'; //write your databaseId (upper v=)

// Initializing a client
const main = async () => {
    const notion = new Client({
		auth: `your-notion-api`,
    })
      
    const response = await notion.databases.retrieve({ database_id: databaseId });
    console.log(response); 
}


main();
