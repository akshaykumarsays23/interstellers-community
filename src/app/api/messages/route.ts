import { NextResponse } from 'next/server';
import { getDb, saveDb, DbMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const messagesByThread = db.messages || {};
    return NextResponse.json({ messages: messagesByThread });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, threadId, messageId, senderId, senderHandle, senderName, text, mediaUrl, timestamp, time, requestedBy, requestedByName } = body;

    if (!threadId) {
      return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
    }

    const db = getDb();
    if (!db.messages) {
      db.messages = {};
    }

    if (!db.messages[threadId]) {
      db.messages[threadId] = [];
    }

    const threadMsgs = db.messages[threadId];

    if (action === 'send') {
      if (!text && !mediaUrl) {
        return NextResponse.json({ error: 'Message content empty' }, { status: 400 });
      }

      const newMsg: DbMessage = {
        id: messageId || `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
        senderId: senderId || 'unknown',
        senderHandle: senderHandle || 'unknown',
        senderName: senderName || 'Explorer',
        text: text || '',
        mediaUrl: mediaUrl || '',
        timestamp: timestamp || 'Just now',
        time: time || 'Just now',
        status: 'sent',
      };

      threadMsgs.push(newMsg);
      saveDb(db);
      return NextResponse.json({ success: true, message: newMsg, allMessages: db.messages });
    }

    if (action === 'request_delete') {
      if (!messageId || !requestedBy) {
        return NextResponse.json({ error: 'Missing messageId or requestedBy' }, { status: 400 });
      }

      const msgIndex = threadMsgs.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        threadMsgs[msgIndex].deleteRequest = {
          requestedBy,
          requestedByName: requestedByName || requestedBy,
          status: 'pending',
        };
        saveDb(db);
        return NextResponse.json({ success: true, allMessages: db.messages });
      }
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (action === 'accept_delete') {
      if (!messageId) {
        return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
      }

      // Both users accepted deletion -> remove permanently
      db.messages[threadId] = threadMsgs.filter((m) => m.id !== messageId);
      saveDb(db);
      return NextResponse.json({ success: true, deletedId: messageId, allMessages: db.messages });
    }

    if (action === 'reject_delete') {
      if (!messageId) {
        return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
      }

      const msgIndex = threadMsgs.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        delete threadMsgs[msgIndex].deleteRequest;
        saveDb(db);
        return NextResponse.json({ success: true, allMessages: db.messages });
      }
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (action === 'mark_read') {
      const userHandle = body.userHandle || senderHandle;
      if (db.messages[threadId]) {
        let updated = false;
        db.messages[threadId].forEach((m) => {
          if (m.senderHandle !== userHandle && m.senderId !== senderId && m.status !== 'read') {
            m.status = 'read';
            updated = true;
          }
        });
        if (updated) {
          saveDb(db);
        }
      }
      return NextResponse.json({ success: true, allMessages: db.messages });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing message action:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
