# MCP Book API Integration

## Prerequisites - Installation

1. Node Js Latest version
2. Git 
3. Run `npm install -g nodemon` in git bash
4. Install Visual Studio Code

## Start Configuring MCP Server 

### Step 1: Clone this repository in any working folder and navigate to bookish-dollop folder. 

![alt text](img/image.png)

### Step 2: Open bookish-dollop in Visual studio code run `npm install` in the terminal 

## Step 3: Run `nodemon' in the terminal

## Step 4: Open new browser and navigate to http://localhost:12345/books/get/all , it should display results as below.

![alt text](img/image.png)

## Step 5: Navigate to  index.ts & Copy below line of code for the mcp[Code for initializing tools and server]


```
const tools = [
    {
        name: 'get_all_books',
        description: 'list all list of books without id or filter'
    },
    {
        name: 'get_books_by_id',
        description: 'get books based on id',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'get books by id'
                }
            },
            required: ['id']
        }
    }
];
// Server instance
const server = new Server({ name: 'book-api-mcp', version: '1.0.0' }, { capabilities: { resources: {}, tools: {} } });
```

Step 6: Copy below code to initialize the stdio server

``` 
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('Server started and listening on stdio');
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main(); 

```

## Step 7: Copy below code that lists the tools that is part of our books 

```
// List all controller methods as MCP resources
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('ListToolsRequestSchema accessed');
    return {
        tools
    };
});

```

## Step 8: Open one more termial in VS Code and run `npm run build`



## Step 11: Press ctrl+shift+p, and then settings.json and then select "Open user settings"
![alt text](img/image10.png)

## Step 12: Copy the below configuration in settings.json, at the end before braces, 

```
  "mcp": {
    "inputs": [],
    "servers": {
      "books-mcp-server": {
        "command": "node",
        "args": [
          "D:/Karthik/sample/books-api-mcp-server/build/src/index.js"
        ]
      }
    }
  }
```

## Step 13: Navigate to your build/src folder in your VSCode of bookish-dollop and get the index.js path and update books-mcp-server args mcp.json

## Step 14: Click on the start button.

![alt text](img/image-5.png)

## Step 7: Install github co-pilot in visual studio code 

![alt text](img/image-1.png)


## Step 8: Lets test github copilot by asking date

![alt text](img/image11.png)

## Step 9: Change the mode from ask to Agent in github copilot

![alt text](img/image12.png)

## Step 18: Ask for get all books(make sure localhost is still running)

## Step 19: You should discovered 2 tools. You can see that in output terminal.

![alt text](img/image-6.png)

## Now navigate to index.ts and add tools that needs to be used.

```

// ---------- Utility Handlers ----------

async function handleGetAllBooks() {
    console.error('get_all_books called');
    const url = `http://localhost:12345/books/get/all`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Books API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
        data.length = Math.min(data.length, 10); // First 10 books
    }

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }
        ]
    };
}

async function handleGetBookById(id: any) {
    console.error('get_books_by_id called with id:', id);
    const url = `http://localhost:12345/books/get/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Books API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }
        ]
    };
}

// ---------- MCP Handler ----------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error('CallToolRequestSchema accessed:', request.params);

    try {
        const toolName = request.params.name;
        const args = request.params.arguments || {};

        switch (toolName) {
            case 'get_all_books':
                return await handleGetAllBooks();

            case 'get_books_by_id':
                if (!args.id) {
                    throw new Error('Missing required argument: id');
                }
                return await handleGetBookById(args.id);
            default:
                throw new Error(`Unknown tool name: ${toolName}`);
        }
    } catch (error) {
        console.error('Error during CallToolRequest:', error);
        throw new Error('Failed to process tool call');
    }
});

```

## Step 20: Build the code by running `npm run build`

## Step 21: Click on restart

![alt text](img/image-7.png)

## Step 22: Type 'get all books' in copilot window

## Step 23: click on continue when asked. 

![alt text](img/image-8.png)

## you should see books listed, you can ask for book with id

![alt text](img/image-9.png)