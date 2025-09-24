// Simple in-memory SSE event bus (per server instance)

const subscribers = new Set<ReadableStreamDefaultController>()

function enqueue(controller: ReadableStreamDefaultController, data: any) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
}

export function register(controller: ReadableStreamDefaultController) {
  subscribers.add(controller)
}

export function unregister(controller: ReadableStreamDefaultController) {
  subscribers.delete(controller)
}

export function publish(event: any) {
  for (const sub of Array.from(subscribers)) {
    try { enqueue(sub, event) } catch { subscribers.delete(sub) }
  }
}

export function send(controller: ReadableStreamDefaultController, event: any) {
  enqueue(controller, event)
}


