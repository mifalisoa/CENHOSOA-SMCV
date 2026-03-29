// backend/src/config/socket.ts
//
// LEÇON : On utilise le pattern Singleton pour le serveur Socket.io.
// Un seul serveur partagé dans toute l'application.
// Les controllers peuvent l'importer pour émettre des événements.

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ],
      credentials: true,
    },
    // Reconnexion automatique côté client
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connecté: ${socket.id}`);

    // LEÇON : Chaque utilisateur rejoint sa propre "room" identifiée par son id_user.
    // On peut ainsi émettre des notifications ciblées à un utilisateur spécifique.
    socket.on('join', (userId: number) => {
      socket.join(`user_${userId}`);
      console.log(`👤 [Socket.io] User ${userId} a rejoint sa room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] Client déconnecté: ${socket.id}`);
    });
  });

  return io;
}

// Retourne l'instance Socket.io — utilisé dans les controllers
export function getIO(): Server {
  if (!io) throw new Error('Socket.io non initialisé — appeler initSocketIO() en premier');
  return io;
}