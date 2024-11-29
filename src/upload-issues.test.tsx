// import { http, HttpResponse } from "msw";
// import { setupServer } from "msw/node";
import { createServer } from "node:http";

const server = createServer((req, res) => {
  // Add CORS headers
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }

  // Handle actual request
  if (req.url === "/upload" && req.method === "POST") {
    res.end(JSON.stringify({ success: true }));
  } else {
    res.end("Hello World!\n");
  }
});

// export const server = setupServer();

beforeAll(() => {
  server.listen(3000, "127.0.0.1", () => {
    console.log("Server is running on http://127.0.0.1:3000");
  });
});

afterAll(() => {
  server.close();
});

function makeXhrRequest(method: string, url: string, file?: File) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };

    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
      });
    };

    if (file) {
      const fileData = new FormData();
      fileData.append("file", file);
      xhr.send(fileData);
    } else {
      xhr.send();
    }
  });
}

describe("upload-issues", () => {
  it("handles POST file upload", async () => {
    const file = new File(["{}"], "test.json", { type: "application/json" });
    const response = await makeXhrRequest(
      "POST",
      "http://127.0.0.1:3000/upload",
      file
    );
    expect(JSON.parse(response)).toEqual({ success: true });
  });
});
