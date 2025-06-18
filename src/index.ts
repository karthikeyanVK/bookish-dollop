import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'; // Adjust if incorrect
import { ar } from 'zod/v4/locales';

const tools = [
    {
        name: 'get_all_books',
        description: 'list all list of books without id or filter'
        // inputSchema: {
        //     type: 'object',
        //     properties: {
        //         name: {
        //             type: 'string',
        //             description: 'books that you want to get'
        //         }
        //     },
        //     required: ['name']
        // }
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
// TypeScript model of our routes

// Server instance
const server = new Server({ name: 'book-api-mcp', version: '1.0.0' }, { capabilities: { resources: {}, tools: {} } });
// Define tool schema using zod
const BookSchema = z.object({
    name: z.string().describe('book name to search for')
});
// List all controller methods as MCP resources
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('ListToolsRequestSchema accessed');
    return {
        tools
    };
});

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
