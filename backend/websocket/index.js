const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.connections = new Map(); // userId -> Set of WebSocket connections
        this.rooms = new Map(); // roomId -> Set of userIds
        this.userRooms = new Map(); // userId -> Set of roomIds
        
        this.init();
    }
    
    init() {
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
        
        // Cleanup interval
        setInterval(() => {
            this.cleanup();
        }, 30000); // 30 seconds
        
        console.log('🔌 WebSocket server initialized');
    }
    
    async handleConnection(ws, req) {
        try {
            // Extract token from query params or headers
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token') || req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                ws.close(1008, 'Authentication required');
                return;
            }
            
            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user details
            const userResult = await pool.query(
                'SELECT id, name, email FROM users WHERE id = $1',
                [decoded.id]
            );
            
            if (userResult.rows.length === 0) {
                ws.close(1008, 'Invalid user');
                return;
            }
            
            const user = userResult.rows[0];
            ws.userId = user.id;
            ws.user = user;
            ws.isAlive = true;
            
            // Add to connections
            if (!this.connections.has(user.id)) {
                this.connections.set(user.id, new Set());
            }
            this.connections.get(user.id).add(ws);
            
            // Setup ping/pong
            ws.on('pong', () => {
                ws.isAlive = true;
            });
            
            // Handle messages
            ws.on('message', (data) => {
                this.handleMessage(ws, data);
            });
            
            // Handle disconnection
            ws.on('close', () => {
                this.handleDisconnection(ws);
            });
            
            // Send welcome message
            this.sendToUser(user.id, {
                type: 'connected',
                message: 'WebSocket connected successfully',
                userId: user.id,
                timestamp: new Date().toISOString()
            });
            
            console.log(`User ${user.name} (${user.id}) connected via WebSocket`);
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            ws.close(1011, 'Authentication failed');
        }
    }
    
    handleMessage(ws, data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'join_room':
                    this.joinRoom(ws, message.roomId);
                    break;
                    
                case 'leave_room':
                    this.leaveRoom(ws, message.roomId);
                    break;
                    
                case 'website_edit':
                    this.handleWebsiteEdit(ws, message);
                    break;
                    
                case 'cursor_move':
                    this.handleCursorMove(ws, message);
                    break;
                    
                case 'text_change':
                    this.handleTextChange(ws, message);
                    break;
                    
                case 'element_select':
                    this.handleElementSelect(ws, message);
                    break;
                    
                case 'ai_request':
                    this.handleAIRequest(ws, message);
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                default:
                    console.warn(`Unknown message type: ${message.type}`);
            }
            
        } catch (error) {
            console.error('Message handling error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    }
    
    handleDisconnection(ws) {
        if (ws.userId) {
            const userConnections = this.connections.get(ws.userId);
            if (userConnections) {
                userConnections.delete(ws);
                if (userConnections.size === 0) {
                    this.connections.delete(ws.userId);
                }
            }
            
            // Leave all rooms
            const userRooms = this.userRooms.get(ws.userId);
            if (userRooms) {
                userRooms.forEach(roomId => {
                    this.leaveRoom(ws, roomId);
                });
            }
            
            console.log(`User ${ws.userId} disconnected`);
        }
    }
    
    joinRoom(ws, roomId) {
        if (!roomId || !ws.userId) return;
        
        // Add user to room
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(ws.userId);
        
        // Add room to user
        if (!this.userRooms.has(ws.userId)) {
            this.userRooms.set(ws.userId, new Set());
        }
        this.userRooms.get(ws.userId).add(roomId);
        
        // Notify room members
        this.broadcastToRoom(roomId, {
            type: 'user_joined',
            userId: ws.userId,
            userName: ws.user.name,
            roomId: roomId,
            timestamp: new Date().toISOString()
        }, ws.userId);
        
        // Send room info to user
        const roomUsers = Array.from(this.rooms.get(roomId) || [])
            .map(userId => {
                const userWs = this.getUserWebSocket(userId);
                return userWs ? { id: userId, name: userWs.user.name } : null;
            })
            .filter(Boolean);
            
        ws.send(JSON.stringify({
            type: 'room_joined',
            roomId: roomId,
            users: roomUsers,
            timestamp: new Date().toISOString()
        }));
        
        console.log(`User ${ws.userId} joined room ${roomId}`);
    }
    
    leaveRoom(ws, roomId) {
        if (!roomId || !ws.userId) return;
        
        // Remove user from room
        const room = this.rooms.get(roomId);
        if (room) {
            room.delete(ws.userId);
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
        }
        
        // Remove room from user
        const userRooms = this.userRooms.get(ws.userId);
        if (userRooms) {
            userRooms.delete(roomId);
            if (userRooms.size === 0) {
                this.userRooms.delete(ws.userId);
            }
        }
        
        // Notify room members
        this.broadcastToRoom(roomId, {
            type: 'user_left',
            userId: ws.userId,
            userName: ws.user.name,
            roomId: roomId,
            timestamp: new Date().toISOString()
        }, ws.userId);
        
        console.log(`User ${ws.userId} left room ${roomId}`);
    }
    
    handleWebsiteEdit(ws, message) {
        const { websiteId, action, data, elementId } = message;
        
        // Broadcast to other users editing the same website
        this.broadcastToRoom(`website_${websiteId}`, {
            type: 'website_edit',
            userId: ws.userId,
            userName: ws.user.name,
            websiteId: websiteId,
            action: action,
            data: data,
            elementId: elementId,
            timestamp: new Date().toISOString()
        }, ws.userId);
        
        // Save to database (auto-save)
        this.saveWebsiteChange(websiteId, ws.userId, action, data, elementId);
    }
    
    handleCursorMove(ws, message) {
        const { websiteId, position, elementId } = message;
        
        // Broadcast cursor position to other users
        this.broadcastToRoom(`website_${websiteId}`, {
            type: 'cursor_move',
            userId: ws.userId,
            userName: ws.user.name,
            position: position,
            elementId: elementId,
            timestamp: new Date().toISOString()
        }, ws.userId);
    }
    
    handleTextChange(ws, message) {
        const { websiteId, elementId, content, cursorPosition } = message;
        
        // Broadcast text changes for real-time collaboration
        this.broadcastToRoom(`website_${websiteId}`, {
            type: 'text_change',
            userId: ws.userId,
            userName: ws.user.name,
            elementId: elementId,
            content: content,
            cursorPosition: cursorPosition,
            timestamp: new Date().toISOString()
        }, ws.userId);
    }
    
    handleElementSelect(ws, message) {
        const { websiteId, elementId, properties } = message;
        
        // Broadcast element selection
        this.broadcastToRoom(`website_${websiteId}`, {
            type: 'element_select',
            userId: ws.userId,
            userName: ws.user.name,
            elementId: elementId,
            properties: properties,
            timestamp: new Date().toISOString()
        }, ws.userId);
    }
    
    async handleAIRequest(ws, message) {
        const { websiteId, requestType, prompt, context } = message;
        
        try {
            // Notify room that AI is processing
            this.broadcastToRoom(`website_${websiteId}`, {
                type: 'ai_processing',
                userId: ws.userId,
                userName: ws.user.name,
                requestType: requestType,
                status: 'processing',
                timestamp: new Date().toISOString()
            });
            
            // This would connect to your AI service
            // For now, we'll simulate a response
            setTimeout(() => {
                this.broadcastToRoom(`website_${websiteId}`, {
                    type: 'ai_response',
                    userId: ws.userId,
                    userName: ws.user.name,
                    requestType: requestType,
                    response: 'AI response placeholder',
                    status: 'completed',
                    timestamp: new Date().toISOString()
                });
            }, 2000);
            
        } catch (error) {
            console.error('AI request error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'AI request failed'
            }));
        }
    }
    
    async saveWebsiteChange(websiteId, userId, action, data, elementId) {
        try {
            // Auto-save changes to database
            await pool.query(`
                INSERT INTO website_changes (
                    website_id, user_id, action, data, element_id, created_at
                )
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [websiteId, userId, action, JSON.stringify(data), elementId]);
            
        } catch (error) {
            console.error('Save website change error:', error);
        }
    }
    
    sendToUser(userId, message) {
        const userConnections = this.connections.get(userId);
        if (userConnections) {
            const messageStr = JSON.stringify(message);
            userConnections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(messageStr);
                }
            });
        }
    }
    
    broadcastToRoom(roomId, message, excludeUserId = null) {
        const room = this.rooms.get(roomId);
        if (room) {
            const messageStr = JSON.stringify(message);
            room.forEach(userId => {
                if (userId !== excludeUserId) {
                    this.sendToUser(userId, message);
                }
            });
        }
    }
    
    getUserWebSocket(userId) {
        const userConnections = this.connections.get(userId);
        if (userConnections && userConnections.size > 0) {
            return Array.from(userConnections)[0]; // Return first connection
        }
        return null;
    }
    
    // Send notification to user
    sendNotification(userId, notification) {
        this.sendToUser(userId, {
            type: 'notification',
            notification: notification,
            timestamp: new Date().toISOString()
        });
    }
    
    // Broadcast system message
    broadcastSystem(message) {
        this.connections.forEach((userConnections) => {
            userConnections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'system_message',
                        message: message,
                        timestamp: new Date().toISOString()
                    }));
                }
            });
        });
    }
    
    // Get online users count
    getOnlineUsersCount() {
        return this.connections.size;
    }
    
    // Get room info
    getRoomInfo(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        
        const users = Array.from(room).map(userId => {
            const ws = this.getUserWebSocket(userId);
            return ws ? { id: userId, name: ws.user.name } : null;
        }).filter(Boolean);
        
        return {
            roomId: roomId,
            userCount: room.size,
            users: users
        };
    }
    
    // Cleanup inactive connections
    cleanup() {
        const inactiveConnections = [];
        
        this.connections.forEach((userConnections, userId) => {
            userConnections.forEach(ws => {
                if (!ws.isAlive) {
                    inactiveConnections.push({ userId, ws });
                } else {
                    ws.isAlive = false;
                    ws.ping();
                }
            });
        });
        
        // Remove inactive connections
        inactiveConnections.forEach(({ userId, ws }) => {
            this.handleDisconnection(ws);
        });
        
        if (inactiveConnections.length > 0) {
            console.log(`Cleaned up ${inactiveConnections.length} inactive WebSocket connections`);
        }
    }
    
    // Get statistics
    getStats() {
        return {
            totalConnections: Array.from(this.connections.values())
                .reduce((sum, connections) => sum + connections.size, 0),
            uniqueUsers: this.connections.size,
            activeRooms: this.rooms.size,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = WebSocketManager;
