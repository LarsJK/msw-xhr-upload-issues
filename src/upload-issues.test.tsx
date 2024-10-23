import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const server = setupServer()

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
	server.resetHandlers()
})

afterAll(() => {
	server.close()
})

function makeXhrRequest(method: string, url: string, file?: File) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.open(method, url, true)

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(xhr.response)
			} else {
				reject({
					status: xhr.status,
					statusText: xhr.statusText,
				})
			}
		}

		xhr.onerror = () => {
			reject({
				status: xhr.status,
				statusText: xhr.statusText,
			})
		}

		if (file) {
			const fileData = new FormData()
			fileData.append('file', file)
			xhr.send(fileData)
		} else {
			xhr.send()
		}
	})
}

describe('upload-issues', () => {
	beforeEach(() => {
		server.use(
			http.post('/upload', () => {
				return HttpResponse.json({ success: true }, { status: 200 })
			}),
		)
	})

	it('handles JSON POST request', async () => {
		const response = await makeXhrRequest('POST', '/upload')
		expect(JSON.parse(response)).toStrictEqual({ success: true })
	})

	it('handles POST file upload', async () => {
		const file = new File(['{}'], 'test.json', { type: 'application/json' })
		const response = await makeXhrRequest('POST', '/upload', file)
		expect(JSON.parse(response)).toEqual({ success: true })
	})
})
