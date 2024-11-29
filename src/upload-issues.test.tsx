import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createServer } from "node:http";

const nodeServer = createServer((req, res) => {
  // Add CORS headers
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  if (req.method === "OPTIONS") {
    res.end();
    return;
  }

  if (req.url === "/upload" && req.method === "POST") {
    res.end(JSON.stringify({ success: true }));
  } else {
    res.end("Hello World!\n");
  }
});

const mswServer = setupServer();
mswServer.use(
  http.post("/upload", () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  })
);

function makeXhrRequest(method: string, url: string, file?: File) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data')
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
  describe("node", () => {
    beforeAll(() => {
      nodeServer.listen(3000, "127.0.0.1", () => {
        console.log("Server is running on http://127.0.0.1:3000");
      });
    });

    afterAll(() => nodeServer.close());

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

  describe("msw", () => {
    beforeAll(() => {
      mswServer.listen({ onUnhandledRequest: "error" });
    });

    afterEach(() => mswServer.resetHandlers());

    afterAll(() => mswServer.close());

    it("handles POST file upload", async () => {
      const file = new File(["{}"], "test.json", { type: "application/json" });
      const response = await makeXhrRequest("POST", "/upload", file);
      expect(JSON.parse(response)).toEqual({ success: true });
    });
  });
});
