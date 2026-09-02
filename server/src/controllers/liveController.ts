import { Request, Response } from "express";

type ClientResponse = {
  id: string;
  res: Response;
};

// Map of quizId -> connected client responses for waiting room
const quizWaitingClients = new Map<string, ClientResponse[]>();

// Map of quizId -> connected admin responses for live monitoring
const adminMonitorClients = new Map<string, ClientResponse[]>();

/**
 * SSE endpoint for users in the Waiting Room:
 * /api/live/quiz/:id
 */
export const subscribeQuizLive = (req: Request, res: Response) => {
  const { id } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = `${Date.now()}-${Math.random()}`;
  const client: ClientResponse = { id: clientId, res };

  if (!quizWaitingClients.has(id)) {
    quizWaitingClients.set(id, []);
  }
  quizWaitingClients.get(id)!.push(client);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: "connected", quizId: id })}\n\n`);

  req.on("close", () => {
    const list = quizWaitingClients.get(id) || [];
    quizWaitingClients.set(
      id,
      list.filter((c) => c.id !== clientId)
    );
  });
};

/**
 * SSE endpoint for Admin live monitoring:
 * /api/live/admin/:id
 */
export const subscribeAdminLive = (req: Request, res: Response) => {
  const { id } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = `${Date.now()}-${Math.random()}`;
  const client: ClientResponse = { id: clientId, res };

  if (!adminMonitorClients.has(id)) {
    adminMonitorClients.set(id, []);
  }
  adminMonitorClients.get(id)!.push(client);

  res.write(`data: ${JSON.stringify({ type: "admin_connected", quizId: id })}\n\n`);

  req.on("close", () => {
    const list = adminMonitorClients.get(id) || [];
    adminMonitorClients.set(
      id,
      list.filter((c) => c.id !== clientId)
    );
  });
};

/**
 * Broadcast status change (e.g. Admin started or ended the quiz)
 */
export const broadcastQuizStatusChange = (quizId: string, status: string, message?: string) => {
  const clients = quizWaitingClients.get(quizId) || [];
  const payload = JSON.stringify({
    type: "status_change",
    quizId,
    status,
    message: message || `Quiz status updated to ${status}`,
    timestamp: new Date(),
  });

  clients.forEach((c) => {
    try {
      c.res.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });
};

/**
 * Broadcast live event to Admin (e.g. participant submitted or recorded violation)
 */
export const broadcastAdminEvent = (quizId: string, eventType: string, data: any) => {
  const clients = adminMonitorClients.get(quizId) || [];
  const payload = JSON.stringify({
    type: eventType,
    quizId,
    data,
    timestamp: new Date(),
  });

  clients.forEach((c) => {
    try {
      c.res.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });
};
